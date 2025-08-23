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
  ArrowRightIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export default function IranPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: SunIcon,
      title: 'Desert Climate Ready',
      description: 'Extreme heat tested vehicles perfect for Iranian desert and arid climate conditions.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sanctions Compliant',
      description: 'Full compliance with international regulations for legitimate commercial vehicle exports.'
    },
    {
      icon: TruckIcon,
      title: 'Oil Industry Ready',
      description: 'Heavy-duty construction ideal for petroleum industry and industrial operations.'
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Service Support',
      description: 'Long-term parts availability and maintenance guidance for sustained operations.'
    }
  ];

  const benefits = [
    'Persian Gulf port delivery options',
    'Complete export documentation',
    'Heat resistance certification',
    'Sand filtration systems',
    'Extended warranty options',
    'Technical manual translations'
  ];

  const shippingInfo = {
    ports: ['Bandar Abbas', 'Bushehr', 'Chabahar'],
    transitTime: '21-28 days',
    documentation: 'Full compliance documentation included'
  };

  return (
    <Layout
      title="Japanese Vehicles Export to Iran - GPS Trucks Japan"
      description="Export premium Japanese trucks and vehicles to Iran. Persian Gulf port delivery. Desert-tested, heat-resistant vehicles perfect for Iranian industrial operations."
    >
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">
                Japanese Vehicle Export to Iran 🇮🇷
              </h1>
              <p className="text-xl mb-6">
                High-quality Japanese trucks and commercial vehicles engineered for Iran's challenging 
                desert climate and industrial demands. Built for extreme temperatures and sustained performance.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Persian Gulf Ports
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Desert Tested
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Compliance Ready
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Engineered for Iranian Conditions</h2>
            <p className="text-xl text-gray-600">Superior Japanese quality meets Persian resilience</p>
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
              <h3 className="text-2xl font-bold mb-6">Shipping to Iran</h3>
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
                  <h4 className="font-semibent text-gray-900 mb-2">Documentation</h4>
                  <p className="text-gray-700">{shippingInfo.documentation}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-bold mb-6">Iran Export Benefits</h3>
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
              <SunIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Built for Extreme Conditions</h3>
              <p className="text-lg text-gray-700 mb-6">
                Our vehicles undergo rigorous testing in Japan's harshest conditions, making them perfect 
                for Iran's desert climate, oil industry operations, and mountainous terrain from the 
                Zagros Mountains to the Dasht-e Kavir desert.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">55°C</div>
                  <div className="text-sm text-gray-600">Heat Resistance</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">24/7</div>
                  <div className="text-sm text-gray-600">Operation Ready</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">IP67</div>
                  <div className="text-sm text-gray-600">Sand Protection</div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Vehicles */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available for Iran Export</h2>
              <p className="text-xl text-gray-600">Ready to ship to Persian Gulf ports</p>
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
            <h3 className="text-2xl font-bold mb-4">Ready to Import to Iran?</h3>
            <p className="text-lg mb-6">
              Get a personalized quote for shipping to Bandar Abbas, Bushehr, or other Iranian ports
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Get Iran Quote
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