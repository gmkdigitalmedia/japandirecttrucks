import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <Layout
      title="About GP - Land Cruiser Expert in Japan | Japan Direct Trucks"
      description="American Land Cruiser enthusiast living in Japan. Helping you import quality Toyota Land Cruisers and trucks from Japan with professional English-speaking service."
      keywords="land cruiser expert japan, toyota land cruiser specialist, import land cruiser from japan, american in japan cars, japan direct trucks"
    >
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Japan Direct Trucks
              </h1>
              <p className="text-xl text-primary-100">
                Your trusted partner for importing quality vehicles from Japan
              </p>
            </div>
          </div>
        </div>

        {/* About GP Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Hi, I'm GP</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      I'm an American living in Japan with a deep passion for Land Cruisers and LX570s. 
                      Over the years, I've owned many of these incredible vehicles and understand what 
                      makes them special.
                    </p>
                    <p>
                      As both a Land Cruiser enthusiast and a software developer, I created Japan Direct Trucks 
                      to help fellow enthusiasts access the amazing selection of vehicles available here in Japan.
                    </p>
                    <p>
                      Living in Japan has given me unique access to well-maintained, road-approved vehicles 
                      that are perfect for export. I leverage my local knowledge and connections to find the 
                      best vehicles for my clients.
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <a
                      href="https://www.linkedin.com/in/gp-s-6166312a6/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
                      </svg>
                      Connect on LinkedIn
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Why I Started This Business</h3>
                  <div className="space-y-3 text-gray-600">
                    <p className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Help enthusiasts navigate the complex Japanese market
                    </p>
                    <p className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Provide transparent, English-speaking service
                    </p>
                    <p className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Share my passion for quality Japanese vehicles
                    </p>
                    <p className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Bridge the gap between Japanese sellers and international buyers
                    </p>
                  </div>
                </div>
              </div>

              {/* My Expertise */}
              <div className="border-t pt-12">
                <h3 className="text-2xl font-bold mb-8 text-center">My Expertise</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <TruckIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Land Cruiser Specialist</h4>
                    <p className="text-sm text-gray-600">
                      Extensive knowledge of Land Cruiser models, especially 70 and 200 series
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <GlobeAltIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Local Knowledge</h4>
                    <p className="text-sm text-gray-600">
                      Living in Japan provides direct access to the best vehicles and dealers
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <h4 className="font-semibold mb-2">Bilingual Service</h4>
                    <p className="text-sm text-gray-600">
                      Fluent English communication with understanding of Japanese business culture
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Get in Touch</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <PhoneIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <a href="tel:+81-070-9310-1930" className="text-primary-600 hover:text-primary-800">
                    +81-070-9310-1930
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Japan Time (JST)</p>
                </div>
                
                <div className="text-center">
                  <EnvelopeIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Email</h4>
                  <a href="mailto:info@japandirecttrucks.com" className="text-primary-600 hover:text-primary-800">
                    info@japandirecttrucks.com
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
                </div>
                
                <div className="text-center">
                  <MapPinIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-gray-600">Japan</p>
                  <p className="text-sm text-gray-500 mt-1">Nationwide vehicle sourcing</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  Ready to find your perfect Land Cruiser or truck from Japan?
                </p>
                <Link
                  href="/vehicles"
                  className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Browse Our Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}