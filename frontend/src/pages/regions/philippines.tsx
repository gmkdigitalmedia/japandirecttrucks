import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function PhilippinesPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Island Transport Ready',
      description: 'Vehicles designed for inter-island transport and coastal operations in tropical conditions.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Typhoon Resistance',
      description: 'Weather-sealed construction built to withstand severe tropical storms and flooding.'
    },
    {
      icon: TruckIcon,
      title: 'Cargo Capacity',
      description: 'High payload capacity perfect for transporting goods across Philippine archipelago.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'PHP Pricing',
      description: 'Competitive pricing in Philippine Pesos with flexible payment terms for local businesses.'
    }
  ];

  const advantages = [
    'Corrosion-resistant materials for coastal use',
    'Weather-sealed electrical systems',
    'High ground clearance for flood conditions',
    'Heavy-duty cargo configurations',
    'Proven reliability in tropical climates',
    'Manila port delivery (2-3 weeks)'
  ];

  return (
    <>
      <Head>
        <title>Japanese Trucks for Philippines - Island Transport Toyota Land Cruisers | GPS Trucks Japan</title>
        <meta name="description" content="Export reliable Japanese Toyota trucks to Philippines. Typhoon-resistant Land Cruisers for island transport, cargo capacity, and tropical operations." />
        <meta name="keywords" content="japanese trucks philippines, toyota land cruiser philippines, island transport, typhoon resistant vehicles, cargo trucks philippines" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇵🇭</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Trucks for Philippines
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Typhoon-resistant Toyota Land Cruisers for island transport and cargo operations
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">TYPHOON</div>
                    <div className="text-sm opacity-75">Resistant Design</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">ISLAND</div>
                    <div className="text-sm opacity-75">Transport Ready</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2-3 WEEKS</div>
                    <div className="text-sm opacity-75">Manila Delivery</div>
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
                Why Japanese Vehicles Excel in Philippine Conditions
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">🌊 Tropical Engineering</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Corrosion-resistant body materials</li>
                    <li>• Weather-sealed electrical components</li>
                    <li>• Enhanced drainage systems</li>
                    <li>• Humidity-resistant interior materials</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-red-600 mb-4">🏝️ Island Operations</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• High cargo capacity for inter-island trade</li>
                    <li>• Adaptable for various terrain types</li>
                    <li>• Efficient fuel consumption</li>
                    <li>• Easy maintenance in remote locations</li>
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
                Philippines Export Services
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
              <h2 className="text-3xl font-bold mb-8">Perfect for Philippine Operations</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🏝️</div>
                  <h3 className="font-bold mb-2">Inter-Island Transport</h3>
                  <p className="text-sm text-gray-600">Reliable cargo transport between islands for goods and supplies</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🌪️</div>
                  <h3 className="font-bold mb-2">Disaster Response</h3>
                  <p className="text-sm text-gray-600">Emergency transport during typhoons and natural disasters</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🌾</div>
                  <h3 className="font-bold mb-2">Agricultural Transport</h3>
                  <p className="text-sm text-gray-600">Heavy-duty transport for rice, coconut, and tropical fruit distribution</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Shipping to Philippines</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { route: 'Pacific Route', port: 'Manila (North Harbor)', time: '2-3 weeks', flag: '🚢' },
                  { route: 'Southern Route', port: 'Cebu Port', time: '3-4 weeks', flag: '⚓' },
                  { route: 'Mindanao Route', port: 'Davao Port', time: '3-4 weeks', flag: '🌊' }
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
                  <p className="text-sm text-gray-600">Secure international wire transfer via Philippine banks</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="font-bold mb-2">PHP Options</h3>
                  <p className="text-sm text-gray-600">Pricing available in Philippine Pesos for local convenience</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600">Complete BOC customs documentation and port clearance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Recommended Vehicles for Philippines
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
            <h2 className="text-3xl font-bold mb-4">Navigate the Philippine Islands</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for typhoon-resistant Japanese vehicles built for island operations
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