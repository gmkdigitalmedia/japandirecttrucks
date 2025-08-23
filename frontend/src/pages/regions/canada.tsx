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

export default function CanadaPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: TruckIcon,
      title: 'Right-Hand Drive Standard',
      description: '100% RHD vehicles perfect for Canadian roads. No conversion needed - ready to register.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Transport Canada Compliance',
      description: 'Expert assistance with RIV program and 15+ year import exemption requirements.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Pacific Shipping Routes',
      description: 'Established Vancouver and Montreal port delivery with competitive freight rates.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'CAD Pricing Available',
      description: 'Pricing in Canadian dollars with GST/PST calculations clearly outlined.'
    }
  ];

  const advantages = [
    'Save CAD $20,000-$35,000 vs Canadian dealers',
    'Superior Japanese maintenance records',
    'Right-hand drive standard configuration',
    'Shorter Pacific shipping (2-3 weeks)',  
    'RIV compliance assistance included',
    'Winter-tested vehicle reliability'
  ];

  return (
    <>
      <Head>
        <title>Japanese Trucks for Canada - Import Toyota Land Cruisers | GPS Trucks Japan</title>
        <meta name="description" content="Import Japanese Toyota trucks to Canada. RHD Land Cruisers, Hilux with RIV compliance. Save thousands over Canadian dealer prices." />
        <meta name="keywords" content="japanese trucks canada, toyota land cruiser canada, hilux import canada, rhd vehicles canada, riv compliance" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇨🇦</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Trucks for Canada
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Import RHD Toyota Land Cruisers & Hilux with RIV compliance assistance
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">CAD $30,000</div>
                    <div className="text-sm opacity-75">Average Savings vs CA Dealers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">15+ Years</div>
                    <div className="text-sm opacity-75">Import Exemption Rule</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">100% RHD</div>
                    <div className="text-sm opacity-75">Ready for Canadian Roads</div>
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
                Why Japanese Imports Make Sense for Canada
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-red-600 mb-4">🚗 Perfect Match</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Right-hand drive ready for Canadian roads</li>
                    <li>• Winter-tested in harsh Japanese climates</li>
                    <li>• Shorter Pacific shipping distances</li>
                    <li>• Established RIV import processes</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">💰 Economic Advantage</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• CAD $20,000-$35,000 savings vs local dealers</li>
                    <li>• Lower freight costs (Pacific route)</li>
                    <li>• Favorable exchange rates</li>
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
                Canada-Specific Import Services
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

        {/* RIV Compliance */}
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">RIV Compliance Made Easy</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">15+ Year Rule</h3>
                  <p className="text-sm text-gray-600">Vehicles 15+ years old exempt from most federal standards</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">🔧</div>
                  <h3 className="font-bold mb-2">Modifications</h3>
                  <p className="text-sm text-gray-600">Minimal modifications required for older vehicles</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">✅</div>
                  <h3 className="font-bold mb-2">Registration Ready</h3>
                  <p className="text-sm text-gray-600">Complete documentation for provincial registration</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Info */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Shipping to Canadian Ports</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { port: 'Vancouver', province: 'BC', time: '2-3 weeks', flag: '🏔️' },
                  { port: 'Montreal', province: 'QC', time: '3-4 weeks', flag: '🍁' },
                  { port: 'Halifax', province: 'NS', time: '4-5 weeks', flag: '🌊' }
                ].map((dest, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-3xl mb-2">{dest.flag}</div>
                    <h3 className="font-bold">{dest.port}</h3>
                    <p className="text-sm text-gray-600">{dest.province}</p>
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
              <h2 className="text-3xl font-bold mb-8">Flexible Payment Options</h2>
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-8">
                <p className="text-sm text-yellow-800">
                  <strong>Payment Policy:</strong> Flexible payment until shipping date. 
                  Cars cannot be shipped if not paid 72 hours before ship date.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="font-bold mb-2">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">Secure CAD wire transfer to Canadian accounts</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="font-bold mb-2">Letter of Credit</h3>
                  <p className="text-sm text-gray-600">For large orders and commercial purchases</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">⏰</div>
                  <h3 className="font-bold mb-2">Flexible Timing</h3>
                  <p className="text-sm text-gray-600">Pay anytime before 72 hours of shipping</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for Canada Import
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
            <h2 className="text-3xl font-bold mb-4">Ready to Import Your Dream Japanese Vehicle?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with Canadian import requirements
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