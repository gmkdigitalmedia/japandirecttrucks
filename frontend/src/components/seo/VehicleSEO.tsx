import React from 'react';
import Head from 'next/head';

interface Vehicle {
  id: number;
  manufacturer: { name: string };
  model: { name: string };
  model_year_ad: number;
  price_vehicle_yen: number;
  price_total_yen: number;
  mileage_km: number;
  title_description: string;
  location_prefecture?: string;
  images?: Array<{ original_url: string; alt_text?: string }>;
  seo_metadata?: {
    title: string;
    description: string;
    keywords: string;
    og_title?: string;
    og_description?: string;
    canonical_url?: string;
  };
}

interface VehicleSEOProps {
  vehicle: Vehicle;
}

export default function VehicleSEO({ vehicle }: VehicleSEOProps) {
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

  // Random country combinations for broader reach
  const exportCountries = [
    'USA Australia UK Kenya Dubai',
    'Canada New Zealand Nigeria Philippines', 
    'Germany France Italy Pakistan India',
    'Saudi Arabia Qatar Lebanon Iran Ukraine'
  ];
  const randomCountries = exportCountries[Math.floor(Math.random() * exportCountries.length)];

  const year = vehicle.model_year_ad;
  const make = vehicle.manufacturer.name;
  const model = vehicle.model.name;
  const price = formatPrice(vehicle.price_total_yen || vehicle.price_vehicle_yen);
  const mileage = formatMileage(vehicle.mileage_km);

  // Use database metadata if available, otherwise use basic dynamic SEO
  let title, description, keywords;
  
  if (vehicle.seo_metadata) {
    title = vehicle.seo_metadata.title;
    description = vehicle.seo_metadata.description;
    keywords = vehicle.seo_metadata.keywords;
  } else {
    // Basic dynamic SEO with actual car details
    title = `${year} ${make} ${model} Export from Japan - ${price} | Japan Direct Trucks`;
    description = `Export ${year} ${make} ${model} from Japan. ${mileage}, ${price}. Direct export worldwide with full export assistance.`;
    keywords = `${year} ${make.toLowerCase()} ${model.toLowerCase()}, ${make.toLowerCase()} export japan, japanese ${model.toLowerCase()}, ${model.toLowerCase()} for sale`;
  }

  // Generate vehicle schema
  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": `${year} ${make} ${model}`,
    "description": vehicle.title_description,
    "brand": {
      "@type": "Brand",
      "name": make
    },
    "model": model,
    "vehicleModelDate": year.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": vehicle.mileage_km,
      "unitCode": "KMT"
    },
    "bodyType": model.includes('Land Cruiser') ? 'SUV' : 'Truck',
    "fuelType": 'Gasoline',
    "vehicleTransmission": 'Manual',
    "driveWheelConfiguration": model.includes('Land Cruiser') ? '4WD' : 'RWD',
    "offers": {
      "@type": "Offer",
      "price": vehicle.price_total_yen || vehicle.price_vehicle_yen,
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Japan Direct Trucks - Cheapest Exporter",
        "telephone": "+81-70-9310-1930",
        "description": "Japan's cheapest vehicle exporter with only 10% markup"
      },
      "itemCondition": "https://schema.org/UsedCondition"
    },
    "manufacturer": {
      "@type": "Organization", 
      "name": make
    },
    "image": vehicle.images && vehicle.images.length > 0 ? 
      vehicle.images[0].original_url : 
      "https://japandirecttrucks.com/images/default-vehicle.jpg",
    "url": `https://japandirecttrucks.com/vehicles/${vehicle.id}`
  };

  const mainImage = vehicle.images && vehicle.images.length > 0 ? 
    vehicle.images[0].original_url : 
    "https://japandirecttrucks.com/images/default-vehicle.jpg";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={vehicle.seo_metadata?.og_title || `${year} ${make} ${model} - Export Quality Japanese Vehicle`} />
      <meta property="og:description" content={vehicle.seo_metadata?.og_description || description} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={`https://japandirecttrucks.com/vehicles/${vehicle.id}`} />
      <meta property="og:image" content={mainImage} />
      <meta property="og:site_name" content="Japan Direct Trucks" />
      <meta property="product:price:amount" content={(vehicle.price_total_yen || vehicle.price_vehicle_yen).toString()} />
      <meta property="product:price:currency" content="JPY" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${year} ${make} ${model} Export - ${price}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={mainImage} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Japan Direct Trucks" />
      <link rel="canonical" href={`https://japandirecttrucks.com/vehicles/${vehicle.id}`} />
      
      {/* Vehicle schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
    </Head>
  );
}