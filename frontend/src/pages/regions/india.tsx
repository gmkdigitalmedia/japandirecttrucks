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
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function IndiaPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Diverse Terrain Ready',
      description: 'From Himalayan highlands to coastal plains - vehicles tested for all Indian geographical conditions.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Monsoon Tested',
      description: 'Waterproof engineering and corrosion resistance perfect for Indian monsoon seasons.'
    },
    {
      icon: TruckIcon,
      title: 'Commercial Operations',
      description: 'Heavy-duty trucks ideal for Indian logistics, mining, and construction industries.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Value Engineering',
      description: 'Competitive pricing with Japanese quality - perfect for the Indian market\'s needs.'
    }
  ];

  const benefits = [
    'Import duty optimization support',
    'Mumbai/Chennai port delivery',
    'CITES documentation for commercial use',
    'Local registration assistance',
    'Service network connectivity',
    'Spare parts availability guidance'
  ];

  const shippingInfo = {
    ports: ['Mumbai', 'Chennai', 'Cochin', 'Kolkata'],
    transitTime: '14-21 days',
    documentation: 'Complete import paperwork included'
  };

  return (
    <Layout
      title="Japanese Vehicles Export to India - GPS Trucks Japan"
      description="Export high-quality Japanese trucks and vehicles to India. Mumbai, Chennai port delivery. Monsoon-tested, terrain-ready vehicles perfect for Indian commercial operations."
    >
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">
                Japanese Vehicle Export to India 🇮🇳
              </h1>
              <p className="text-xl mb-6">
                Premium Japanese trucks and commercial vehicles engineered for India's diverse terrain and climate. 
                From Himalayan roads to monsoon conditions - built to perform.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Mumbai & Chennai Ports
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Monsoon Ready
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  14-21 Days Transit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Indian Conditions</h2>
            <p className="text-xl text-gray-600">Japanese engineering meets Indian requirements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <feature.icon className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Shipping Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-bold mb-6">Shipping to India</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Major Ports</h4>
                  <div className="flex flex-wrap gap-2">
                    {shippingInfo.ports.map((port, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
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
              <h3 className="text-2xl font-bold mb-6">Why Choose Us for India</h3>
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
          <div className="bg-gradient-to-r from-orange-50 to-green-50 p-8 rounded-lg mb-16">
            <div className="max-w-3xl mx-auto text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Commercial & Industrial Focus</h3>
              <p className="text-lg text-gray-700 mb-6">
                Our vehicles are perfect for India's growing logistics, construction, and mining sectors. 
                Built to handle heavy loads, extreme temperatures, and challenging road conditions from 
                Mumbai's coastal humidity to Delhi's dry heat.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">50°C+</div>
                  <div className="text-sm text-gray-600">Heat Tested</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">5000m</div>
                  <div className="text-sm text-gray-600">Altitude Ready</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">500mm</div>
                  <div className="text-sm text-gray-600">Monsoon Depth</div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Vehicles */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available for India Export</h2>
              <p className="text-xl text-gray-600">Ready to ship to Indian ports</p>
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
          <div className="bg-gradient-to-r from-orange-600 to-green-600 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Import to India?</h3>
            <p className="text-lg mb-6">
              Get a personalized quote for shipping to Mumbai, Chennai, or other Indian ports
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Get India Quote
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </a>
              <a
                href="/vehicles"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors inline-flex items-center justify-center"
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