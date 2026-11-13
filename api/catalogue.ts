function decodeHtml(value: string) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&#8358;/g, '₦')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}
function plainText(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}
function amount(value: string) {
  const match = decodeHtml(value).match(/₦\s*([\d,]+(?:\.\d{1,2})?)/);
  return match ? Number(match[1].replace(/,/g, '')) : 0;
}
async function scrapeProducts(html: string) {
  const starts = [...html.matchAll(/<div\b[^>]*class=["']card["'][^>]*>/gi)];
  const products: any[] = [];
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i].index || 0;
    const end = i + 1 < starts.length ? (starts[i + 1].index || html.length) : html.length;
    const card = html.slice(start, end);
    const link = card.match(/location\.href=['"]([^'"]+)['"]/i)?.[1] || '';
    const imageTag = card.match(/<img\b[^>]*>/i)?.[0] || '';
    const image = imageTag.match(/(?:src|data-src)=["']([^"']+)["']/i)?.[1] || '';
    const name = plainText(card.match(/<div\b[^>]*class=["']card-title["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || '');
    const daily = amount(card.match(/class=["'][^"']*daily-starburst__amount[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
    const duration = Number(card.match(/daily-starburst__duration[^>]*>(?:[^\d]*)(\d+)\s*MONTHS/i)?.[1] || 0);
    let price = amount(card.match(/daily-starburst__old-price[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
    const permalink = link ? (link.startsWith('http') ? link : 'https://shop.cleomarkets.com' + link) : '';
    const imageUrl = image.startsWith('//') ? 'https:' + image : image.startsWith('/') ? 'https://shop.cleomarkets.com' + image : image;
    if (!name || !permalink || !imageUrl) continue;

    // If the listing card has no cash price, inspect the product detail page.
    if (!price) {
      try {
        const detail = await fetch(permalink, { headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0 CLeoMarketImporter/2.0' } });
        if (detail.ok) {
          const detailHtml = await detail.text();
          const candidates = [
            detailHtml.match(/<(?:div|span|p)[^>]*class=["'][^"']*(?:product-price|selling-price|current-price|price-amount)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>/i)?.[1] || '',
            detailHtml.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i)?.[1] || '',
          ];
          price = amount(candidates.find(Boolean) || '');
        }
      } catch { /* A product without a published cash price is not imported with a guessed price. */ }
    }
    if (!price) continue;
    const text = plainText(card);
    products.push({
      id: permalink,
      name,
      permalink,
      images: [{ src: imageUrl }],
      prices: { price: String(Math.round(price)), regular_price: String(Math.round(price)), currency_minor_unit: 0 },
      categories: [],
      is_in_stock: !/out of stock|sold out/i.test(text),
      short_description: [daily ? '₦' + daily.toLocaleString('en-NG') + ' per day' : '', duration ? duration + ' months' : ''].filter(Boolean).join(' × '),
      description: text,
    });
  }
  return products;
}
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const base = 'https://shop.cleomarkets.com';
  try {
    for (const endpoint of [
      base + '/wp-json/wc/store/v1/products?per_page=100&page=1',
      base + '/?rest_route=/wc/store/v1/products&per_page=100&page=1',
    ]) {
      try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 CLeoMarketImporter/2.0' } });
        if (!response.ok) continue;
        const data = await response.json();
        if (Array.isArray(data) && data.length) return res.status(200).json({ source: 'WooCommerce Store API', count: data.length, products: data });
      } catch { /* Try the public catalogue page below. */ }
    }
    const page = await fetch(base + '/shop/', { headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0 CLeoMarketImporter/2.0' } });
    if (!page.ok) throw new Error('Could not open the existing shop page (HTTP ' + page.status + ').');
    const html = await page.text();
    const products = await scrapeProducts(html);
    if (!products.length) throw new Error('The existing shop page loaded, but no products with a confirmed selling price and image could be imported.');
    return res.status(200).json({ source: 'shop.cleomarkets.com/shop', count: products.length, products });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Could not read the old C-LEO catalogue.' });
  }
}