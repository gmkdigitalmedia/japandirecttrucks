import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { MagnifyingGlassIcon, TruckIcon, ShieldCheckIcon, GlobeAltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import VehicleCard from '@/components/vehicles/VehicleCard';
import Button from '@/components/ui/Button';
import DefaultSEO from '@/components/seo/DefaultSEO';
import WhatsAppButton from '@/components/whatsapp/WhatsAppButton';
import { vehicleApi } from '@/lib/api';
import { Vehicle } from '@/types';
import { trackSearch, trackCategoryClick } from '@/components/GoogleAnalytics';

const categories = [
  {
    name: 'Landcruiser 70',
    description: 'Classic workhorse - Unmatched reliability & durability',
    manufacturer: 'Toyota',
    model: 'Landcruiser 70',
  },
  {
    name: 'Landcruiser 100',
    description: 'Legendary 4.7L V8 - The perfect balance of luxury & capability',
    manufacturer: 'Toyota',
    model: 'Landcruiser 100',
  },
  {
    name: 'Landcruiser 200',
    description: 'Luxury V8 SUV - Premium comfort meets off-road capability',
    manufacturer: 'Toyota',
    model: 'Landcruiser 200',
  },
  {
    name: 'Landcruiser 300', 
    description: 'Latest model - Twin-turbo V6 with advanced technology',
    manufacturer: 'Toyota',
    model: 'Landcruiser 300',
  },
  {
    name: 'Landcruiser 70 Pickup',
    description: 'Commercial pickup - Built for tough work conditions',
    manufacturer: 'Toyota', 
    model: 'Landcruiser 70 Pickup',
    categoryId: 'pickup',
  },
  {
    name: 'Hilux Surf',
    description: '4Runner equivalent - Mid-size SUV with excellent off-road ability',
    manufacturer: 'Toyota',
    model: 'Hilux Surf',
  },
];

const processSteps = [
  {
    title: 'Search & Select',
    description: 'Browse 50+ road-approved vehicles with detailed condition reports, 20+ high-resolution photos, and transparent pricing including all fees',
    icon: MagnifyingGlassIcon,
  },
  {
    title: 'Inspection & Purchase',
    description: 'Every vehicle includes certified inspection report, maintenance records translation, and video condition assessment. $200 deposit secures your vehicle.',
    icon: CheckCircleIcon,
  },
  {
    title: 'Export Documentation',
    description: 'Complete export documentation prepared: export certificate, bill of lading, customs forms, and title transfer - all customs-ready for your destination country',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Worldwide Shipping',
    description: 'Professional container shipping with real-time tracking, arrival notifications, and pickup instructions. Average 2-6 weeks to destination port depending on location',
    icon: GlobeAltIcon,
  },
];

const trustSignals = [
  '500+ Vehicles Exported',
  '50+ Countries Served',
  '10+ Years Experience',
  'Licensed Export Agent',
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryImages, setCategoryImages] = useState<{[key: string]: string}>({});
  const [heroVehicles, setHeroVehicles] = useState<Vehicle[]>([]);
  const router = useRouter();

  const { data: featuredVehicles, isLoading: featuredLoading } = useQuery(
    'featured-vehicles',
    () => vehicleApi.getFeatured(8),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const { data: stats } = useQuery(
    'vehicle-stats',
    () => vehicleApi.getStats(),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Fetch random vehicle images for categories
  useEffect(() => {
    const fetchCategoryImages = async () => {
      const images: {[key: string]: string} = {};
      
      // Fetch Landcruiser 70 for Browse by Brand  
      try {
        const lc70Response = await fetch(`/api/vehicles?manufacturer=Toyota&model=Landcruiser%2070&limit=10`);
        const lc70Data = await lc70Response.json();
        
        if (lc70Data.success && lc70Data.data && lc70Data.data.length > 0) {
          const availableLc70s = lc70Data.data.filter((v: any) => v.is_available);
          if (availableLc70s.length > 0) {
            const randomLc70 = availableLc70s[Math.floor(Math.random() * availableLc70s.length)];
            images['Landcruiser 70'] = randomLc70.primary_image || '/images/placeholder-vehicle.jpg';
          }
        }
      } catch (error) {
        console.error('Failed to fetch LC70 image:', error);
      }
      
      // Fetch images for other categories
      for (const category of categories) {
        try {
          const response = await fetch(`/api/vehicles?manufacturer=${encodeURIComponent(category.manufacturer)}&model=${encodeURIComponent(category.model)}&limit=10`);
          const data = await response.json();
          
          if (data.success && data.data && data.data.length > 0) {
            // Pick a random vehicle that's available
            const availableVehicles = data.data.filter((v: any) => v.is_available);
            if (availableVehicles.length > 0) {
              const randomVehicle = availableVehicles[Math.floor(Math.random() * availableVehicles.length)];
              // Use categoryId if available, otherwise fallback to manufacturer + model
              const categoryKey = category.categoryId || `${category.manufacturer} ${category.model}`;
              images[categoryKey] = randomVehicle.primary_image || '/images/placeholder-vehicle.jpg';
            }
          }
        } catch (error) {
          console.error(`Failed to fetch image for ${category.name}:`, error);
        }
      }
      
      setCategoryImages(images);
    };

    fetchCategoryImages();
    fetchHeroVehicles();
  }, []);

  const fetchHeroVehicles = async () => {
    try {
      // Get specific Landcruiser models for hero background
      const models = ['Landcruiser%2070', 'Landcruiser%2070%20Pickup', 'Landcruiser%20200', 'Landcruiser%20300'];
      const allVehicles = [];
      
      for (const model of models) {
        const response = await fetch(`/api/vehicles?manufacturer=Toyota&model=${model}&limit=3`);
        const data = await response.json();
        if (data.success && data.data) {
          allVehicles.push(...data.data.filter((v: any) => v.is_available && v.primary_image));
        }
      }
      
      setHeroVehicles(allVehicles);
    } catch (error) {
      console.error('Failed to fetch hero vehicles:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim());
      router.push(`/vehicles?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = async (manufacturerModel: string) => {
    const [manufacturer, ...modelParts] = manufacturerModel.split(' ');
    const model = modelParts.join(' ');
    
    // Track category click
    trackCategoryClick(`${manufacturer} ${model}`);
    
    // Navigate directly to the filtered vehicles page
    router.push(`/vehicles?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`);
  };

  const handleInquiry = (vehicleId: number) => {
    router.push(`/vehicles/${vehicleId}#inquiry`);
  };

  return (
    <>
      <DefaultSEO 
        title="#1 Toyota Landcruiser Export from Japan - Japan Direct Trucks | American Owned"
        description="Leading Toyota Landcruiser exporter in Japan. American-owned with direct auction access. Export Landcruiser 70, 200, 300 to USA, Australia, UK, Kenya, Dubai. Best prices, professional service."
        keywords="toyota landcruiser export japan, landcruiser 70 export, landcruiser 200 export, landcruiser 300 export, buy landcruiser from japan, japanese landcruiser exporter, landcruiser specialist japan, best landcruiser exporter, toyota landcruiser japan, american owned japan exporter, overlanding vehicles japan, land cruiser export japan, land cruiser 70 export, land cruiser 200 export, land cruiser 300 export"
        url="https://japandirecttrucks.com"
      />
      <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] lg:h-[70vh] bg-gray-900 text-white overflow-hidden">
        {/* Background Vehicle Tiles */}
        <div className="absolute inset-0">
          <div className="grid grid-cols-2 gap-2 md:gap-4 p-2 md:p-4 h-full opacity-60">
            {heroVehicles.length > 0 ? (
              Array.from({ length: 4 }, (_, i) => {
                const vehicle = heroVehicles[i % heroVehicles.length];
                return (
                  <div key={i} className="aspect-square bg-gray-700 rounded-lg md:rounded-xl overflow-hidden">
                    {vehicle?.primary_image && (
                      <img
                        src={`/api/images/proxy?url=${encodeURIComponent(vehicle.primary_image)}`}
                        alt="Landcruiser"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', vehicle.primary_image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="aspect-square bg-gray-700 rounded-lg md:rounded-xl" />
              ))
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </div>
        
        <div className="relative container mx-auto px-4 py-8 md:py-12 flex flex-col justify-center min-h-[60vh] lg:h-[70vh]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black/70 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 inline-block">
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold font-display text-balance">
                #1 Toyota Landcruiser Export from Japan
              </h1>
              <p className="text-lg sm:text-xl text-yellow-400 mt-2">American-owned exporter with direct access to Japan's exclusive auctions</p>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl mb-4 md:mb-6 text-gray-200 text-balance max-w-3xl mx-auto">
              Skip the middleman. Get premium Landcruisers, Hilux, and JDM legends 
              at true Japanese market prices.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-200 mb-6 md:mb-8 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span>American team based in Tokyo</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span>Direct dealership access of inspected vehicles</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span>Transparent pricing, no hidden fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span>Export to 50+ countries worldwide</span>
              </div>
            </div>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 md:mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Land Cruiser, Hilux, or any vehicle..."
                  className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-300"
                />
                <Button
                  type="submit"
                  className="absolute right-1 md:right-2 top-1 md:top-2 px-4 md:px-6 py-2"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm">
              {trustSignals.map((signal, index) => (
                <div key={index} className="flex items-center space-x-1 md:space-x-2 bg-white/20 backdrop-blur px-2 md:px-4 py-1 md:py-2 rounded-full">
                  <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp QR Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold mb-4 text-gray-900">WhatsApp Contact</h3>
              <img 
                src="/whatsappqr.png" 
                alt="WhatsApp QR Code for Japan Direct Trucks" 
                className="w-48 h-48 mx-auto rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600 mt-4">
                Scan to chat with us on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our specialized inventory of premium Japanese vehicles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => router.push('/manufacturers')}
              className="group relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden text-left"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {categoryImages['Landcruiser 70'] ? (
                  <img
                    src={categoryImages['Landcruiser 70']}
                    alt="Toyota Landcruiser 70"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                    <TruckIcon className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">
                  Browse by Brand
                </h3>
                <p className="text-sm text-gray-600">
                  Toyota, Nissan, Honda & more
                </p>
              </div>
            </button>
            {categories.map((category, index) => {
              const categoryKey = category.categoryId || `${category.manufacturer} ${category.model}`;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (category.modelId) {
                      // Direct link to models page
                      router.push(`/models/${category.modelId}`);
                    } else {
                      // Use existing random vehicle logic
                      handleCategoryClick(`${category.manufacturer} ${category.model}`);
                    }
                  }}
                  className="group relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden text-left"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {categoryImages[categoryKey] ? (
                      <img
                        src={categoryImages[categoryKey]}
                        alt={category.description}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <TruckIcon className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">
              Featured Vehicles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hand-picked premium vehicles ready for export
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredVehicles?.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onInquiry={handleInquiry}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/vehicles')}
            >
              View All Vehicles
            </Button>
          </div>
        </div>
      </section>

      {/* Export Process */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">
              Simple Export Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We handle everything from selection to delivery at your destination port
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <a
                key={index}
                href="/export-process"
                className="text-center block hover:transform hover:scale-105 transition-transform duration-200"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary-700 transition-colors">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 hover:text-primary-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/export-process')}
            >
              Learn More About Export Process
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="section-padding bg-primary-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">
                  {stats?.availableVehicles?.toLocaleString() || '525+'}
                </div>
                <div className="text-primary-200">
                  Available Vehicles
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  50+
                </div>
                <div className="text-primary-200">
                  Countries Served
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  500+
                </div>
                <div className="text-primary-200">
                  Vehicles Exported
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      <section className="section-padding bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              See Our Export Process in Action
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Watch how we handle every step from purchase to shipping
            </p>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              <iframe 
                src="https://www.youtube.com/embed/Nqaihw-ZXpI"
                title="Japan Direct Trucks Export Process"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & WhatsApp Section */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold font-display mb-6">
                  Ready to Find Your Perfect Japanese Vehicle?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Get personalized assistance from our American team in Japan. 
                  We'll help you find, inspect, and export your ideal vehicle.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.push('/vehicles')}
                  >
                    Browse Vehicles
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/contact')}
                  >
                    Get Personal Assistance
                  </Button>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-lg font-semibold text-gray-900 mb-2">Direct Contact</p>
                  <a 
                    href="tel:+81-70-9310-1930" 
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    📞 +81-70-9310-1930
                  </a>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">WhatsApp Contact</h3>
                  <img 
                    src="/whatsappqr.png" 
                    alt="WhatsApp QR Code for Japan Direct Trucks" 
                    className="w-96 h-96 mx-auto rounded-lg shadow-sm"
                  />
                  <p className="text-sm text-gray-600 mt-4">
                    Scan to chat with us on WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
    </>
  );
}