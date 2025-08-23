import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import BusinessSchema from '@/components/seo/BusinessSchema';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function NewZealandPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'NZTA Vehicle Standards Compliance',
      description: 'Full New Zealand Transport Agency compliance and vehicle inspection certification.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Right-Hand Drive Advantage',
      description: 'Japanese RHD vehicles perfect for NZ roads - no conversion needed, immediate registration.'
    },
    {
      icon: TruckIcon,
      title: 'Adventure & Terrain Ready',
      description: 'Toyota Land Cruisers engineered for NZ mountains, beaches and rugged terrain.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'GST & Duty Handling',
      description: 'Complete customs clearance including import duty and 15% GST processing.'
    }
  ];

  const marketAdvantages = [
    'Save $20,000-$40,000 vs NZ dealer prices',
    'Strong Japanese vehicle heritage in New Zealand',
    'Right-hand drive - no conversion required',
    'Shorter shipping times (2-3 weeks via Auckland)',
    'Superior Japanese maintenance records',
    'Strong resale value and market acceptance'
  ];

  const compliancePoints = [
    'New Zealand Transport Agency (NZTA) approval',
    'Vehicle inspection and certification',
    'Warrant of Fitness (WoF) eligibility assessment',
    'Customs clearance and duty calculation',
    'Registration and number plate issuance',
    'Emissions compliance (Euro standards where applicable)'
  ];

  return (
    <>
      <BusinessSchema 
        page="new-zealand" 
        country="New Zealand"
        description="Japanese RHD vehicle import to New Zealand. Toyota Land Cruisers with NZTA compliance. Perfect for NZ roads and terrain with Auckland port delivery."
      />
      <Head>
        <title>Japanese Vehicle Import to New Zealand - RHD Land Cruisers & Adventure SUVs | Japan Direct Trucks</title>
        <meta name="description" content="Import Japanese RHD vehicles to New Zealand. Toyota Land Cruisers, adventure-ready SUVs with NZTA compliance. Save $20,000-$40,000 vs NZ dealers with Auckland port delivery." />
        <meta name="keywords" content="japanese cars new zealand import, rhd land cruiser nz, adventure vehicles nz, nzta compliance, toyota new zealand, auckland import" />
        
        {/* Open Graph tags for social media */}
        <meta property="og:title" content="Japanese RHD Vehicle Import to New Zealand - Adventure & Land Cruiser Specialists" />
        <meta property="og:description" content="Import Japanese RHD vehicles to New Zealand. Toyota Land Cruisers perfect for NZ adventure and terrain. NZTA compliance assistance included." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://japandirecttrucks.com/regions/new-zealand" />
        <meta property="og:image" content="https://japandirecttrucks.com/images/land-cruiser-new-zealand.jpg" />
        <meta property="og:site_name" content="Japan Direct Trucks" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Japanese RHD Vehicles for New Zealand - Adventure Ready" />
        <meta name="twitter:description" content="Import Toyota Land Cruisers to New Zealand. Save $20,000-$40,000 vs local dealers. NZTA compliance included." />
        <meta name="twitter:image" content="https://japandirecttrucks.com/images/land-cruiser-new-zealand.jpg" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Japan Direct Trucks" />
        <link rel="canonical" href="https://japandirecttrucks.com/regions/new-zealand" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-black to-blue-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇳🇿</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Vehicles for New Zealand
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Import RHD Toyota Land Cruisers & adventure SUVs with NZTA compliance
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">$30,000</div>
                    <div className="text-sm opacity-75">Average Savings vs NZ Dealers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">RHD</div>
                    <div className="text-sm opacity-75">No Conversion Needed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">NZTA</div>
                    <div className="text-sm opacity-75">Full Compliance Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NZ Market Advantages */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Japanese Vehicles Excel in New Zealand
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Perfect Road Compatibility</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Right-hand drive configuration matches NZ roads</li>
                    <li>• No expensive steering conversion required</li>
                    <li>• Better visibility and safety for NZ driving</li>
                    <li>• Original manufacturer specifications maintained</li>
                    <li>• Immediate WoF eligibility after registration</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Adventure Market Leadership</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Strong Japanese vehicle heritage in NZ</li>
                    <li>• Established specialist mechanics and parts</li>
                    <li>• Perfect for NZ outdoor lifestyle</li>
                    <li>• Proven reliability in diverse conditions</li>
                    <li>• Strong resale value and market demand</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NZTA Compliance */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">New Zealand Import Compliance</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">NZTA Registration Process</h3>
                  <ul className="space-y-3 text-gray-700">
                    {compliancePoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white p-8 border rounded-lg">
                  <h3 className="text-2xl font-bold mb-6">Import Duties & Taxes</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="font-semibold">Import Duty: 0%</div>
                      <div className="text-sm text-gray-600">Free Trade Agreement with Japan</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">GST: 15%</div>
                      <div className="text-sm text-gray-600">Applied to vehicle value + shipping</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">Inspection Fee: $200-500</div>
                      <div className="text-sm text-gray-600">NZTA vehicle inspection</div>
                    </div>
                    <div>
                      <div className="font-semibold">Registration: $100</div>
                      <div className="text-sm text-gray-600">NZTA registration fee</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                New Zealand Import Services
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                    <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Your New Zealand Import Advantages</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {marketAdvantages.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <CheckCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <span className="text-left">{advantage}</span>
                  </div>
                ))}
              </div>
              <a 
                href="/vehicles" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse RHD Vehicles
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for New Zealand Import
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h2 className="text-3xl font-bold mb-4">Ready for Your Perfect Adventure Vehicle?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with your Japanese vehicle import to New Zealand
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="tel:+817091301930" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📞 Call +81-70-9310-1930
              </a>
              <a 
                href="/export-process" 
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
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