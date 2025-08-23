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
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function GermanyPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'TÜV/DEKRA Compliance',
      description: 'Professional assistance with German technical inspection and approval.'
    },
    {
      icon: DocumentTextIcon,
      title: 'EU Type Approval',
      description: 'Complete EU homologation and German road approval documentation.'
    },
    {
      icon: TruckIcon,
      title: 'Autobahn-Ready Vehicles',
      description: 'High-performance Japanese vehicles perfect for German driving conditions.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'EU Import Processing',
      description: 'VAT handling and customs clearance for EU market entry.'
    }
  ];

  const marketAdvantages = [
    'Strong German appreciation for Japanese engineering quality',
    'Established network of Japanese vehicle specialists',
    'Premium market positioning for Land Cruisers',
    'Growing interest in JDM performance vehicles',
    'Competitive pricing vs German dealer networks',
    'Superior reliability reputation in German market'
  ];

  const compliancePoints = [
    'COC (Certificate of Conformity) for EU vehicles',
    'Individual approval process for non-EU types',
    'TÜV technical inspection and emissions testing',
    'German vehicle registration (Fahrzeugschein)',
    'Insurance requirements and vehicle identification',
    'Euro emissions standards compliance'
  ];

  return (
    <>
      <Head>
        <title>Japanese Vehicle Import to Germany - Land Cruisers & JDM Cars | Japan Direct Trucks</title>
        <meta name="description" content="Import Japanese vehicles to Germany. Toyota Land Cruisers, JDM performance cars with TÜV approval. Professional EU compliance assistance." />
        <meta name="keywords" content="japanese cars germany import, land cruiser germany, jdm import germany, tuv approval, japanese vehicle germany" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-black to-red-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇩🇪</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Vehicles for Germany
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Premium Japanese engineering meets German precision - Toyota Land Cruisers & JDM performance
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">TÜV</div>
                    <div className="text-sm opacity-75">Full Approval Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">EU</div>
                    <div className="text-sm opacity-75">Market Compliance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Autobahn</div>
                    <div className="text-sm opacity-75">Performance Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* German Market Analysis */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Japanese Vehicles in the German Market
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Quality Recognition</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• German market highly values Japanese reliability</li>
                    <li>• Toyota consistently top-rated in German surveys</li>
                    <li>• Strong aftermarket support and specialist network</li>
                    <li>• Premium positioning for Land Cruiser models</li>
                    <li>• Growing appreciation for JDM performance heritage</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Technical Standards</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Japanese engineering meets German precision standards</li>
                    <li>• Superior build quality recognized by TÜV inspectors</li>
                    <li>• Advanced emissions technology compliance</li>
                    <li>• Performance capabilities ideal for Autobahn driving</li>
                    <li>• Safety systems exceed European requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* German Import Compliance */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">German Import Compliance Requirements</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-red-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">Registration Process</h3>
                  <ul className="space-y-3 text-gray-700">
                    {compliancePoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white p-8 border rounded-lg">
                  <h3 className="text-2xl font-bold mb-6">Import Costs</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="font-semibold">Import Duty: 10%</div>
                      <div className="text-sm text-gray-600">Applied to vehicle value + shipping</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">VAT: 19%</div>
                      <div className="text-sm text-gray-600">Applied to total value including duty</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">Individual Approval: €500-1500</div>
                      <div className="text-sm text-gray-600">TÜV testing and certification</div>
                    </div>
                    <div>
                      <div className="font-semibold">Registration: €26-200</div>
                      <div className="text-sm text-gray-600">German license plates and documentation</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black text-white rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Professional German Import Support</h3>
                <p className="text-gray-300 mb-6">
                  Our specialized German import team understands the rigorous TÜV requirements and EU compliance standards.
                  We maintain partnerships with certified testing facilities and German vehicle specialists.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-red-400">Technical Services:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Pre-export TÜV compatibility assessment</li>
                      <li>• German customs documentation preparation</li>
                      <li>• Individual approval application support</li>
                      <li>• Technical modification guidance if required</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-red-400">Registration Support:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Zulassungsstelle appointment coordination</li>
                      <li>• Insurance verification assistance</li>
                      <li>• Fahrzeugschein document preparation</li>
                      <li>• Post-registration technical support</li>
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
                Germany-Specific Import Services
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

        {/* Competitive Advantages */}
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Your German Import Advantages</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {marketAdvantages.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <CheckCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <span className="text-left">{advantage}</span>
                  </div>
                ))}
              </div>
              <a 
                href="/vehicles" 
                className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Browse German-Ready Vehicles
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for German Import
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
            <h2 className="text-3xl font-bold mb-4">Bereit für Präzision aus Japan?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for professional assistance with your Japanese vehicle import to Germany
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="tel:+817091301930" 
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                📞 Call +81-70-9310-1930
              </a>
              <a 
                href="/export-process" 
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
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