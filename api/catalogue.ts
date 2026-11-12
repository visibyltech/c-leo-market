export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const base = 'https://shop.cleomarkets.com/wp-json/wc/store/v1/products';
    const all: any[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= 50) {
      const response = await fetch(`${base}?per_page=100&page=${page}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'CLeoMarketCatalogueImporter/1.0' },
      });
      if (!response.ok) throw new Error(`Old catalogue returned HTTP ${response.status}`);
      const products = await response.json();
      if (!Array.isArray(products)) throw new Error('Old catalogue returned an unexpected response.');
      all.push(...products);
      totalPages = Number(response.headers.get('X-WP-TotalPages') || page);
      page += 1;
    }

    return res.status(200).json({ source: 'shop.cleomarkets.com', count: all.length, products: all });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Could not read the old C-LEO catalogue.' });
  }
}