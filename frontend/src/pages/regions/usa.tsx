import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import CompetitiveAdvantage from '@/components/vehicles/CompetitiveAdvantage';
import BusinessSchema from '@/components/seo/BusinessSchema';
import DynamicVehicleSEO from '@/components/seo/DynamicVehicleSEO';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function USAPage() {
  const { vehicles, loading, search } = useVehicleSearch();

  React.useEffect(() => {
    search({ page: 1, limit: 12 });
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'EPA & DOT Compliance Ready',
      description: 'Our vehicles meet import requirements with proper documentation for 25+ year rule exemptions.'
    },
    {
      icon: TruckIcon,
      title: 'Left-Hand Drive Available',
      description: 'Extensive selection of LHD vehicles perfect for US roads and regulations.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Transparent Pricing',
      description: 'Fixed pricing with no hidden fees. $500 + 10% service fee covers everything from Japan to your door.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Road-Approved Vehicles',
      description: 'Unlike auction vehicles, all our trucks are road-tested and come with maintenance records.'
    }
  ];

  const advantages = [
    'Save $20,000-$40,000 vs US dealer prices',
    'Superior Japanese maintenance standards',
    'Physical inspection before purchase',
    'Warranty coverage & legal protection',
    'Professional import handling',
    'EPA/DOT compliance assistance'
  ];

  return (
    <>
      <DynamicVehicleSEO 
        vehicles={vehicles}
        primaryCountry="usa"
        pageUrl="/regions/usa"
      />
      <BusinessSchema 
        page="usa" 
        country="United States"
        description="Japanese vehicle import to USA. 25+ year rule specialists. Toyota Land Cruisers with EPA/DOT compliance assistance."
      />

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🇺🇸</span>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Japanese Trucks for USA
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Import authentic Toyota Land Cruisers, Hilux & more with EPA/DOT compliance
              </p>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">$20,000+</div>
                    <div className="text-sm opacity-75">Average Savings vs US Dealers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">25+ Years</div>
                    <div className="text-sm opacity-75">EPA Exempt Import Rule</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm opacity-75">Road-Tested Vehicles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Over Auctions */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Dealership Over Auction Gambling?
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-red-600 mb-4">❌ Auction Risks</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Blind bidding with no inspection</li>
                    <li>• Hidden damage & mechanical issues</li>
                    <li>• No warranty or legal recourse</li>
                    <li>• Additional fees & complications</li>
                    <li>• No relationship or support</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">✅ Our Guarantee</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Physical inspection before purchase</li>
                    <li>• Road-tested with maintenance records</li>
                    <li>• Warranty coverage included</li>
                    <li>• Fixed transparent pricing</li>
                    <li>• Ongoing support & partnership</li>
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
                USA-Specific Import Services
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
              <h2 className="text-3xl font-bold mb-8">Your Competitive Advantages</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {advantages.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-left">{advantage}</span>
                  </div>
                ))}
              </div>
              <a 
                href="/vehicles" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Available Vehicles
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Vehicles for USA Import
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

        {/* Export Compliance Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Professional Export Compliance</h2>
              
              <div className="bg-blue-50 rounded-lg p-8 mb-12">
                <h3 className="text-2xl font-bold mb-6">Export Management Compliance Program (EMCP)</h3>
                <p className="text-gray-700 mb-6">
                  Our comprehensive compliance framework includes eight core elements to ensure legal and efficient vehicle exports:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Core Compliance Elements:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Management commitment and oversight</li>
                      <li>• Comprehensive risk assessment procedures</li>
                      <li>• Export authorization and documentation</li>
                      <li>• Detailed recordkeeping requirements</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Quality Assurance:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Regular staff training programs</li>
                      <li>• Internal audit procedures</li>
                      <li>• Violation reporting protocols</li>
                      <li>• Corrective action implementation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Professional Certifications</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Export Compliance Professional (ECoP®) certification</li>
                    <li>• EAR and ITAR requirements expertise</li>
                    <li>• Certified U.S. Export Compliance Officer (CUSECO)</li>
                    <li>• Regular training and certification updates</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Industry Associations</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• North American Vehicle Trade Association (NAVTA)</li>
                    <li>• Japanese Used Motor Vehicle Exporting Association (JUMVEA)</li>
                    <li>• Fair trade practices and compliance standards</li>
                    <li>• Continuous compliance monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Save Thousands?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us today for personalized assistance with your Japanese vehicle import
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