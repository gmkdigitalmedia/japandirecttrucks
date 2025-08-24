import { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export default function Layout({
  children,
  title = '#1 Toyota Landcruiser Export from Japan - Japan Direct Trucks | American Owned',
  description = 'Find and export premium Japanese vehicles worldwide. Specializing in Land Cruisers, luxury SUVs, and commercial vehicles with full export assistance.',
  keywords = 'Japanese cars, Land Cruiser, Toyota, export, used cars Japan, SUV, trucks, vehicle export',
  image = '/images/og-image.jpg',
  url = 'https://japandirecttrucks.com',
}: LayoutProps) {
  const fullTitle = title.includes('Japan Direct Trucks') ? title : `${title} | Japan Direct Trucks`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="Japan Direct Trucks" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        
        {/* Additional */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Japan Direct Trucks" />
        <meta name="copyright" content="2025 Japan Direct Trucks" />
        <link rel="canonical" href={url} />
        
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Japan Direct Trucks',
              description: description,
              url: 'https://japandirecttrucks.com',
              logo: 'https://gpstrucksjapan.com/images/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+81-93-101-930',
                contactType: 'customer service',
                availableLanguage: ['English', 'Japanese']
              },
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'JP',
                addressLocality: 'Tokyo'
              },
              sameAs: [
                'https://wa.me/819310193'
              ]
            }),
          }}
        />
      </Head>
      
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}