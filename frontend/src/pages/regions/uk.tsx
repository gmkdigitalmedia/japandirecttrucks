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
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function UKPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'DVLA Individual Vehicle Approval (IVA)',
      description: 'Full assistance with IVA testing and DVLA registration for Japanese vehicles.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Type Approval & SVA',
      description: 'Single Vehicle Approval for modified vehicles and specialist imports.'
    },
    {
      icon: TruckIcon,
      title: 'Right-Hand Drive Advantage',
      description: 'Japanese RHD vehicles perfect for UK roads - no conversion needed.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Import Duty & VAT Handling',
      description: 'Complete customs clearance including 10% duty and 20% VAT processing.'
    }
  ];

  const marketAdvantages = [
    'No steering wheel conversion required (RHD vehicles)',
    'Strong Japanese vehicle heritage and acceptance',
    'Established import channels and specialists',
    'Growing classic JDM market appreciation',
    'Competitive pricing vs UK dealer networks',
    'Superior Japanese maintenance standards'
  ];

  const compliancePoints = [
    'Individual Vehicle Approval (IVA) for non-EU vehicles',
    'MOT testing after first registration',
    'DVLA V55/5 registration documentation',
    'Insurance requirements and vehicle identification',
    'Emissions compliance (Euro standards)',
    'Construction and Use Regulations adherence'
  ];

  return (
    <>
      <DynamicVehicleSEO 
        vehicles={vehicles}
        primaryCountry="uk"
        pageUrl="/regions/uk"
      />
      <BusinessSchema 
        page="uk" 
        country="United Kingdom"
        description="Japanese RHD vehicle import to UK. Toyota Land Cruisers and JDM classics with DVLA IVA assistance. No conversion needed for British roads."
      />

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-800 to-red-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇬🇧</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Vehicles for United Kingdom
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Right-hand drive Toyota Land Cruisers and JDM classics - perfect for British roads
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">RHD</div>
                    <div className="text-sm opacity-75">No Conversion Needed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">IVA</div>
                    <div className="text-sm opacity-75">Full DVLA Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">JDM</div>
                    <div className="text-sm opacity-75">Classic & Modern</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UK Import Advantages */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Japanese Vehicles Excel in the UK
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Perfect Road Compatibility</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Right-hand drive configuration matches UK roads</li>
                    <li>• No expensive steering conversion required</li>
                    <li>• Better visibility and safety for UK driving</li>
                    <li>• Original manufacturer specifications maintained</li>
                    <li>• Insurance companies prefer unconverted vehicles</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Market Acceptance</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Strong Japanese vehicle heritage in UK</li>
                    <li>• Established specialist mechanics and parts</li>
                    <li>• Growing JDM enthusiast community</li>
                    <li>• Classic vehicle appreciation and values</li>
                    <li>• Proven reliability in British conditions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UK Import Compliance */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">UK Import Compliance Requirements</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">DVLA Registration Process</h3>
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
                      <div className="font-semibold">Import Duty: 10%</div>
                      <div className="text-sm text-gray-600">Applied to vehicle value + shipping</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">VAT: 20%</div>
                      <div className="text-sm text-gray-600">Applied to vehicle value + duty + shipping</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">IVA Test: £456</div>
                      <div className="text-sm text-gray-600">Individual Vehicle Approval testing</div>
                    </div>
                    <div>
                      <div className="font-semibold">DVLA Registration: £55</div>
                      <div className="text-sm text-gray-600">First registration fee</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Professional Import Compliance</h3>
                <p className="text-gray-700 mb-6">
                  Our Export Management Compliance Program (EMCP) ensures full adherence to UK import regulations.
                  We maintain Export Compliance Professional (ECoP®) certification and follow NAVTA standards for vehicle importers.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Documentation Services:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Japanese export certificate preparation</li>
                      <li>• UK customs entry documentation</li>
                      <li>• IVA application and booking</li>
                      <li>• DVLA V55/5 registration forms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Compliance Support:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Pre-shipment compliance checking</li>
                      <li>• UK arrival coordination</li>
                      <li>• IVA test preparation guidance</li>
                      <li>• Post-registration support</li>
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
                UK-Specific Import Services
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
              <h2 className="text-3xl font-bold mb-8">Your UK Import Advantages</h2>
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
              Featured Vehicles for UK Import
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
            <h2 className="text-3xl font-bold mb-4">Ready for Your Perfect RHD Import?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with your Japanese vehicle import to the UK
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