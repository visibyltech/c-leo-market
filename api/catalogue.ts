function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function plainText(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function scrapeProducts(html: string) {
  const cards = html.match(/<li\b[^>]*class=["'][^"']*\bproduct\b[^"']*["'][\s\S]*?<\/li>/gi) || [];
  const products: any[] = [];
  for (const card of cards) {
    const link = card.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] || '';
    const imageTag = card.match(/<img\b[^>]*>/i)?.[0] || '';
    const image = imageTag.match(/(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i)?.[1] || '';
    const alt = imageTag.match(/alt=["']([^"']*)["']/i)?.[1] || '';
    const titleTag = card.match(/<(?:h2|h3)[^>]*class=["'][^"']*woocommerce-loop-product__title[^"']*["'][^>]*>([\s\S]*?)<\/(?:h2|h3)>/i)?.[1] || '';
    const name = plainText(titleTag) || decodeHtml(alt).trim();
    const text = plainText(card);
    const priceMatches = [...card.matchAll(/(?:₦|&#8358;|\bNGN\s*)([\d,]+(?:\.\d{1,2})?)/gi)].map(m => Number(m[1].replace(/,/g, ''))).filter(n => n > 0);
    const price = priceMatches.length ? Math.min(...priceMatches) : 0;
    if (!name || !link || !image || !price) continue;
    products.push({
      id: link,
      name,
      permalink: link.startsWith('http') ? link : 'https://shop.cleomarkets.com' + link,
      images: [{ src: image.startsWith('//') ? 'https:' + image : image.startsWith('/') ? 'https://shop.cleomarkets.com' + image : image }],
      prices: { price: String(Math.round(price)), regular_price: String(Math.round(price)), currency_minor_unit: 0 },
      categories: [],
      is_in_stock: !/out of stock|sold out/i.test(text),
      short_description: text,
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
    // Try WooCommerce Store API first, including WordPress' query-based REST route.
    for (const endpoint of [
      base + '/wp-json/wc/store/v1/products?per_page=100&page=1',
      base + '/?rest_route=/wc/store/v1/products&per_page=100&page=1',
    ]) {
      try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 CLeoMarketImporter/2.0' } });
        if (!response.ok) continue;
        const data = await response.json();
        if (Array.isArray(data) && data.length) {
          return res.status(200).json({ source: 'WooCommerce Store API', count: data.length, products: data });
        }
      } catch { /* Fall through to the public shop-page importer. */ }
    }

    // The live shop page is public even when its REST API route is disabled.
    const page = await fetch(base + '/shop/', { headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0 CLeoMarketImporter/2.0' } });
    if (!page.ok) throw new Error('Could not open the existing shop page (HTTP ' + page.status + ').');
    const html = await page.text();
    if (req.query?.debug === '1') return res.status(200).json({ htmlStart: html.slice(0, 18000), productClasses: [...html.matchAll(/class=["'][^"']*product[^"']*["']/gi)].slice(0, 30).map(m => m[0]) });
    const products = scrapeProducts(html);
    if (!products.length) throw new Error('The old shop page opened, but its product cards could not be read. The source site may have changed its layout.');
    return res.status(200).json({ source: 'shop.cleomarkets.com/shop', count: products.length, products });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Could not read the old C-LEO catalogue.' });
  }
}