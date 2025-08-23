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

export default function ItalyPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Ministero dei Trasporti Approval',
      description: 'Complete Italian Ministry of Transport approval and certification assistance.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Revisione Periodica',
      description: 'Italian MOT equivalent and technical inspection support for road approval.'
    },
    {
      icon: TruckIcon,
      title: 'Alpine & Coastal Ready',
      description: 'Japanese 4WD vehicles perfect for Italian mountain and coastal conditions.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'EU Import Processing',
      description: 'Complete customs handling including 10% duty and 22% IVA processing.'
    }
  ];

  const marketAdvantages = [
    'Strong Italian appreciation for Japanese reliability',
    'Growing SUV and crossover market in Italy',
    'Established Toyota presence and dealer network',
    'Premium positioning for Land Cruiser models',
    'Competitive pricing vs Italian dealer networks',
    'Fuel efficiency valued in European market context'
  ];

  const compliancePoints = [
    'Certificate of Conformity (COC) for EU vehicles',
    'Individual approval for non-EU homologated vehicles',
    'Ministero dei Trasporti documentation',
    'Italian vehicle registration (Carta di Circolazione)',
    'Revisione periodica (technical inspection)',
    'Euro 6 emissions standards compliance'
  ];

  return (
    <>
      <Head>
        <title>Japanese Vehicle Import to Italy - Land Cruisers & SUVs | Japan Direct Trucks</title>
        <meta name="description" content="Import Japanese vehicles to Italy. Toyota Land Cruisers, SUVs with Italian Ministry approval. Professional EU compliance assistance." />
        <meta name="keywords" content="japanese cars italy import, land cruiser italy, italian vehicle import, ministero trasporti approval" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-white to-red-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇮🇹</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Veicoli Giapponesi per l'Italia
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Toyota Land Cruiser e SUV giapponesi - Affidabilità e prestazioni per le strade italiane
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">EU</div>
                    <div className="text-sm opacity-75">Standards Compliance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">22%</div>
                    <div className="text-sm opacity-75">IVA Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Alpine</div>
                    <div className="text-sm opacity-75">Terrain Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Italian Market Analysis */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Japanese Vehicles in the Italian Market
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Market Appreciation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Strong Italian recognition of Japanese quality</li>
                    <li>• Growing SUV and crossover market demand</li>
                    <li>• Established Toyota dealer and service networks</li>
                    <li>• Premium positioning for reliable 4WD vehicles</li>
                    <li>• Alpine terrain capability highly valued</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Italian Compliance</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Japanese engineering meets EU standards</li>
                    <li>• Advanced emissions technology for Euro compliance</li>
                    <li>• Superior safety systems exceed Italian requirements</li>
                    <li>• Quality recognized by Italian technical inspectors</li>
                    <li>• Proven reliability in Mediterranean conditions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Italian Import Compliance */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Italian Import Compliance Requirements</h2>
              
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
                      <div className="font-semibold">Import Duty: 10%</div>
                      <div className="text-sm text-gray-600">Applied to vehicle value + shipping</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">IVA: 22%</div>
                      <div className="text-sm text-gray-600">Applied to total value including duty</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="font-semibold">Individual Approval: €400-1000</div>
                      <div className="text-sm text-gray-600">Ministry approval and testing</div>
                    </div>
                    <div>
                      <div className="font-semibold">Registration: €200-400</div>
                      <div className="text-sm text-gray-600">Italian license plates and documentation</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-red-600 text-white rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Professional Italian Import Support</h3>
                <p className="text-green-100 mb-6">
                  Our Italian import specialists understand the Ministero dei Trasporti requirements and EU compliance standards.
                  We maintain partnerships with certified testing facilities and Italian vehicle specialists.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-300">Documentation Services:</h4>
                    <ul className="space-y-2 text-sm text-green-100">
                      <li>• Ministry of Transport approval processing</li>
                      <li>• Italian customs documentation preparation</li>
                      <li>• Individual vehicle approval applications</li>
                      <li>• Technical compliance verification</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-300">Registration Support:</h4>
                    <ul className="space-y-2 text-sm text-green-100">
                      <li>• Motorizzazione appointment coordination</li>
                      <li>• Revisione periodica preparation</li>
                      <li>• Insurance verification assistance</li>
                      <li>• Carta di Circolazione completion</li>
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
                Italy-Specific Import Services
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
              <h2 className="text-3xl font-bold mb-8">Your Italian Import Advantages</h2>
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
                Sfoglia i Veicoli
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for Italian Import
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
            <h2 className="text-3xl font-bold mb-4">Pronto per la Qualità Giapponese?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us for personalized assistance with your Japanese vehicle import to Italy
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