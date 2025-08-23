import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function QatarPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: StarIcon,
      title: 'Luxury Configuration',
      description: 'Premium Japanese vehicles with luxury features perfect for Qatar\'s high-end market.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Desert Engineering',
      description: 'Advanced cooling and filtration systems designed for extreme desert conditions.'
    },
    {
      icon: TruckIcon,
      title: 'Construction Ready',
      description: 'Heavy-duty vehicles ideal for Qatar\'s massive construction and infrastructure projects.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'QAR Pricing',
      description: 'Competitive pricing in Qatari Riyal with premium financing options available.'
    }
  ];

  const advantages = [
    'Luxury features and premium interiors',
    'Desert-tested cooling systems (+55°C)',
    'Sand-resistant filtration technology',
    'Premium sound insulation',
    'Advanced navigation systems',
    'Doha port delivery (2-3 weeks)'
  ];

  return (
    <>
      <Head>
        <title>Japanese Trucks for Qatar - Luxury Toyota Land Cruisers | GPS Trucks Japan</title>
        <meta name="description" content="Export luxury Japanese Toyota trucks to Qatar. Desert-ready Land Cruisers for construction projects and premium transport in extreme conditions." />
        <meta name="keywords" content="japanese trucks qatar, toyota land cruiser qatar, luxury vehicles qatar, desert trucks, construction vehicles qatar" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-800 to-white text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇶🇦</span>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  Japanese Trucks for Qatar
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-gray-800">
                Luxury Toyota Land Cruisers for construction projects and premium desert transport
              </p>
              <div className="bg-red-800/90 text-white rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">+55°C</div>
                    <div className="text-sm opacity-75">Desert Tested</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">LUXURY</div>
                    <div className="text-sm opacity-75">Premium Features</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2-3 WEEKS</div>
                    <div className="text-sm opacity-75">Doha Delivery</div>
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
                Why Japanese Vehicles Excel in Qatar's Desert Environment
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-red-600 mb-4">🏜️ Desert Mastery</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Advanced climate control systems</li>
                    <li>• Sand-resistant air filtration</li>
                    <li>• Heat-resistant materials and components</li>
                    <li>• Enhanced cooling for extreme temperatures</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gold-600 mb-4">⭐ Premium Quality</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Luxury interior appointments</li>
                    <li>• Advanced technology integration</li>
                    <li>• Superior build quality and finish</li>
                    <li>• Premium comfort features</li>
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
                Qatar Export Services
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                    <feature.icon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Perfect for Qatar's Premium Market</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🏗️</div>
                  <h3 className="font-bold mb-2">Mega Construction</h3>
                  <p className="text-sm text-gray-600">Heavy-duty transport for World Cup venues and infrastructure projects</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">⭐</div>
                  <h3 className="font-bold mb-2">Luxury Transport</h3>
                  <p className="text-sm text-gray-600">Premium vehicles for executive transport and VIP services</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🛢️</div>
                  <h3 className="font-bold mb-2">Energy Sector</h3>
                  <p className="text-sm text-gray-600">Reliable transport for oil and gas operations in desert conditions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Shipping to Qatar</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { route: 'Gulf Route', port: 'Doha Port', time: '2-3 weeks', flag: '🚢' },
                  { route: 'Premium Route', port: 'Hamad Port', time: '2-3 weeks', flag: '⚓' }
                ].map((dest, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-3xl mb-2">{dest.flag}</div>
                    <h3 className="font-bold">{dest.route}</h3>
                    <p className="text-sm text-gray-600">{dest.port}</p>
                    <p className="text-xs text-red-600 font-medium">{dest.time}</p>
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
              <h2 className="text-3xl font-bold mb-8">Premium Payment Options</h2>
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
                  <p className="text-sm text-gray-600">Secure international wire transfer via Qatari banks</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">💎</div>
                  <h3 className="font-bold mb-2">Premium Financing</h3>
                  <p className="text-sm text-gray-600">Luxury vehicle financing options with flexible terms</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">VIP Documentation</h3>
                  <p className="text-sm text-gray-600">Priority processing for all export and customs documentation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Premium Vehicles for Qatar
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
            <h2 className="text-3xl font-bold mb-4">Experience Luxury in the Desert</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for premium Japanese vehicles built for Qatar's demanding environment
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
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
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