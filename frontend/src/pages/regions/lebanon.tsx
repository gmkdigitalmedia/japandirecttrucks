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
  ArrowRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function LebanonPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Mountain Road Ready',
      description: 'Perfect for Lebanon\'s challenging mountain terrain and coastal to highland transitions.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Mediterranean Climate',
      description: 'Designed for Mediterranean coastal humidity and mountain temperature variations.'
    },
    {
      icon: TruckIcon,
      title: 'Construction & Logistics',
      description: 'Ideal for Lebanon\'s construction boom and regional logistics operations.'
    },
    {
      icon: HomeIcon,
      title: 'Urban & Rural',
      description: 'Versatile vehicles perfect for both Beirut urban operations and rural mountain areas.'
    }
  ];

  const benefits = [
    'Beirut port direct delivery',
    'Arabic documentation available',
    'Regional service support',
    'Mountain grade certification',
    'Coastal humidity protection',
    'Multi-terrain capability'
  ];

  const shippingInfo = {
    ports: ['Port of Beirut', 'Port of Tripoli'],
    transitTime: '18-25 days',
    documentation: 'Complete Lebanese import paperwork'
  };

  return (
    <Layout
      title="Japanese Vehicles Export to Lebanon - GPS Trucks Japan"
      description="Export premium Japanese trucks and vehicles to Lebanon. Beirut port delivery. Mountain-tested, Mediterranean climate vehicles perfect for Lebanese terrain."
    >
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-white text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4 text-red-700">
                Japanese Vehicle Export to Lebanon 🇱🇧
              </h1>
              <p className="text-xl mb-6 text-gray-700">
                Premium Japanese trucks and commercial vehicles designed for Lebanon's unique geography - 
                from Mediterranean coastline to mountain peaks. Built for versatility and reliability.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Beirut Port Direct
                </div>
                <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Mountain Ready
                </div>
                <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  18-25 Days Transit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect for Lebanese Terrain</h2>
            <p className="text-xl text-gray-600">From Beirut to the Bekaa Valley - built to perform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <feature.icon className="h-8 w-8 text-red-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Shipping Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-bold mb-6">Shipping to Lebanon</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Major Ports</h4>
                  <div className="flex flex-wrap gap-2">
                    {shippingInfo.ports.map((port, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transit Time</h4>
                  <p className="text-gray-700">{shippingInfo.transitTime}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Documentation</h4>
                  <p className="text-gray-700">{shippingInfo.documentation}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-bold mb-6">Lebanon Export Benefits</h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Special Focus */}
          <div className="bg-gradient-to-r from-red-50 to-green-50 p-8 rounded-lg mb-16">
            <div className="max-w-3xl mx-auto text-center">
              <GlobeAltIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Versatility for Every Need</h3>
              <p className="text-lg text-gray-700 mb-6">
                Lebanon's unique geography demands versatile vehicles. Our Japanese trucks perform equally 
                well in Beirut's urban environment, the Bekaa Valley's agricultural areas, and the 
                challenging mountain roads connecting coast to highlands.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">3,088m</div>
                  <div className="text-sm text-gray-600">Qornet el Sawda Ready</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">40°C</div>
                  <div className="text-sm text-gray-600">Bekaa Valley Heat</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">85%</div>
                  <div className="text-sm text-gray-600">Coastal Humidity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Insight */}
          <div className="bg-white p-8 rounded-lg border mb-16">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-6">Built for Lebanese Business</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🏗️</div>
                  <h4 className="font-semibold mb-2">Construction</h4>
                  <p className="text-gray-600 text-sm">Perfect for Lebanon's ongoing reconstruction and development projects</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🌾</div>
                  <h4 className="font-semibold mb-2">Agriculture</h4>
                  <p className="text-gray-600 text-sm">Ideal for Bekaa Valley farming operations and produce transport</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🏢</div>
                  <h4 className="font-semibold mb-2">Logistics</h4>
                  <p className="text-gray-600 text-sm">Regional hub operations serving the Middle East corridor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Vehicles */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available for Lebanon Export</h2>
              <p className="text-xl text-gray-600">Ready to ship to Lebanese ports</p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <VehicleGrid vehicles={vehicles.slice(0, 6)} />
            )}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-red-600 to-green-600 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Import to Lebanon?</h3>
            <p className="text-lg mb-6">
              Get a personalized quote for shipping to Beirut or Tripoli ports
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Get Lebanon Quote
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </a>
              <a
                href="/vehicles"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors inline-flex items-center justify-center"
              >
                Browse Vehicles
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}