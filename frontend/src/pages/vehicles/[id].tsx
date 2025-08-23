import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  CogIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  TruckIcon,
  CurrencyYenIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AIAnalysisCard from '@/components/vehicles/AIAnalysisCard';
import VehicleSEO from '@/components/seo/VehicleSEO';
import WhatsAppButton from '@/components/whatsapp/WhatsAppButton';
import WhatsAppQuickActions from '@/components/whatsapp/WhatsAppQuickActions';
import { vehicleApi, utilityApi } from '@/lib/api';
import { Vehicle } from '@/types';
import { formatPrice, formatMileageWithMiles, getVehicleBadges, getPlaceholderImage } from '@/lib/utils';

export default function VehicleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0.0067);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const { data: vehicle, isLoading, error } = useQuery(
    ['vehicle', id],
    () => vehicleApi.getById(parseInt(id as string)),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: similarVehicles } = useQuery(
    ['similar-vehicles', id],
    () => vehicleApi.getSimilar(parseInt(id as string)),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Get exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const { rate } = await utilityApi.getExchangeRate();
        setExchangeRate(rate);
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using default');
      }
    };
    fetchExchangeRate();
  }, []);

  // Scroll to inquiry form if hash is present
  useEffect(() => {
    if (router.asPath.includes('#inquiry')) {
      setShowInquiryForm(true);
      setTimeout(() => {
        const element = document.getElementById('inquiry');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [router.asPath]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-w-16 aspect-h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !vehicle) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
            <p className="text-gray-600 mb-6">
              The vehicle you're looking for doesn't exist or has been removed.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/vehicles')}
            >
              Browse Vehicles
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const badges = getVehicleBadges(vehicle);
  const priceUSD = Math.round(vehicle.price_total_yen / 150); // Fixed 150 yen per dollar

  const handleInquiry = () => {
    setShowInquiryForm(!showInquiryForm);
  };

  const vehicleImages = vehicle.images || [];

  return (
    <>
      <VehicleSEO vehicle={vehicle} />
      <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/vehicles"
              className="inline-flex items-center text-primary-600 hover:text-primary-800"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Vehicles
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Images Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => setShowImageModal(true)}>
                {vehicleImages.length > 0 && vehicleImages[selectedImageIndex]?.url ? (
                  <img
                    src={vehicleImages[selectedImageIndex].url}
                    alt={vehicleImages[selectedImageIndex].alt_text || vehicle.title_description}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getPlaceholderImage(800, 600);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                
                
                {/* Navigation Arrows */}
                {vehicleImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : vehicleImages.length - 1);
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                    >
                      <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex < vehicleImages.length - 1 ? selectedImageIndex + 1 : 0);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                    >
                      <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* All Thumbnail Images */}
              {vehicleImages.length > 1 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">All Photos ({vehicleImages.length})</h4>
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                    {vehicleImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setShowImageModal(true);
                        }}
                        className={`aspect-w-16 aspect-h-12 bg-gray-200 rounded overflow-hidden border-2 transition-colors hover:border-primary-300 ${
                          selectedImageIndex === index ? 'border-primary-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt_text || `${vehicle.title_description} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-vehicle.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="space-y-6">
              {/* Title and Badges */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {vehicle.title_description}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {vehicle.model_year_ad} • {vehicle.body_style || vehicle.model?.body_type || 'Vehicle'} • {formatMileageWithMiles(vehicle.mileage_km)}
                </p>
                
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {badges.map((badge, index) => (
                      <Badge key={index} variant={badge.variant}>
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Description - Why This Car Stands Out */}
              {(vehicle as any).ai_description && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-blue-600 mr-2">💎</span>
                    Why This Vehicle Stands Out
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {(vehicle as any).ai_description}
                  </p>
                </div>
              )}

              {/* WhatsApp Quick Actions */}
              <WhatsAppQuickActions
                vehicleId={vehicle.id}
                vehicleName={`${vehicle.model_year_ad} ${vehicle.manufacturer.name} ${vehicle.model.name}`}
                price={formatPrice(priceUSD, 'USD')}
              />

              {/* Price */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="price-usd">{formatPrice(priceUSD, 'USD')}</div>
                    <div className="price-yen">{formatPrice(vehicle.price_total_yen, 'JPY')}</div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Exchange rate: ¥150 = $1</div>
                    <div>Price includes auction fees</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <WhatsAppButton
                    vehicleId={vehicle.id}
                    vehicleName={`${vehicle.model_year_ad} ${vehicle.manufacturer.name} ${vehicle.model.name}`}
                    price={formatPrice(priceUSD, 'USD')}
                    type="inquiry"
                    size="lg"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleInquiry}
                    className="w-full"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Email Inquiry
                  </Button>
                </div>
              </div>

              {/* Key Specifications */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Key Specifications</h3>
                <div className="vehicle-specs">
                  <div className="vehicle-spec-item">
                    <span className="vehicle-spec-label">Year</span>
                    <span className="vehicle-spec-value">{vehicle.model_year_ad}</span>
                  </div>
                  <div className="vehicle-spec-item">
                    <span className="vehicle-spec-label">Mileage</span>
                    <span className="vehicle-spec-value">{formatMileageWithMiles(vehicle.mileage_km)}</span>
                  </div>
                  <div className="vehicle-spec-item">
                    <span className="vehicle-spec-label">Engine Size</span>
                    <span className="vehicle-spec-value">{vehicle.engine_displacement_cc ? `${vehicle.engine_displacement_cc}cc` : 'N/A'}</span>
                  </div>
                  <div className="vehicle-spec-item">
                    <span className="vehicle-spec-label">Fuel Type</span>
                    <span className="vehicle-spec-value">{vehicle.fuel_type || 'Gasoline'}</span>
                  </div>
                  <div className="vehicle-spec-item">
                    <span className="vehicle-spec-label">Transmission</span>
                    <span className="vehicle-spec-value">{vehicle.transmission_type || 'Automatic'}</span>
                  </div>
                  <div className="vehicle-spec-item">
                    <span className="vehicle-spec-label">Drive Type</span>
                    <span className="vehicle-spec-value">{vehicle.drive_type || '4WD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {vehicle.ai_analysis && (
            <div className="mb-8">
              <AIAnalysisCard 
                analysis={vehicle.ai_analysis}
                vehiclePrice={Math.round(vehicle.price_total_yen / 150)}
                vehicleMileage={vehicle.mileage_km}
                vehicleYear={vehicle.model_year_ad}
              />
            </div>
          )}

          {/* Comprehensive Specifications Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Detailed Specifications Table */}
            <div className="lg:col-span-2 bg-white rounded-lg border overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Complete Vehicle Specifications</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {/* Basic Information */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Basic Information
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 w-1/3">Vehicle Title</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.title_description}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Manufacturer</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.manufacturer?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Model</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.model?.name || 'N/A'}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Grade</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.grade || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Body Style</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.body_style || vehicle.model?.body_type || 'N/A'}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Year</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.model_year_ad} {vehicle.model_year_era ? `(${vehicle.model_year_era})` : ''}</td>
                    </tr>
                    
                    {/* Engine & Performance */}
                    <tr className="bg-gray-100">
                      <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Engine & Performance
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Engine Displacement</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {vehicle.engine_displacement_cc ? `${vehicle.engine_displacement_cc}cc` : 
                         vehicle.engine_displacement ? `${vehicle.engine_displacement}L` : 'N/A'}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Fuel Type</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.fuel_type || 'Gasoline'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Transmission</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {vehicle.transmission_type || 'Automatic'}
                        {vehicle.transmission_details && ` (${vehicle.transmission_details})`}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Drive Type</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.drive_type || vehicle.drivetrain_type || '4WD'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Mileage</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatMileageWithMiles(vehicle.mileage_km)}</td>
                    </tr>

                    {/* Exterior & Interior */}
                    <tr className="bg-gray-100">
                      <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Exterior & Interior
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Exterior Color</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.color || 'N/A'}</td>
                    </tr>

                    {/* Condition & History */}
                    <tr className="bg-gray-100">
                      <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Condition & History
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Accident History</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          !vehicle.has_repair_history ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {!vehicle.has_repair_history ? '✓ No Accidents' : 'Has Repair History'}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Owner History</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.is_one_owner ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.is_one_owner ? '1 Owner' : 'Multiple Owners'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Warranty</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.has_warranty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.has_warranty ? '✓ Warranty Available' : 'No Warranty'}
                        </span>
                        {vehicle.warranty_details && (
                          <span className="ml-2 text-gray-600">({vehicle.warranty_details})</span>
                        )}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Shaken Status</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.shaken_status || 'Available on request'}</td>
                    </tr>

                    {/* Pricing Information */}
                    <tr className="bg-gray-100">
                      <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Pricing Information
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Vehicle Price</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(vehicle.price_vehicle_yen, 'JPY')}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Total Price (incl. fees)</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                        {formatPrice(vehicle.price_total_yen, 'JPY')}
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          ({formatPrice(priceUSD, 'USD')})
                        </span>
                      </td>
                    </tr>
                    {vehicle.price_misc_expenses_yen && (
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">Misc. Expenses</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(vehicle.price_misc_expenses_yen, 'JPY')}</td>
                      </tr>
                    )}

                    {/* Location & Source */}
                    <tr className="bg-gray-100">
                      <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Location & Source
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Location</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {vehicle.location_prefecture || 'Japan'}
                        {vehicle.location_city && `, ${vehicle.location_city}`}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Source</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{vehicle.source_site}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Source ID</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">{vehicle.source_id}</td>
                    </tr>
                    {vehicle.dealer_name && (
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">Dealer</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{vehicle.dealer_name}</td>
                      </tr>
                    )}

                    {/* Features & Equipment */}
                    {(vehicle.features && vehicle.features.length > 0) || vehicle.equipment_details && (
                      <>
                        <tr className="bg-gray-100">
                          <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                            Features & Equipment
                          </td>
                        </tr>
                        {vehicle.features && vehicle.features.length > 0 && (
                          <tr>
                            <td className="px-6 py-4 text-sm font-medium text-gray-500">Features</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex flex-wrap gap-1">
                                {vehicle.features.map((feature, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                        {vehicle.equipment_details && (
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-500">Equipment Details</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{vehicle.equipment_details}</td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Information */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Export Ready</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <ShieldCheckIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Export documentation included</span>
                </div>
                <div className="flex items-center text-sm">
                  <GlobeAltIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Worldwide shipping available</span>
                </div>
                <div className="flex items-center text-sm">
                  <TruckIcon className="h-4 w-4 text-primary-600 mr-2" />
                  <span>Professional inspection report</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  This vehicle is ready for export with all necessary documentation. 
                  Contact us for shipping quotes and export assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          {showInquiryForm && (
            <div id="inquiry" className="bg-white p-6 rounded-lg border mb-8">
              <h3 className="text-lg font-semibold mb-4">Request Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Full Name *</label>
                  <input type="text" className="input" placeholder="Your full name" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className="label">Country *</label>
                  <select className="select">
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="NZ">New Zealand</option>
                    <option value="UK">United Kingdom</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Message</label>
                  <textarea 
                    className="input min-h-[100px]" 
                    placeholder={`I'm interested in the ${vehicle.title_description}. Please provide more information about...`}
                  ></textarea>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button variant="primary" className="flex-1">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Send Inquiry
                </Button>
                <Button variant="outline" onClick={() => setShowInquiryForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Similar Vehicles */}
          {similarVehicles && similarVehicles.length > 0 && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Similar Vehicles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarVehicles.slice(0, 3).map((similar) => (
                  <Link
                    key={similar.id}
                    href={`/vehicles/${similar.id}`}
                    className="block p-4 border rounded-lg hover:border-primary-500 transition-colors"
                  >
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded overflow-hidden mb-3">
                      <img
                        src={similar.primary_image || '/images/placeholder-vehicle.jpg'}
                        alt={similar.title_description}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder-vehicle.jpg';
                        }}
                      />
                    </div>
                    <h4 className="font-medium text-sm mb-1">
                      {similar.title_description}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {similar.model_year_ad} • {formatMileageWithMiles(similar.mileage_km)}
                    </p>
                    <p className="text-sm font-semibold text-primary-600">
                      {formatPrice(Math.round(similar.price_total_yen / 150), 'USD')}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && vehicleImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-screen-lg max-h-screen-lg m-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={vehicleImages[selectedImageIndex].url}
              alt={vehicleImages[selectedImageIndex].alt_text || vehicle.title_description}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(1200, 900);
              }}
            />
            
            {/* Modal Navigation */}
            {vehicleImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : vehicleImages.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3"
                >
                  <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex < vehicleImages.length - 1 ? selectedImageIndex + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3"
                >
                  <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedImageIndex + 1} / {vehicleImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <WhatsAppButton
        vehicleId={vehicle.id}
        vehicleName={`${vehicle.model_year_ad} ${vehicle.manufacturer.name} ${vehicle.model.name}`}
        price={formatPrice(priceUSD, 'USD')}
        type="floating"
      />
    </Layout>
    </>
  );
}