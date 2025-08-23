import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function UkrainePage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Battle-Tested Reliability',
      description: 'Toyota trucks proven in extreme conditions. Built for durability and field repairs.'
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Field-Repairable Design',
      description: 'Simple, robust engineering that can be maintained with basic tools in challenging conditions.'
    },
    {
      icon: TruckIcon,
      title: 'Heavy-Duty Configuration',
      description: 'Land Cruisers and Hilux designed for cargo transport, personnel movement, and utility work.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Humanitarian Pricing',
      description: 'Special consideration for humanitarian organizations and reconstruction efforts.'
    }
  ];

  const advantages = [
    'Extreme weather and terrain capability',
    'Fuel-efficient compared to military vehicles',
    'Proven reliability in conflict zones worldwide',
    'Easy maintenance with common parts',
    'Multi-purpose utility configuration',
    'Fast shipping via European routes'
  ];

  return (
    <>
      <Head>
        <title>Japanese Trucks for Ukraine - Reliable Toyota Land Cruisers | GPS Trucks Japan</title>
        <meta name="description" content="Export reliable Japanese Toyota trucks to Ukraine. Battle-tested Land Cruisers and Hilux for reconstruction, humanitarian, and utility work." />
        <meta name="keywords" content="japanese trucks ukraine, toyota land cruiser ukraine, reliable vehicles ukraine, reconstruction vehicles, humanitarian trucks" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇺🇦</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Trucks for Ukraine
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Reliable Toyota Land Cruisers & Hilux for reconstruction and humanitarian work
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">PROVEN</div>
                    <div className="text-sm opacity-75">Conflict Zone Reliability</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">DURABLE</div>
                    <div className="text-sm opacity-75">Extreme Condition Design</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">FAST</div>
                    <div className="text-sm opacity-75">European Route Shipping</div>
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
                Why Japanese Vehicles Excel in Challenging Conditions
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">💪 Built Tough</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Extreme weather resistance (-40°C to +50°C)</li>
                    <li>• Reinforced chassis for heavy loads</li>
                    <li>• Simple, reliable mechanical systems</li>
                    <li>• Proven in global conflict zones</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-yellow-600 mb-4">🔧 Field Maintenance</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Common parts available worldwide</li>
                    <li>• Simple diagnostic systems</li>
                    <li>• Repairable with basic tools</li>
                    <li>• Long service intervals</li>
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
                Ukraine Export Services
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                    <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Mission-Critical Applications</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🏗️</div>
                  <h3 className="font-bold mb-2">Reconstruction</h3>
                  <p className="text-sm text-gray-600">Heavy-duty transport for rebuilding infrastructure and communities</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🚑</div>
                  <h3 className="font-bold mb-2">Humanitarian Aid</h3>
                  <p className="text-sm text-gray-600">Reliable transport for medical supplies and emergency response</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">⚡</div>
                  <h3 className="font-bold mb-2">Utility Work</h3>
                  <p className="text-sm text-gray-600">Power grid repair, communications, and essential services</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Shipping to Ukraine</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { route: 'Black Sea Route', port: 'Odesa/Chornomorsk', time: '4-5 weeks', flag: '🌊' },
                  { route: 'European Route', port: 'Poland Border', time: '3-4 weeks', flag: '🚛' }
                ].map((dest, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-3xl mb-2">{dest.flag}</div>
                    <h3 className="font-bold">{dest.route}</h3>
                    <p className="text-sm text-gray-600">{dest.port}</p>
                    <p className="text-xs text-blue-600 font-medium">{dest.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Payment Terms */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Flexible Payment Options</h2>
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-8">
                <p className="text-sm text-yellow-800">
                  <strong>Payment Policy:</strong> Flexible payment until shipping date. 
                  Cars cannot be shipped if not paid 72 hours before ship date.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🏦</div>
                  <h3 className="font-bold mb-2">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">Secure international wire transfer via European banks</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🤝</div>
                  <h3 className="font-bold mb-2">Humanitarian Rates</h3>
                  <p className="text-sm text-gray-600">Special pricing for NGOs and reconstruction organizations</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600">Complete export documentation for customs clearance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Recommended Vehicles for Ukraine
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h2 className="text-3xl font-bold mb-4">Support Ukrainian Reconstruction</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for reliable vehicles to support rebuilding efforts
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
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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