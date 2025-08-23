import React from 'react';
import Head from 'next/head';

interface Vehicle {
  id: number;
  manufacturer: { name: string };
  model: { name: string };
  model_year_ad: number;
  price_vehicle_yen: number;
  mileage_km: number;
  title_description: string;
}

interface DynamicVehicleSEOProps {
  vehicles: Vehicle[];
  primaryCountry: string;
  pageUrl: string;
}

export default function DynamicVehicleSEO({ vehicles, primaryCountry, pageUrl }: DynamicVehicleSEOProps) {
  // Country combinations for each page (randomly mixed)
  const countryMixes = {
    'uk': ['UK', 'Australia', 'Kenya', 'New Zealand'],
    'usa': ['USA', 'Canada', 'Philippines', 'Jamaica'],
    'australia': ['Australia', 'UK', 'New Zealand', 'South Africa'],
    'kenya': ['Kenya', 'Tanzania', 'Uganda', 'Nigeria'],
    'africa': ['South Africa', 'Kenya', 'Nigeria', 'Tanzania'],
    'new-zealand': ['New Zealand', 'Australia', 'UK', 'Fiji'],
    'canada': ['Canada', 'USA', 'Barbados', 'Trinidad'],
    'dubai': ['UAE', 'Qatar', 'Saudi Arabia', 'Oman'],
    'germany': ['Germany', 'France', 'Italy', 'Netherlands'],
    'france': ['France', 'Germany', 'Belgium', 'Switzerland'],
    'italy': ['Italy', 'France', 'Germany', 'Malta'],
    'pakistan': ['Pakistan', 'India', 'Bangladesh', 'Sri Lanka'],
    'india': ['India', 'Pakistan', 'Bangladesh', 'Nepal'],
    'philippines': ['Philippines', 'Malaysia', 'Thailand', 'Singapore'],
    'iran': ['Iran', 'Iraq', 'Afghanistan', 'Turkey'],
    'lebanon': ['Lebanon', 'Jordan', 'Cyprus', 'Syria'],
    'middle-east': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'],
    'nigeria': ['Nigeria', 'Ghana', 'Cameroon', 'Ivory Coast'],
    'qatar': ['Qatar', 'UAE', 'Saudi Arabia', 'Bahrain'],
    'saudi-arabia': ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait'],
    'ukraine': ['Ukraine', 'Poland', 'Romania', 'Moldova'],
    'global': ['USA', 'Australia', 'UK', 'Kenya', 'Canada', 'New Zealand']
  };

  const getCountriesForPage = (page: string): string[] => {
    return countryMixes[page as keyof typeof countryMixes] || ['Worldwide', 'Global', 'International', 'Export'];
  };

  const formatPrice = (priceYen: number): string => {
    const usd = Math.round(priceYen / 150); // Rough JPY to USD conversion
    return `$${usd.toLocaleString()}`;
  };

  const formatMileage = (km: number): string => {
    if (km >= 10000) {
      return `${Math.round(km / 1000)}k km`;
    }
    return `${km.toLocaleString()} km`;
  };

  // Get featured vehicle for SEO (first vehicle or most expensive)
  const featuredVehicle = vehicles.length > 0 ? vehicles[0] : null;
  const countries = getCountriesForPage(primaryCountry);
  const countryString = countries.slice(0, 3).join(' '); // First 3 countries

  // Generate dynamic title (keep under 60 chars)
  const generateTitle = (): string => {
    if (featuredVehicle) {
      const year = featuredVehicle.model_year_ad;
      const make = featuredVehicle.manufacturer.name;
      const model = featuredVehicle.model.name.replace('Land Cruiser', 'LC'); // Shorten for space
      const price = formatPrice(featuredVehicle.price_vehicle_yen);
      
      return `${year} ${make} ${model} ${price} - Export ${countryString}`.substring(0, 58);
    }
    return `Japanese Vehicle Export - ${countryString} Import`;
  };

  // Generate dynamic meta description (keep under 160 chars)
  const generateDescription = (): string => {
    if (featuredVehicle) {
      const year = featuredVehicle.model_year_ad;
      const make = featuredVehicle.manufacturer.name;
      const model = featuredVehicle.model.name;
      const price = formatPrice(featuredVehicle.price_vehicle_yen);
      const mileage = formatMileage(featuredVehicle.mileage_km);
      
      return `Export ${year} ${make} ${model}, ${mileage}, ${price}. Ships to ${countries.join(', ')}. Save thousands vs local dealers worldwide.`.substring(0, 158);
    }
    return `Japanese vehicle export to ${countries.join(', ')}. Toyota Land Cruisers, Hilux trucks. Save thousands vs local dealers with expert compliance.`;
  };

  // Generate dynamic keywords
  const generateKeywords = (): string => {
    const baseKeywords = ['japanese vehicle export', 'toyota export japan', 'land cruiser export'];
    const countryKeywords = countries.map(country => 
      `${country.toLowerCase()} import, japanese cars ${country.toLowerCase()}`
    ).join(', ');
    
    if (featuredVehicle) {
      const vehicleKeywords = [
        `${featuredVehicle.manufacturer.name.toLowerCase()} ${featuredVehicle.model.name.toLowerCase()}`,
        `${featuredVehicle.model_year_ad} ${featuredVehicle.model.name.toLowerCase()}`,
        `${featuredVehicle.model.name.toLowerCase()} export`
      ];
      return [...baseKeywords, ...vehicleKeywords, countryKeywords].join(', ');
    }
    
    return [...baseKeywords, countryKeywords].join(', ');
  };

  // Generate vehicle schema for featured vehicle
  const generateVehicleSchema = () => {
    if (!featuredVehicle) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${featuredVehicle.model_year_ad} ${featuredVehicle.manufacturer.name} ${featuredVehicle.model.name}`,
      "description": featuredVehicle.title_description,
      "brand": {
        "@type": "Brand",
        "name": featuredVehicle.manufacturer.name
      },
      "model": featuredVehicle.model.name,
      "vehicleModelDate": featuredVehicle.model_year_ad.toString(),
      "mileageFromOdometer": {
        "@type": "QuantitativeValue",
        "value": featuredVehicle.mileage_km,
        "unitCode": "KMT"
      },
      "offers": {
        "@type": "Offer",
        "price": featuredVehicle.price_vehicle_yen,
        "priceCurrency": "JPY",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Japan Direct Trucks"
        }
      },
      "manufacturer": {
        "@type": "Organization", 
        "name": featuredVehicle.manufacturer.name
      }
    };
  };

  const vehicleSchema = generateVehicleSchema();

  return (
    <Head>
      <title>{generateTitle()}</title>
      <meta name="description" content={generateDescription()} />
      <meta name="keywords" content={generateKeywords()} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={generateTitle()} />
      <meta property="og:description" content={generateDescription()} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://japandirecttrucks.com${pageUrl}`} />
      <meta property="og:image" content="https://japandirecttrucks.com/images/featured-vehicles.jpg" />
      <meta property="og:site_name" content="Japan Direct Trucks" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={generateTitle()} />
      <meta name="twitter:description" content={generateDescription()} />
      <meta name="twitter:image" content="https://japandirecttrucks.com/images/featured-vehicles.jpg" />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Japan Direct Trucks" />
      <link rel="canonical" href={`https://japandirecttrucks.com${pageUrl}`} />
      
      {/* Dynamic vehicle schema */}
      {vehicleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
        />
      )}
    </Head>
  );
}