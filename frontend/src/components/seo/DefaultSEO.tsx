import React from 'react';
import Head from 'next/head';

interface DefaultSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export default function DefaultSEO({ 
  title = '#1 Toyota Land Cruiser Export from Japan - Japan Direct Trucks',
  description = 'Leading Toyota Land Cruiser exporter in Japan. American-owned with direct auction access. Export Land Cruiser 70, 200, 300 worldwide. Best prices guaranteed.',
  keywords = 'cheapest jdm exporter, cheapest land cruiser japan, lowest price toyota export, japan direct export, cheapest hilux from japan, best price jdm cars, japan vehicle export usa, japan export australia, japan export uk, japan export kenya, japan export dubai, cheapest toyota exporter, 10% markup only, japan to usa export, japan to australia export',
  image = 'https://japandirecttrucks.com/images/og-image.jpg',
  url = 'https://japandirecttrucks.com'
}: DefaultSEOProps) {
  
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "ExportAction",
    "agent": {
      "@type": "Organization",
      "name": "Japan Direct Trucks - Cheapest JDM Exporter",
      "description": "Japan's most affordable vehicle exporter with only 10% markup. Direct export from Japan to worldwide destinations.",
      "url": "https://japandirecttrucks.com",
      "telephone": "+81-70-9310-1930",
      "email": "info@japandirecttrucks.com",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Japan"
      },
      "priceRange": "$$$"
    },
    "fromLocation": {
      "@type": "Country",
      "name": "Japan"
    },
    "toLocation": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "Australia" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Kenya" },
      { "@type": "Country", "name": "United Arab Emirates" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "New Zealand" },
      { "@type": "Country", "name": "Nigeria" },
      { "@type": "Country", "name": "Pakistan" },
      { "@type": "Country", "name": "Philippines" }
    ],
    "instrument": {
      "@type": "Vehicle",
      "vehicleType": ["Land Cruiser", "Hilux", "FJ Cruiser", "Hijet", "JDM Cars"]
    }
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Japan Direct Trucks - Cheapest Exporter" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Japan Direct Trucks" />
      <link rel="canonical" href={url} />
      
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
    </Head>
  );
}