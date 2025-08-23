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

export default function PakistanPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Mountain Terrain Ready',
      description: 'High-altitude tested vehicles perfect for Himalayan and Karakoram mountain operations.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Security & Durability',
      description: 'Robust construction ideal for border security, military, and remote area operations.'
    },
    {
      icon: TruckIcon,
      title: 'Agricultural Configuration',
      description: 'Heavy-duty trucks perfect for Pakistani agricultural transport and farming needs.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Competitive Pricing',
      description: 'Cost-effective solutions with PKR pricing options and favorable trade terms.'
    }
  ];

  const advantages = [
    'High-altitude performance (up to 5,000m)',
    'Extreme temperature tolerance (-20°C to +50°C)',
    'Reinforced chassis for heavy cargo loads',
    'All-terrain capability for mountain roads',
    'Proven reliability in remote conditions',
    'Karachi port delivery (2-3 weeks)'
  ];

  return (
    <>
      <Head>
        <title>Japanese Trucks for Pakistan - Mountain Terrain Toyota Land Cruisers | GPS Trucks Japan</title>
        <meta name="description" content="Export reliable Japanese Toyota trucks to Pakistan. Mountain-ready Land Cruisers for border security, agriculture, and high-altitude operations." />
        <meta name="keywords" content="japanese trucks pakistan, toyota land cruiser pakistan, mountain vehicles, border security trucks, agricultural transport pakistan" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-white text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇵🇰</span>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  Japanese Trucks for Pakistan
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-gray-800">
                Mountain-ready Toyota Land Cruisers for security, agriculture, and high-altitude operations
              </p>
              <div className="bg-green-600/90 text-white rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">5,000M</div>
                    <div className="text-sm opacity-75">Altitude Tested</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">ALL-TERRAIN</div>
                    <div className="text-sm opacity-75">Mountain Capable</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2-3 WEEKS</div>
                    <div className="text-sm opacity-75">Karachi Delivery</div>
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
                Why Japanese Vehicles Excel in Pakistani Terrain
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">⛰️ Mountain Engineering</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• High-altitude engine performance optimization</li>
                    <li>• Advanced 4WD systems for steep terrain</li>
                    <li>• Enhanced braking for mountain descents</li>
                    <li>• Cold-weather starting capability</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">🛡️ Security Ready</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Reinforced body construction</li>
                    <li>• Heavy-duty suspension systems</li>
                    <li>• Multiple configuration options</li>
                    <li>• Proven in challenging environments</li>
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
                Pakistan Export Services
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                    <feature.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Perfect for Pakistani Operations</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🛡️</div>
                  <h3 className="font-bold mb-2">Border Security</h3>
                  <p className="text-sm text-gray-600">Reliable transport for security forces operating in remote border areas</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🌾</div>
                  <h3 className="font-bold mb-2">Agricultural Transport</h3>
                  <p className="text-sm text-gray-600">Heavy-duty cargo capacity for wheat, cotton, and rice transportation</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">⛰️</div>
                  <h3 className="font-bold mb-2">Mountain Operations</h3>
                  <p className="text-sm text-gray-600">High-altitude capability for Gilgit-Baltistan and KPK operations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Shipping to Pakistan</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { route: 'Arabian Sea Route', port: 'Karachi (KPT/QICT)', time: '2-3 weeks', flag: '🚢' },
                  { route: 'Alternative Route', port: 'Gwadar Port', time: '3-4 weeks', flag: '⚓' }
                ].map((dest, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-3xl mb-2">{dest.flag}</div>
                    <h3 className="font-bold">{dest.route}</h3>
                    <p className="text-sm text-gray-600">{dest.port}</p>
                    <p className="text-xs text-green-600 font-medium">{dest.time}</p>
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
                  <p className="text-sm text-gray-600">Secure international wire transfer via Pakistani banks</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="font-bold mb-2">PKR Options</h3>
                  <p className="text-sm text-gray-600">Pricing available in Pakistani Rupees for local convenience</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600">Complete export documentation for Pakistani customs clearance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Recommended Vehicles for Pakistan
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
            <h2 className="text-3xl font-bold mb-4">Conquer Pakistani Terrain</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for mountain-ready Japanese vehicles built for Pakistani conditions
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="tel:+81-70-9310-1930" 
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