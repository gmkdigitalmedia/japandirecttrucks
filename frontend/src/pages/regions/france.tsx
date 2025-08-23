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

export default function FrancePage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Réception à Titre Isolé (RTI)',
      description: 'Full support for French individual vehicle approval and DREAL certification.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Contrôle Technique',
      description: 'Technical inspection assistance and emissions compliance for French roads.'
    },
    {
      icon: TruckIcon,
      title: 'European Standards',
      description: 'Japanese vehicles meeting stringent European safety and emissions requirements.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'TVA & Import Duties',
      description: 'Complete customs handling including 10% duty and 20% VAT processing.'
    }
  ];

  const marketAdvantages = [
    'Strong French appreciation for Japanese reliability',
    'Growing SUV market demand in France',
    'Established Toyota dealer network support',
    'Premium positioning for Land Cruiser models',
    'Competitive pricing vs French dealer networks',
    'Superior fuel efficiency valued in European market'
  ];

  const compliancePoints = [
    'Réception à Titre Isolé (RTI) individual approval',
    'DREAL regional approval and documentation',
    'Contrôle technique (CT) roadworthiness testing',
    'French registration (Certificat d\'immatriculation)',
    'Insurance requirements and identification',
    'Euro 6 emissions standards compliance'
  ];

  return (
    <>
      <Head>
        <title>Japanese Vehicle Import to France - Land Cruisers & SUVs | Japan Direct Trucks</title>
        <meta name="description" content="Import Japanese vehicles to France. Toyota Land Cruisers, SUVs with RTI approval. Professional French compliance and DREAL certification." />
        <meta name="keywords" content="japanese cars france import, land cruiser france, rti approval france, japanese vehicle france" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-white to-red-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇫🇷</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Véhicules Japonais pour la France
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Toyota Land Cruisers et SUVs japonais - Excellence et fiabilité pour les routes françaises
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">RTI</div>
                    <div className="text-sm opacity-75">Approval Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">DREAL</div>
                    <div className="text-sm opacity-75">Certification</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Euro 6</div>
                    <div className="text-sm opacity-75">Emissions Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* French Market Analysis */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Japanese Vehicles in the French Market
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Market Acceptance</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Strong Toyota brand recognition and trust</li>
                    <li>• Growing French SUV market preference</li>
                    <li>• Established dealer and service networks</li>
                    <li>• Premium positioning for reliable 4WD vehicles</li>
                    <li>• Fuel efficiency valued in European context</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">French Compliance</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Japanese engineering meets European standards</li>
                    <li>• Superior emissions technology for Euro compliance</li>
                    <li>• Advanced safety systems exceed French requirements</li>
                    <li>• Quality construction recognized by French inspectors</li>
                    <li>• Proven reliability in European driving conditions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* French Import Compliance */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">French Import Compliance Requirements</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">Registration Process</h3>
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
                  <h3 className="text-2xl font-bold mb-6">Import Costs</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="font-semibold">Import Duty: 10%</div>
                      <div className="text-sm text-gray-600">Applied to vehicle value + shipping</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">TVA: 20%</div>
                      <div className="text-sm text-gray-600">Applied to total value including duty</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">RTI Approval: €300-800</div>
                      <div className="text-sm text-gray-600">Individual vehicle approval process</div>
                    </div>
                    <div>
                      <div className="font-semibold">Registration: €350</div>
                      <div className="text-sm text-gray-600">French license plates and documentation</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Professional French Import Support</h3>
                <p className="text-gray-700 mb-6">
                  Our specialized French import team understands the RTI process and DREAL requirements.
                  We maintain partnerships with certified testing facilities and French vehicle specialists.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Documentation Services:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• RTI application preparation and submission</li>
                      <li>• DREAL approval coordination</li>
                      <li>• French customs documentation</li>
                      <li>• Technical compliance verification</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Registration Support:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Prefecture appointment scheduling</li>
                      <li>• Contrôle technique preparation</li>
                      <li>• Insurance verification assistance</li>
                      <li>• Final registration completion</li>
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
                France-Specific Import Services
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
              <h2 className="text-3xl font-bold mb-8">Your French Import Advantages</h2>
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
                Parcourir les Véhicules
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for French Import
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
            <h2 className="text-3xl font-bold mb-4">Prêt pour Votre Import Japonais?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with your Japanese vehicle import to France
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