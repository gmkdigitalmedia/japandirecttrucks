import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import BusinessSchema from '@/components/seo/BusinessSchema';
import DynamicVehicleSEO from '@/components/seo/DynamicVehicleSEO';
import { 
  SunIcon, 
  CurrencyDollarIcon, 
  WrenchScrewdriverIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function AfricaPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: SunIcon,
      title: 'Extreme Climate Durability',
      description: 'Toyota vehicles proven in harsh African conditions. Built to withstand dust, heat, and challenging terrain.'
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Widespread Parts Availability',
      description: 'Toyota parts are readily available across Africa through established dealer networks and independent suppliers.'
    },
    {
      icon: TruckIcon,
      title: 'Off-Road Capability',
      description: 'Land Cruisers and Hilux trucks designed for African roads - from highways to bush tracks.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Flexible Payment Terms',
      description: 'Cash payment options, installment plans, and trade financing available for bulk purchases.'
    }
  ];

  const advantages = [
    'Save 40-50% vs local dealer prices',
    'Superior Japanese build quality',
    'Proven African road durability',
    'Easy parts & service availability',
    'Flexible payment options',
    'Established shipping routes'
  ];

  return (
    <>
      <DynamicVehicleSEO 
        vehicles={vehicles}
        primaryCountry="africa"
        pageUrl="/regions/africa"
      />
      <BusinessSchema 
        page="africa" 
        country="Africa"
        description="Japanese Toyota export to Africa. Land Cruisers proven for African roads. Ships to Kenya, South Africa, Nigeria, Tanzania."
      />
        <title>Japanese Toyota Land Cruisers for Africa - Export to Kenya, South Africa, Nigeria | Japan Direct Trucks</title>
        <meta name="description" content="Export Japanese Toyota Land Cruisers & Hilux to Africa. Save 40-50% vs local dealers. Proven durability for African roads. Ships to Kenya, South Africa, Nigeria, Tanzania with flexible payment terms." />
        <meta name="keywords" content="japanese trucks africa, toyota land cruiser africa, hilux africa export, kenya vehicle import, south africa toyota import, nigeria land cruiser, tanzania hilux, african toyota parts, rhd vehicles africa" />
        
        {/* Open Graph tags for social media */}
        <meta property="og:title" content="Japanese Toyota Land Cruisers for Africa - Expert Export Service" />
        <meta property="og:description" content="Export Japanese Toyota vehicles to Africa. Save 40-50% vs local dealers. Proven durability for African conditions. Ships to all major African ports." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://japandirecttrucks.com/regions/africa" />
        <meta property="og:image" content="https://japandirecttrucks.com/images/land-cruiser-africa.jpg" />
        <meta property="og:site_name" content="Japan Direct Trucks" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Japanese Toyota Land Cruisers for Africa Export" />
        <meta name="twitter:description" content="Save 40-50% on Toyota Land Cruisers & Hilux. Expert export to Kenya, South Africa, Nigeria, Tanzania. Proven African road durability." />
        <meta name="twitter:image" content="https://japandirecttrucks.com/images/land-cruiser-africa.jpg" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Japan Direct Trucks" />
        <meta name="geo.region" content="JP-13" />
        <meta name="geo.placename" content="Tokyo, Japan" />
        <link rel="canonical" href="https://japandirecttrucks.com/regions/africa" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🌍</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Trucks for Africa
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Proven Toyota Land Cruisers & Hilux built for African roads and conditions
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50%</div>
                    <div className="text-sm opacity-75">Savings vs Local Dealers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Proven</div>
                    <div className="text-sm opacity-75">African Road Durability</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Easy</div>
                    <div className="text-sm opacity-75">Parts Availability</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Advantages */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Japanese Vehicles Excel in Africa
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-amber-600 mb-4">🏜️ Built for Africa</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Superior dust filtration systems</li>
                    <li>• Heat-resistant components</li>
                    <li>• Robust suspension for rough roads</li>
                    <li>• Proven reliability in harsh climates</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">🔧 Service Network</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Extensive Toyota dealer network</li>
                    <li>• Independent mechanics trained on Toyota</li>
                    <li>• Parts availability across continent</li>
                    <li>• Lower maintenance costs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Africa Export Services
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                    <feature.icon className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Payment Options */}
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Flexible Payment Solutions</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="font-bold mb-2">Cash Payment</h3>
                  <p className="text-sm text-gray-600">Full payment or cash on delivery options available</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📊</div>
                  <h3 className="font-bold mb-2">Trade Financing</h3>
                  <p className="text-sm text-gray-600">Installment plans and trade credit for established businesses</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🚛</div>
                  <h3 className="font-bold mb-2">Fleet Discounts</h3>
                  <p className="text-sm text-gray-600">Special pricing for bulk orders and fleet purchases</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Popular Export Destinations</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { country: 'South Africa', port: 'Durban/Cape Town', flag: '🇿🇦' },
                  { country: 'Kenya', port: 'Mombasa', flag: '🇰🇪' },
                  { country: 'Nigeria', port: 'Lagos/Apapa', flag: '🇳🇬' },
                  { country: 'Tanzania', port: 'Dar es Salaam', flag: '🇹🇿' }
                ].map((dest, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-3xl mb-2">{dest.flag}</div>
                    <h3 className="font-bold">{dest.country}</h3>
                    <p className="text-sm text-gray-600">{dest.port}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for Africa Export
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <VehicleGrid 
                vehicles={vehicles} 
                loading={loading}
                onInquiry={(vehicleId) => window.location.href = `/vehicles/${vehicleId}#inquiry`}
                competitiveAdvantage={true}
              />
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Import Reliable Japanese Vehicles?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized service and competitive pricing for African markets
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="tel:+817091301930" 
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                📞 Call +81-70-9310-1930
              </a>
              <a 
                href="/export-process" 
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                View Export Process
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}