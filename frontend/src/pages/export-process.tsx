import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { 
  TruckIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const exportDestinations = [
  {
    region: 'United States',
    flag: '🇺🇸',
    link: '/regions/usa',
    description: 'Full service export with documentation and port delivery available',
    transitTime: '2-4 weeks',
    specialRequirements: '25+ year rule for most vehicles'
  },
  {
    region: 'Canada',
    flag: '🇨🇦',
    link: '/regions/canada',
    description: 'Complete export service to Canadian ports',
    transitTime: '2-4 weeks',
    specialRequirements: '15+ year rule, RIV compliance required'
  },
  {
    region: 'United Kingdom',
    flag: '🇬🇧', 
    link: '/regions/uk',
    description: 'Complete export service with UK-specific documentation',
    transitTime: '3-5 weeks',
    specialRequirements: 'SVA/IVA testing may be required'
  },
  {
    region: 'Australia',
    flag: '🇦🇺',
    link: '/regions/australia',
    description: 'Right-hand drive vehicles with full compliance',
    transitTime: '2-3 weeks',
    specialRequirements: 'SEVS approval and compliance required'
  },
  {
    region: 'New Zealand',
    flag: '🇳🇿',
    link: '/regions/new-zealand',
    description: 'Direct export to NZ ports with compliance documentation',
    transitTime: '2-3 weeks',
    specialRequirements: 'Entry certification required'
  },
  {
    region: 'Kenya',
    flag: '🇰🇪',
    link: '/regions/kenya',
    description: 'Export to Mombasa port with KEBS inspection',
    transitTime: '4-5 weeks',
    specialRequirements: '8-year age limit, KEBS inspection required'
  },
  {
    region: 'Nigeria',
    flag: '🇳🇬',
    link: '/regions/nigeria',
    description: 'Export to Lagos and other Nigerian ports',
    transitTime: '5-6 weeks',
    specialRequirements: 'Age restrictions apply, duty varies by state'
  },
  {
    region: 'UAE/Dubai',
    flag: '🇦🇪',
    link: '/regions/dubai',
    description: 'Export to Jebel Ali and other UAE ports',
    transitTime: '2-3 weeks',
    specialRequirements: 'GCC specs preferred, left-hand drive available'
  },
  {
    region: 'Saudi Arabia',
    flag: '🇸🇦',
    link: '/regions/saudi-arabia',
    description: 'Export to Jeddah and Dammam ports',
    transitTime: '2-3 weeks',
    specialRequirements: '5-year age limit, SASO certification required'
  },
  {
    region: 'Qatar',
    flag: '🇶🇦',
    link: '/regions/qatar',
    description: 'Export to Hamad Port with full documentation',
    transitTime: '2-3 weeks',
    specialRequirements: 'GCC specs, age restrictions apply'
  },
  {
    region: 'Pakistan',
    flag: '🇵🇰',
    link: '/regions/pakistan',
    description: 'Export to Karachi port with customs clearance',
    transitTime: '3-4 weeks',
    specialRequirements: 'Age and engine size restrictions'
  },
  {
    region: 'India',
    flag: '🇮🇳',
    link: '/regions/india',
    description: 'Export for personal import or classic vehicles',
    transitTime: '3-4 weeks',
    specialRequirements: 'Strict import regulations, classic car exemptions'
  },
  {
    region: 'Philippines',
    flag: '🇵🇭',
    link: '/regions/philippines',
    description: 'Export to Manila and Subic ports',
    transitTime: '2-3 weeks',
    specialRequirements: 'Returning residents program available'
  },
  {
    region: 'Germany',
    flag: '🇩🇪',
    link: '/regions/germany',
    description: 'Export to Hamburg and Bremerhaven',
    transitTime: '4-5 weeks',
    specialRequirements: 'TÜV inspection required'
  },
  {
    region: 'France',
    flag: '🇫🇷',
    link: '/regions/france',
    description: 'Export to Le Havre and Marseille',
    transitTime: '4-5 weeks',
    specialRequirements: 'Certificate of conformity required'
  },
  {
    region: 'Italy',
    flag: '🇮🇹',
    link: '/regions/italy',
    description: 'Export to Genoa and Venice ports',
    transitTime: '4-5 weeks',
    specialRequirements: 'EU type approval required'
  },
  {
    region: 'Ukraine',
    flag: '🇺🇦',
    link: '/regions/ukraine',
    description: 'Export to Odessa port',
    transitTime: '5-6 weeks',
    specialRequirements: 'Age and emission restrictions'
  },
  {
    region: 'Iran',
    flag: '🇮🇷',
    link: '/regions/iran',
    description: 'Export through authorized channels',
    transitTime: '3-4 weeks',
    specialRequirements: 'Special documentation required'
  },
  {
    region: 'Lebanon',
    flag: '🇱🇧',
    link: '/regions/lebanon',
    description: 'Export to Beirut port',
    transitTime: '3-4 weeks',
    specialRequirements: '8-year age limit for most vehicles'
  }
];

const processSteps = [
  {
    step: 1,
    title: 'Contact & Vehicle Selection',
    description: 'Browse our inventory and contact us about your desired vehicle',
    icon: GlobeAltIcon,
    cost: 'Free'
  },
  {
    step: 2,
    title: 'Secure Vehicle ($200 Deposit)',
    description: 'Pay $200 deposit to secure the vehicle and begin paperwork process',
    icon: CurrencyDollarIcon,
    cost: '$200'
  },
  {
    step: 3,
    title: 'Payment & Legal Purchase',
    description: 'Transfer remaining balance plus service fee ($500 + 10% of vehicle price). We handle legal purchase and documentation',
    icon: DocumentTextIcon,
    cost: '$500 + 10% of Vehicle Price'
  },
  {
    step: 4,
    title: 'Storage & Port Transfer',
    description: 'Vehicle stored safely until transport, then transferred to Japanese port',
    icon: TruckIcon,
    cost: 'Included'
  },
  {
    step: 5,
    title: 'International Shipping',
    description: 'Vehicle shipped with all correct paperwork and documentation',
    icon: ShieldCheckIcon,
    cost: 'Shipping Costs'
  },
  {
    step: 6,
    title: 'Delivery (Optional)',
    description: 'We can arrange transport from destination port to your location',
    icon: ClockIcon,
    cost: 'Additional Service'
  }
];

export default function ExportProcessPage() {
  const [selectedDestination, setSelectedDestination] = useState('United States');

  return (
    <Layout
      title="Export Process - Land Cruisers and Trucks from Japan | GPS Trucks Japan"
      description="Export Toyota Land Cruisers and trucks from Japan to USA, UK, Middle East, Africa. Professional export service with road-approved vehicles, English support, and complete documentation. Save money buying quality Japanese vehicles."
      keywords="land cruiser export japan, trucks from japan, toyota land cruiser japan export, japanese vehicle export, land cruiser 70 export, land cruiser 200 export, export cars from japan"
    >
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Professional Vehicle Export Service
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                From Japan to anywhere in the world - we handle everything so you don't have to
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-primary-700 px-4 py-2 rounded-full">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Full Legal Documentation</span>
                </div>
                <div className="flex items-center space-x-2 bg-primary-700 px-4 py-2 rounded-full">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Professional Storage</span>
                </div>
                <div className="flex items-center space-x-2 bg-primary-700 px-4 py-2 rounded-full">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Port Transfer Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Buy From Us */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Why Buy From Japan Direct Trucks?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center text-primary-600">
                      <CheckCircleIcon className="h-6 w-6 mr-2" />
                      Road-Approved Vehicles Only
                    </h3>
                    <p className="text-gray-600">
                      Unlike auction houses that sell vehicles with unknown histories, we only sell road-approved, 
                      inspected vehicles. Every vehicle has passed Japan's rigorous Shaken inspection system, which is a rigorous 200+ point inspection.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center text-primary-600">
                      <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                      Save Money Overall
                    </h3>
                    <p className="text-gray-600">
                      Our transparent pricing ($500 + 10% of vehicle price) is competitive when you factor in 
                      the hidden costs of auctions: surprise repairs ($2,000-5,000), transport fees, documentation 
                      charges, and storage costs that other agents add on top.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center text-primary-600">
                      <GlobeAltIcon className="h-6 w-6 mr-2" />
                      English-Speaking Service
                    </h3>
                    <p className="text-gray-600">
                      Avoid language barriers and inflexible Japanese dealerships. We provide full English support 
                      throughout the entire process, from selection to delivery.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center text-primary-600">
                      <ShieldCheckIcon className="h-6 w-6 mr-2" />
                      Transparent Process
                    </h3>
                    <p className="text-gray-600">
                      Know exactly what you're buying. We provide detailed photos, inspection reports, and full 
                      disclosure of any issues. No auction gambles or surprise defects.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center text-primary-600">
                      <DocumentTextIcon className="h-6 w-6 mr-2" />
                      Complete Documentation
                    </h3>
                    <p className="text-gray-600">
                      All export paperwork handled professionally. We ensure your vehicle arrives with proper 
                      documentation, avoiding costly delays at customs.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center text-primary-600">
                      <ClockIcon className="h-6 w-6 mr-2" />
                      Japanese Quality, Global Service
                    </h3>
                    <p className="text-gray-600">
                      Get the best of both worlds - Japan's exceptional vehicle quality and maintenance standards 
                      with American-style customer service and communication.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary-50 rounded-lg p-6 text-center">
                <p className="text-lg text-primary-900 font-medium">
                  "Save money buying directly from Japan while still receiving excellent service and support in English"
                </p>
              </div>
              
              {/* Pricing Comparison */}
              <div className="mt-12 bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Transparent Pricing Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Typical Auction Route</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Agent fee: $600-1,600 + 3-5%</li>
                      <li>• Hidden auction fees: $200-300</li>
                      <li>• Transport to port: $150-400</li>
                      <li>• Documentation: $130-200</li>
                      <li>• Storage fees: $20-50/day</li>
                      <li className="font-semibold text-red-600">• Surprise repairs: $2,000-5,000</li>
                      <li className="font-bold text-gray-900">Total: Often $3,000-7,000+ in fees</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-600 mb-3">GPS Trucks Japan</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Service fee: $500 + 10% of price</li>
                      <li>• Storage: Included</li>
                      <li>• Port transfer: Included</li>
                      <li>• Documentation: Included</li>
                      <li>• All fees transparent upfront</li>
                      <li className="font-semibold text-green-600">• Road-approved = No surprises</li>
                      <li className="font-bold text-primary-600">Example: $2,500 total on $20k vehicle</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Destinations */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Export Destinations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
              {exportDestinations.map((destination) => (
                <Link
                  key={destination.region}
                  href={destination.link}
                  className="block"
                >
                  <div
                    className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all h-full hover:border-primary-500 hover:shadow-lg ${
                      selectedDestination === destination.region
                        ? 'border-primary-500 shadow-lg'
                        : 'border-gray-200'
                    }`}
                    onMouseEnter={() => setSelectedDestination(destination.region)}
                  >
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">{destination.flag}</div>
                      <h3 className="text-lg font-semibold">{destination.region}</h3>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">{destination.description}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transit:</span>
                        <span className="font-medium">{destination.transitTime}</span>
                      </div>
                      <div className="text-gray-500">
                        <p className="mt-1 text-xs">{destination.specialRequirements}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Export Process</h2>
              
              <div className="space-y-8">
                {processSteps.map((step, index) => (
                  <div key={step.step} className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-semibold flex items-center">
                            <step.icon className="h-6 w-6 mr-2 text-primary-600" />
                            {step.title}
                          </h3>
                          <span className="text-primary-600 font-semibold">{step.cost}</span>
                        </div>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Additional Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <DocumentTextIcon className="h-6 w-6 mr-2 text-primary-600" />
                    Pre-Purchase Inspection
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Comprehensive vehicle inspection by certified technicians
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Complete mechanical inspection</li>
                      <li>• Retrieve all maintenance records (Japanese)</li>
                      <li>• Scan and translate key documents</li>
                      <li>• Detailed condition report with photos</li>
                    </ul>
                    <div className="text-2xl font-bold text-primary-600">$300</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <TruckIcon className="h-6 w-6 mr-2 text-primary-600" />
                    Destination Delivery
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Door-to-door delivery from destination port
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Professional auto transport</li>
                      <li>• Insurance coverage during transport</li>
                      <li>• Flexible delivery scheduling</li>
                      <li>• Real-time tracking updates</li>
                    </ul>
                    <div className="text-lg font-semibold text-gray-700">Quote on Request</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Important Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary-600">Payment Terms</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• $200 deposit to secure vehicle</li>
                      <li>• Deposit is deducted from final service fee</li>
                      <li>• Service fee: $500 base + 10% of vehicle price</li>
                      <li>• Example: $20,000 vehicle = $2,500 total fee</li>
                      <li>• Full payment required before shipping</li>
                      <li>• Wire transfer or certified funds only</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary-600">Service Includes</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Vehicle purchase and legal documentation</li>
                      <li>• Export paperwork and customs forms</li>
                      <li>• Professional storage until shipping</li>
                      <li>• Transfer to Japanese port</li>
                      <li>• All required certificates and titles</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary-600">Important Notes</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• No extended warranties provided</li>
                      <li>• Vehicle sold as-is with full disclosure</li>
                      <li>• Import regulations vary by country</li>
                      <li>• Customer responsible for import duties</li>
                      <li>• Shipping costs separate from service fee</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary-600">Timeline</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Documentation: 3-5 business days</li>
                      <li>• Storage period: Until shipping arranged</li>
                      <li>• Port transfer: 1-2 days before departure</li>
                      <li>• Ocean transit: 2-6 weeks (destination dependent)</li>
                      <li>• Port clearance: 3-7 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-primary-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Export Your Dream Car?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Contact us today to begin the process. We'll guide you through every step and ensure 
              your vehicle arrives safely with all proper documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:sales@japandirecttrucks.com"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Email Us
              </a>
              <a
                href="tel:+81-070-9310-1930"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Call: +81-070-9310-1930
              </a>
              <a
                href="/vehicles"
                className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
              >
                Browse Vehicles
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}