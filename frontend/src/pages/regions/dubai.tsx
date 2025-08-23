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
  SunIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

export default function DubaiPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: SunIcon,
      title: 'Desert Climate Engineering',
      description: 'Japanese vehicles proven for UAE extreme heat and desert conditions.'
    },
    {
      icon: BuildingOffice2Icon,
      title: 'Dubai Trade Hub',
      description: 'Strategic location for Middle East and Africa distribution networks.'
    },
    {
      icon: TruckIcon,
      title: 'Luxury SUV Preference',
      description: 'Premium Toyota Land Cruisers perfect for UAE lifestyle and status.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Competitive UAE Pricing',
      description: 'Direct import advantages vs local dealers: AED 238,900 to AED 377,900 range.'
    }
  ];

  const marketAdvantages = [
    'UAE automotive market leading Gulf region growth',
    'Japanese vehicles dominate 60% of Gulf SUV market',
    'Toyota Land Cruiser premium market leadership',
    'Al-Futtaim Motors established dealer network',
    'Strategic re-export hub for wider Middle East',
    'Tax-free import advantages in UAE market'
  ];

  const compliancePoints = [
    'UAE Ministry of Interior vehicle approval',
    'Emirates Authority for Standardization compliance',
    'Dubai Municipality registration requirements',
    'RTA (Roads and Transport Authority) approval',
    'Insurance requirements and vehicle identification',
    'GCC specifications and climate adaptations'
  ];

  return (
    <>
      <Head>
        <title>Japanese Vehicles for Dubai UAE - Desert-Ready Land Cruisers | Japan Direct Trucks</title>
        <meta name="description" content="Import Japanese Toyota Land Cruisers to Dubai UAE. Desert-engineered SUVs for extreme climate. Premium vehicles for UAE luxury market." />
        <meta name="keywords" content="toyota land cruiser dubai, japanese cars uae, gulf import vehicles, dubai luxury suv, uae vehicle import" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇦🇪</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Vehicles for Dubai UAE
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Premium Toyota Land Cruisers engineered for desert excellence and UAE luxury lifestyle
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">60%</div>
                    <div className="text-sm opacity-75">Gulf SUV Market Share</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">AED 377K</div>
                    <div className="text-sm opacity-75">Premium Range Pricing</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Desert</div>
                    <div className="text-sm opacity-75">Climate Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UAE Market Leadership */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                UAE Automotive Market Leadership
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Market Dominance</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Japanese vehicles dominate Middle Eastern markets</li>
                    <li>• SUVs represent over 60% of new car sales in Gulf states</li>
                    <li>• Toyota Land Cruiser leads the premium segment</li>
                    <li>• AED 238,900 to AED 377,900 local dealer pricing</li>
                    <li>• Dubai as strategic trade hub for region</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">UAE Lifestyle Alignment</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Strong family orientation driving 7-seater demand</li>
                    <li>• Status consciousness favoring luxury features</li>
                    <li>• Extreme heat and desert terrain capabilities</li>
                    <li>• Adventure themes aligned with UAE lifestyle</li>
                    <li>• Premium positioning for business and personal use</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">UAE Distribution Network Excellence</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Established Partners:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Al-Futtaim Motors (dominant UAE presence)</li>
                      <li>• Comprehensive dealer network coverage</li>
                      <li>• Essential after-sales service infrastructure</li>
                      <li>• 96% of buyers research online before showroom visits</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Strategic Advantages:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Dubai as Middle East import gateway</li>
                      <li>• Tax-free import benefits in UAE</li>
                      <li>• Re-export opportunities to wider Gulf region</li>
                      <li>• Premium market positioning opportunities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UAE Import Compliance */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">UAE Import Compliance Requirements</h2>
              
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
                  <h3 className="text-2xl font-bold mb-6">Import Benefits</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="font-semibold">Import Duty: 0%</div>
                      <div className="text-sm text-gray-600">Tax-free import advantages</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">VAT: 5%</div>
                      <div className="text-sm text-gray-600">Low VAT rate on imported vehicles</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">Registration: AED 500-1000</div>
                      <div className="text-sm text-gray-600">UAE license plates and documentation</div>
                    </div>
                    <div>
                      <div className="font-semibold">Inspection: AED 200</div>
                      <div className="text-sm text-gray-600">Vehicle technical inspection</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-600 to-green-600 text-white rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Professional UAE Import Support</h3>
                <p className="text-red-100 mb-6">
                  Our UAE import specialists understand the Ministry of Interior requirements and Emirates Authority standards.
                  We maintain partnerships with Dubai-based clearing agents and UAE vehicle specialists.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-300">Dubai Services:</h4>
                    <ul className="space-y-2 text-sm text-red-100">
                      <li>• Dubai Customs clearance coordination</li>
                      <li>• Ministry of Interior approval processing</li>
                      <li>• RTA registration assistance</li>
                      <li>• UAE specifications compliance verification</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-300">Regional Support:</h4>
                    <ul className="space-y-2 text-sm text-red-100">
                      <li>• GCC re-export documentation</li>
                      <li>• Regional dealer network coordination</li>
                      <li>• Desert climate preparation guidance</li>
                      <li>• Premium market positioning support</li>
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
                UAE-Specific Import Services
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
              <h2 className="text-3xl font-bold mb-8">Your UAE Import Advantages</h2>
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
              Featured Vehicles for UAE Import
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
            <h2 className="text-3xl font-bold mb-4">Ready for Desert Luxury?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with your Japanese vehicle import to Dubai UAE
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