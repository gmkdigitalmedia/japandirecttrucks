import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import BusinessSchema from '@/components/seo/BusinessSchema';
import DynamicVehicleSEO from '@/components/seo/DynamicVehicleSEO';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function AustraliaPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: TruckIcon,
      title: 'Right-Hand Drive Standard',
      description: '100% RHD vehicles perfect for Australian roads. No conversion needed - ready to register.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'ADR Compliance Guidance',
      description: 'Expert assistance with Australian Design Rules compliance and import approval process.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Pacific Shipping Routes',
      description: 'Established shipping lanes Japan-Australia with competitive freight rates and faster delivery.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Transparent AUD Pricing',
      description: 'All prices quoted in AUD with no hidden fees. GST and compliance costs clearly outlined.'
    }
  ];

  const advantages = [
    'Save $15,000-$30,000 vs Australian dealers',
    'Superior Japanese maintenance records',
    'Right-hand drive standard',
    'Shorter shipping times (2-3 weeks)',
    'ADR compliance assistance',
    'Established import processes'
  ];

  return (
    <>
      <DynamicVehicleSEO 
        vehicles={vehicles}
        primaryCountry="australia"
        pageUrl="/regions/australia"
      />
      <BusinessSchema 
        page="australia" 
        country="Australia"
        description="Japanese RHD vehicle import to Australia. Toyota Land Cruisers with ADR compliance assistance. Save thousands vs Australian dealers."
      />

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇦🇺</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Trucks for Australia
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Import RHD Toyota Land Cruisers & Hilux with ADR compliance assistance
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">$25,000</div>
                    <div className="text-sm opacity-75">Average Savings vs AU Dealers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2-3 Weeks</div>
                    <div className="text-sm opacity-75">Pacific Shipping Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">100% RHD</div>
                    <div className="text-sm opacity-75">Ready for AU Roads</div>
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
                Why Japanese Imports Make Sense for Australia
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">🚗 Perfect Match</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Right-hand drive standard</li>
                    <li>• Similar traffic rules and standards</li>
                    <li>• Shorter shipping distances</li>
                    <li>• Established import processes</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">💰 Economic Advantage</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• $15,000-$30,000 savings vs local dealers</li>
                    <li>• Lower freight costs (Pacific route)</li>
                    <li>• Competitive exchange rates</li>
                    <li>• No conversion costs (already RHD)</li>
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
                Australia-Specific Import Services
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

        {/* ADR Compliance */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">ADR Compliance Made Easy</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">SEVS Approval</h3>
                  <p className="text-sm text-gray-600">Assistance with Specialist & Enthusiast Vehicle Scheme applications</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🔧</div>
                  <h3 className="font-bold mb-2">Modifications</h3>
                  <p className="text-sm text-gray-600">Guidance on required modifications for ADR compliance</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">✅</div>
                  <h3 className="font-bold mb-2">Registration Ready</h3>
                  <p className="text-sm text-gray-600">Complete documentation package for state registration</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Info */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Shipping to Australian Ports</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { port: 'Sydney', state: 'NSW', time: '2-3 weeks', flag: '🏙️' },
                  { port: 'Melbourne', state: 'VIC', time: '2-3 weeks', flag: '🌆' },
                  { port: 'Brisbane', state: 'QLD', time: '2-3 weeks', flag: '🏖️' }
                ].map((dest, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-3xl mb-2">{dest.flag}</div>
                    <h3 className="font-bold">{dest.port}</h3>
                    <p className="text-sm text-gray-600">{dest.state}</p>
                    <p className="text-xs text-green-600 font-medium">{dest.time}</p>
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
              Featured Vehicles for Australia Import
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
            <h2 className="text-3xl font-bold mb-4">Ready to Import Your Dream Japanese Vehicle?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with Australian import requirements
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