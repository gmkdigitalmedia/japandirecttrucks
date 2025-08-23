import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  SunIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function NigeriaPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: SunIcon,
      title: 'Heat-Resistant Engineering',
      description: 'Japanese vehicles tested in extreme temperatures, perfect for Nigerian hot climate conditions.'
    },
    {
      icon: TruckIcon,
      title: 'Oil Industry Configuration',
      description: 'Heavy-duty trucks ideal for oilfield operations, construction, and industrial transport needs.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Proven Reliability',
      description: 'Toyota Land Cruisers trusted worldwide for consistent performance in challenging environments.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Value for Investment',
      description: 'Cost-effective solutions for Nigerian businesses with competitive pricing and financing options.'
    }
  ];

  const advantages = [
    'Heat-resistant cooling systems (+50°C tested)',
    'Dust-proof filtration for harmattan season',
    'Heavy-duty suspension for rough terrain',
    'Fuel-efficient engines reduce operating costs',
    'Proven in West African conditions',
    'Fast Lagos port delivery (3-4 weeks)'
  ];

  return (
    <>
      <Head>
        <title>Japanese Trucks for Nigeria - Toyota Land Cruisers for Oil Industry | GPS Trucks Japan</title>
        <meta name="description" content="Export reliable Japanese Toyota trucks to Nigeria. Heat-resistant Land Cruisers for oil industry, construction, and hot climate operations." />
        <meta name="keywords" content="japanese trucks nigeria, toyota land cruiser nigeria, oil industry vehicles, construction trucks nigeria, heat resistant vehicles" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-white text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇳🇬</span>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  Japanese Trucks for Nigeria
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-gray-800">
                Heat-resistant Toyota Land Cruisers for oil industry and construction operations
              </p>
              <div className="bg-green-600/90 text-white rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">+50°C</div>
                    <div className="text-sm opacity-75">Heat Tested</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">OIL READY</div>
                    <div className="text-sm opacity-75">Industry Configuration</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3-4 WEEKS</div>
                    <div className="text-sm opacity-75">Lagos Port Delivery</div>
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
                Why Japanese Vehicles Excel in Nigerian Conditions
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">🌡️ Climate Engineered</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Advanced cooling systems for extreme heat</li>
                    <li>• Dust-resistant air filtration systems</li>
                    <li>• Corrosion-resistant materials</li>
                    <li>• UV-protected interior components</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-orange-600 mb-4">🛢️ Industry Ready</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Heavy-duty chassis for equipment transport</li>
                    <li>• High ground clearance for rough terrain</li>
                    <li>• Reinforced suspension systems</li>
                    <li>• Multiple configuration options available</li>
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
                Nigeria Export Services
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
              <h2 className="text-3xl font-bold mb-8">Perfect for Nigerian Industries</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🛢️</div>
                  <h3 className="font-bold mb-2">Oil & Gas Operations</h3>
                  <p className="text-sm text-gray-600">Reliable transport for oilfield equipment, personnel, and maintenance operations</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🏗️</div>
                  <h3 className="font-bold mb-2">Construction Projects</h3>
                  <p className="text-sm text-gray-600">Heavy-duty vehicles for infrastructure development and building construction</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🌾</div>
                  <h3 className="font-bold mb-2">Agricultural Transport</h3>
                  <p className="text-sm text-gray-600">Efficient cargo transport for agricultural products and farming equipment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Shipping to Nigeria</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { route: 'West Africa Route', port: 'Lagos (Apapa/Tin Can)', time: '3-4 weeks', flag: '🚢' },
                  { route: 'Alternative Route', port: 'Port Harcourt', time: '4-5 weeks', flag: '⚓' }
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
                  <p className="text-sm text-gray-600">Secure international wire transfer via Nigerian banks</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">💼</div>
                  <h3 className="font-bold mb-2">Commercial Rates</h3>
                  <p className="text-sm text-gray-600">Special pricing for oil companies and large construction projects</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600">Complete export documentation for Nigerian customs clearance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Recommended Vehicles for Nigeria
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
            <h2 className="text-3xl font-bold mb-4">Power Your Nigerian Operations</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for reliable Japanese vehicles built for Nigerian conditions
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
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
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