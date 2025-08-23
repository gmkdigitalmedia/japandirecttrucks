import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SunIcon
} from '@heroicons/react/24/outline';

export default function SaudiArabiaPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: SunIcon,
      title: 'Desert-Engineered Reliability',
      description: 'Japanese vehicles proven for extreme heat and desert terrain conditions.'
    },
    {
      icon: TruckIcon,
      title: '7-Seater Family SUVs',
      description: 'Toyota Land Cruiser 200/300 perfect for family-oriented Saudi lifestyle.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Premium Value Pricing',
      description: 'Competitive pricing vs local dealers: SAR 247,250 to SAR 319,404 range.'
    },
    {
      icon: CheckCircleIcon,
      title: 'GCC Import Ready',
      description: 'Full documentation for Saudi customs and SASO standards compliance.'
    }
  ];

  const marketAdvantages = [
    'Saudi automotive market projected to reach $140.05 billion by 2033',
    'Japanese vehicles dominate Middle Eastern markets (60% SUV market share)',
    'Toyota Land Cruiser leads premium segment in Gulf states',
    'Strong dealership networks: Abdul Latif Jameel partnership',
    'Desert-specific engineering for extreme conditions',
    'Family-oriented 7-seater configurations available'
  ];

  return (
    <>
      <Head>
        <title>Japanese Toyota Land Cruisers for Saudi Arabia - Desert-Ready SUVs | GPS Trucks Japan</title>
        <meta name="description" content="Import Japanese Toyota Land Cruisers to Saudi Arabia. Desert-engineered SUVs with GCC compliance. Premium vehicles for Saudi families." />
        <meta name="keywords" content="toyota land cruiser saudi arabia, japanese cars saudi, gulf import vehicles, desert suv, gcc compliance" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇸🇦</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Vehicles for Saudi Arabia
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Premium Toyota Land Cruisers engineered for desert conditions and family lifestyle
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">60%</div>
                    <div className="text-sm opacity-75">Japanese SUV Market Share</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$140B</div>
                    <div className="text-sm opacity-75">Regional Market by 2033</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3.21%</div>
                    <div className="text-sm opacity-75">Market Growth (CAGR)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Eastern Market Overview */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Middle Eastern Automotive Market Leadership
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Market Dominance</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Japanese vehicles dominate Middle Eastern markets</li>
                    <li>• SUVs represent over 60% of new car sales in Gulf states</li>
                    <li>• Toyota Land Cruiser leads the premium segment</li>
                    <li>• Regional market projected at $140.05 billion by 2033</li>
                    <li>• Growing at 3.21% CAGR with strong demand</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Cultural Alignment</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Strong family orientation driving 7-seater SUV demand</li>
                    <li>• Status consciousness favoring luxury features</li>
                    <li>• Preference for desert-capable vehicles</li>
                    <li>• Extreme heat and terrain engineering requirements</li>
                    <li>• Adventure themes aligned with regional lifestyle</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Toyota Land Cruiser Pricing in Saudi Arabia</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Local Dealer Pricing:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• SAR 247,250 to SAR 319,404 (new vehicles)</li>
                      <li>• AED 238,900 to AED 377,900 in UAE</li>
                      <li>• Premium pricing for luxury features</li>
                      <li>• Limited availability of specific configurations</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Our Japanese Import Advantage:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Direct access to Japanese domestic market</li>
                      <li>• Superior maintenance standards and records</li>
                      <li>• Wider selection of grades and options</li>
                      <li>• Competitive pricing with transparent fees</li>
                    </ul>
                  </div>
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
                Saudi Arabia-Specific Import Services
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

        {/* Distribution Network */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Established Distribution Networks</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">Regional Partnerships</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Abdul Latif Jameel Motors (established presence)</li>
                    <li>• Al-Futtaim Motors network coverage</li>
                    <li>• Al Habtoor Motors local expertise</li>
                    <li>• Essential service networks established</li>
                    <li>• 80% of GCC buyers prefer physical showrooms</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">Market Entry Strategy</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Phased expansion starting with UAE and Saudi Arabia</li>
                    <li>• Robust after-sales service networks</li>
                    <li>• Digital marketing with dealership presence</li>
                    <li>• 96% of buyers start research online</li>
                    <li>• Local expertise and cultural understanding</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketing Approach */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Regional Marketing Success</h2>
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Proven Strategies</h3>
                    <p className="text-gray-700 mb-4">
                      Successful marketing approaches emphasize reliability, durability, and desert-specific engineering capabilities. 
                      Toyota's "Let's Go Places" campaign succeeded by highlighting off-road capabilities and adventure themes aligned with regional lifestyle preferences.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Cultural Considerations</h3>
                    <p className="text-gray-700 mb-4">
                      Strong family orientation drives demand for 7-seater SUVs, while status consciousness favors luxury features. 
                      Regional preference for vehicles capable of handling extreme heat and desert terrain aligns perfectly with Japanese engineering excellence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Your Market Advantages</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {marketAdvantages.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-left">{advantage}</span>
                  </div>
                ))}
              </div>
              <a 
                href="/vehicles" 
                className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Browse Desert-Ready Vehicles
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for Saudi Arabia
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
            <h2 className="text-3xl font-bold mb-4">Ready for Desert Adventure?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with your Japanese vehicle import to Saudi Arabia
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

        {/* Footer Disclaimer */}
        <div className="bg-gray-100 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            Independent exporter - not affiliated with Toyota Motor Corporation
          </div>
        </div>
      </Layout>
    </>
  );
}