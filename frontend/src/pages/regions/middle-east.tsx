import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import { 
  SunIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function MiddleEastPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: SunIcon,
      title: 'Desert-Tested Durability',
      description: 'Toyota vehicles proven in harsh climates. Our trucks are selected for extreme weather performance.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Cash-on-Delivery Options',
      description: 'Flexible payment terms including cash payment upon delivery to your port.'
    },
    {
      icon: TruckIcon,
      title: 'Right-Hand Drive Preferred',
      description: 'Extensive selection of RHD vehicles perfect for GCC and regional markets.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'GCC Export Documentation',
      description: 'Complete paperwork for smooth customs clearance in UAE, Saudi Arabia, Kuwait & more.'
    }
  ];

  const advantages = [
    'Save 40-60% vs local dealer prices',
    'Superior Japanese build quality',
    'Desert climate tested vehicles',
    'Cash payment options available',
    'Complete export documentation',
    'Established GCC shipping routes'
  ];

  return (  
    <>
      <Head>
        <title>Japanese Trucks for Middle East - Toyota Land Cruiser Export | GPS Trucks Japan</title>
        <meta name="description" content="Export Japanese Toyota trucks to Middle East. Land Cruisers, Hilux perfect for GCC markets. Cash payment options, desert-tested quality." />
        <meta name="keywords" content="japanese trucks middle east, toyota land cruiser gcc, dubai car export, saudi arabia vehicle import, kuwait truck import" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🕌</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Trucks for Middle East
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Desert-proven Toyota Land Cruisers & Hilux with GCC export expertise
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50%+</div>
                    <div className="text-sm opacity-75">Savings vs Local Prices</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Cash</div>
                    <div className="text-sm opacity-75">Payment on Delivery</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">GCC</div>
                    <div className="text-sm opacity-75">Export Documentation</div>
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
                Why Japanese Vehicles Excel in the Middle East
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-orange-600 mb-4">🌡️ Climate Engineered</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Superior cooling systems for extreme heat</li>
                    <li>• Dust-resistant air filtration</li>
                    <li>• Heat-resistant electrical components</li>
                    <li>• Proven in Japanese summers & testing</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">💰 Economic Advantage</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 50-60% savings over GCC dealers</li>
                    <li>• Cash payment flexibility</li>
                    <li>• No middleman markups</li>
                    <li>• Transparent, fixed pricing</li>
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
                Middle East Export Services
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                    <feature.icon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Payment Options */}
        <section className="py-16 bg-orange-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Flexible Payment Options</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="font-bold mb-2">Cash on Delivery</h3>
                  <p className="text-sm text-gray-600">Pay when your vehicle arrives at your port</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🏦</div>
                  <h3 className="font-bold mb-2">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">Secure international wire transfer</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">Letter of Credit</h3>
                  <p className="text-sm text-gray-600">For large orders and fleet purchases</p>
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
                  { country: 'UAE', port: 'Dubai/Jebel Ali', flag: '🇦🇪' },
                  { country: 'Saudi Arabia', port: 'Dammam/Jeddah', flag: '🇸🇦' },
                  { country: 'Kuwait', port: 'Kuwait Port', flag: '🇰🇼' },
                  { country: 'Qatar', port: 'Hamad Port', flag: '🇶🇦' }
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
              Featured Vehicles for Middle East Export
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
            <h2 className="text-3xl font-bold mb-4">Ready to Import Quality Japanese Vehicles?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us in Arabic, English, or Japanese for personalized service
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="tel:+817091301930" 
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                📞 اتصل بنا Call +81-70-9310-1930
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