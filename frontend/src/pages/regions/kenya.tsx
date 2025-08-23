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
  CheckCircleIcon,
  ArrowRightIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function KenyaPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'KEBS Standards Compliance',
      description: 'Full Kenya Bureau of Standards approval and vehicle inspection compliance.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Right-Hand Drive Advantage',
      description: 'Japanese RHD vehicles perfect for Kenyan roads - no conversion needed.'
    },
    {
      icon: TruckIcon,
      title: 'Safari & Terrain Ready',
      description: 'Toyota Land Cruisers engineered for African safari and challenging terrain.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Duty & VAT Handling',
      description: 'Complete customs clearance including import duty and 16% VAT processing.'
    }
  ];

  const marketAdvantages = [
    'Strong Japanese vehicle heritage in Kenya',
    'Established Toyota dealer and service networks',
    'Right-hand drive - no conversion required',
    'Proven reliability in African conditions',
    'Strong resale value and market acceptance',
    'Safari and off-road capability highly valued'
  ];

  const compliancePoints = [
    'Kenya Bureau of Standards (KEBS) pre-export verification',
    'Certificate of Roadworthiness application',
    'National Transport and Safety Authority (NTSA) approval',
    'Kenya Revenue Authority (KRA) customs clearance',
    'Motor vehicle inspection and registration',
    'Insurance requirements and third-party coverage'
  ];

  return (
    <>
      <BusinessSchema 
        page="kenya" 
        country="Kenya"
        description="Japanese RHD vehicle import to Kenya. Toyota Land Cruisers and safari vehicles with KEBS compliance. Perfect for African roads and safari terrain."
      />
      <Head>
        <title>Japanese Vehicle Import to Kenya - RHD Land Cruisers & Safari Vehicles | Japan Direct Trucks</title>
        <meta name="description" content="Import Japanese RHD vehicles to Kenya. Toyota Land Cruisers, safari-ready SUVs with KEBS compliance. Perfect for African roads, safari terrain with Mombasa port delivery." />
        <meta name="keywords" content="japanese cars kenya import, rhd land cruiser kenya, safari vehicles kenya, kebs compliance, toyota kenya, mombasa port import" />
        
        {/* Open Graph tags for social media */}
        <meta property="og:title" content="Japanese RHD Vehicle Import to Kenya - Safari & Land Cruiser Specialists" />
        <meta property="og:description" content="Import Japanese RHD vehicles to Kenya. Toyota Land Cruisers perfect for safari and African terrain. KEBS compliance assistance included." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://japandirecttrucks.com/regions/kenya" />
        <meta property="og:image" content="https://japandirecttrucks.com/images/land-cruiser-kenya-safari.jpg" />
        <meta property="og:site_name" content="Japan Direct Trucks" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Japanese RHD Vehicles for Kenya - Safari Ready" />
        <meta name="twitter:description" content="Import Toyota Land Cruisers to Kenya. RHD vehicles perfect for safari and African roads. KEBS compliance included." />
        <meta name="twitter:image" content="https://japandirecttrucks.com/images/land-cruiser-kenya-safari.jpg" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Japan Direct Trucks" />
        <link rel="canonical" href="https://japandirecttrucks.com/regions/kenya" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-black to-red-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇰🇪</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Vehicles for Kenya
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Right-hand drive Toyota Land Cruisers and safari-ready vehicles for African adventures
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">RHD</div>
                    <div className="text-sm opacity-75">Perfect for Kenya</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">KEBS</div>
                    <div className="text-sm opacity-75">Full Compliance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Safari</div>
                    <div className="text-sm opacity-75">Terrain Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kenyan Market Analysis */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Japanese Vehicles in the Kenyan Market
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Market Leadership</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Toyota dominates the Kenyan automotive market</li>
                    <li>• Strong brand recognition and trust</li>
                    <li>• Extensive dealer and service network coverage</li>
                    <li>• Land Cruiser preferred for safari and business use</li>
                    <li>• Right-hand drive compatibility advantage</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">African Conditions</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Proven reliability in challenging African terrain</li>
                    <li>• Excellent performance in hot climate conditions</li>
                    <li>• Superior off-road capabilities for safari use</li>
                    <li>• Strong resale value and market acceptance</li>
                    <li>• Spare parts availability and service support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kenyan Import Compliance */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Kenyan Import Compliance Requirements</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-green-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">Registration Process</h3>
                  <ul className="space-y-3 text-gray-700">
                    {compliancePoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white p-8 border rounded-lg">
                  <h3 className="text-2xl font-bold mb-6">Import Costs</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="font-semibold">Import Duty: 25%</div>
                      <div className="text-sm text-gray-600">Applied to CIF value</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">VAT: 16%</div>
                      <div className="text-sm text-gray-600">Applied to value + duty</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">Railway Development Levy: 2%</div>
                      <div className="text-sm text-gray-600">Applied to CIF value</div>
                    </div>
                    <div>
                      <div className="font-semibold">KEBS Fee: KSh 15,000-25,000</div>
                      <div className="text-sm text-gray-600">Pre-export verification of conformity</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-black to-red-600 to-green-600 text-white rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Professional Kenyan Import Support</h3>
                <p className="text-green-100 mb-6">
                  Our Kenyan import specialists understand the KEBS requirements and NTSA compliance standards.
                  We maintain partnerships with clearing agents and certified inspection facilities in Kenya.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-300">Pre-Export Services:</h4>
                    <ul className="space-y-2 text-sm text-green-100">
                      <li>• KEBS pre-export verification coordination</li>
                      <li>• Export certificate preparation</li>
                      <li>• Bill of lading and shipping documentation</li>
                      <li>• Japanese customs export clearance</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-300">Kenya Arrival Support:</h4>
                    <ul className="space-y-2 text-sm text-green-100">
                      <li>• Mombasa port clearance assistance</li>
                      <li>• KRA customs duty calculation and payment</li>
                      <li>• NTSA registration guidance</li>
                      <li>• Certificate of Roadworthiness processing</li>
                    </ul>
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
                Kenya-Specific Import Services
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

        {/* Competitive Advantages */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Your Kenyan Import Advantages</h2>
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
                Browse Safari-Ready Vehicles
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for Kenyan Import
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
            <h2 className="text-3xl font-bold mb-4">Ready for Your African Adventure?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with your Japanese vehicle import to Kenya
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