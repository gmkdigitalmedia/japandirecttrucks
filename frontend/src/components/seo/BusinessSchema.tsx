import React from 'react';
import Head from 'next/head';

interface BusinessSchemaProps {
  page: string;
  country?: string;
  description?: string;
}

export default function BusinessSchema({ page, country, description }: BusinessSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Japan Direct Trucks",
    "alternateName": "GPS Trucks Japan",
    "url": "https://japandirecttrucks.com",
    "logo": "https://japandirecttrucks.com/images/logo.png",
    "image": "https://japandirecttrucks.com/images/land-cruiser-export.jpg",
    "description": description || "Japanese vehicle export specialist. Toyota Land Cruisers, Hilux trucks, and JDM vehicles exported worldwide with expert compliance assistance.",
    "foundingDate": "2014",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tokyo Export Center",
      "addressLocality": "Tokyo",
      "addressRegion": "Tokyo",
      "postalCode": "100-0001",
      "addressCountry": "JP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 35.6762,
      "longitude": 139.6503
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+81-70-9310-1930",
        "contactType": "Customer Service",
        "availableLanguage": ["English", "Japanese"],
        "areaServed": ["Worldwide"]
      }
    ],
    "sameAs": [
      "https://japandirecttrucks.com"
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 35.6762,
        "longitude": 139.6503
      },
      "geoRadius": "20000000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Japanese Vehicle Export Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Toyota Land Cruiser Export",
            "description": "Japanese Toyota Land Cruisers exported worldwide"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Toyota Hilux Export",
            "description": "Japanese Toyota Hilux trucks exported worldwide"
          }
        }
      ]
    },
    "areaServed": [
      "United Kingdom",
      "Australia", 
      "United States",
      "Canada",
      "South Africa",
      "Kenya",
      "Nigeria",
      "Tanzania",
      "UAE",
      "Qatar",
      "Saudi Arabia",
      "Philippines",
      "Pakistan",
      "India"
    ]
  };

  // Add country-specific schema if provided
  if (country) {
    const countryService = {
      "@type": "Service",
      "name": `Japanese Vehicle Import to ${country}`,
      "description": `Expert Japanese vehicle import service to ${country} with compliance assistance`,
      "provider": {
        "@type": "Organization",
        "name": "Japan Direct Trucks"
      },
      "areaServed": country,
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `${country} Import Services`,
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": `Vehicle Import to ${country}`,
              "description": `Complete vehicle import service including compliance and shipping to ${country}`
            }
          }
        ]
      }
    };

    // Create combined schema with both organization and service
    const combinedSchema = {
      "@context": "https://schema.org",
      "@graph": [schemaData, countryService]
    };

    return (
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
        />
      </Head>
    );
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </Head>
  );
}