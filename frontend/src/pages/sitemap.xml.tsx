import { GetServerSideProps } from 'next';

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Get all vehicles from the backend API
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://japandirecttrucks.com' 
    : 'http://gps-trucks-backend:3002';

  try {
    // Fetch all vehicle IDs
    const response = await fetch(`${baseUrl}/api/vehicles/sitemap`);
    const data = await response.json();
    
    const vehicles = data.success ? data.data : [];
    
    // Static pages
    const staticPages = [
      '',
      '/vehicles',
      '/manufacturers', 
      '/about',
      '/contact',
      '/export-process',
      '/login',
      '/register'
    ];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>https://japandirecttrucks.com${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${vehicles.map((vehicle: any) => `  <url>
    <loc>https://japandirecttrucks.com/vehicles/${vehicle.id}</loc>
    <lastmod>${vehicle.updated_at || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    
    // Fallback sitemap with just static pages
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>https://japandirecttrucks.com${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(fallbackSitemap);
    res.end();

    return {
      props: {},
    };
  }
};

export default SiteMap;