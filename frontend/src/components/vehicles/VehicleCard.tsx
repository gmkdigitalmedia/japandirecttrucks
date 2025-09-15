import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, MapPinIcon, CalendarIcon, TruckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Vehicle } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { formatMileageWithMiles, getVehicleImageUrl, getPlaceholderImage, generateVehicleSlug, getVehicleBadges } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import WhatsAppButton from '@/components/whatsapp/WhatsAppButton';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onInquiry?: (vehicleId: number) => void;
  showExportBadge?: boolean;
  className?: string;
  showCompetitiveAdvantage?: boolean;
  showFavoriteButton?: boolean;
  onFavoriteToggle?: (vehicleId: number) => void;
  isFavorited?: boolean;
}

export default function VehicleCard({ 
  vehicle, 
  onInquiry, 
  showExportBadge = true,
  className,
  showCompetitiveAdvantage = false,
  showFavoriteButton = false,
  onFavoriteToggle,
  isFavorited = false
}: VehicleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { formatYen, formatUSD, convertYenToUSD } = useCurrency();
  
  const primaryImage = vehicle.images?.find(img => img.is_primary) || vehicle.images?.[0];
  const images = vehicle.images || [];
  const hasMultipleImages = images.length > 1;
  
  const badges = getVehicleBadges(vehicle);
  const vehicleSlug = generateVehicleSlug(vehicle);

  const handleImageHover = (index: number) => {
    if (hasMultipleImages) {
      setCurrentImageIndex(index);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFavoriteToggle) {
      onFavoriteToggle(vehicle.id);
    }
  };

  const handleInquiryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onInquiry?.(vehicle.id);
  };

  const currentImage = images[currentImageIndex] || primaryImage;
  const vehicleData = vehicle as any;
  
  // Use the CarSensor image URL directly
  const imageUrl = vehicleData.primary_image || getPlaceholderImage(400, 300);
  
  console.log('Vehicle data:', vehicleData.title_description, 'Image URL:', imageUrl);

  return (
    <div className={cn('card-hover group', className)}>
      <div className="relative">
        <Link href={`/vehicles/${vehicle.id}`}>
          <div className="relative aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={vehicle.title_description}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onError={() => {
                // Fallback handled by Next.js Image component
              }}
            />
          </div>
        </Link>
        
        {showFavoriteButton && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            {isFavorited ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        )}

      </div>

      <div className="p-4 space-y-3">
        <div>
          <Link href={`/vehicles/${vehicle.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
              {vehicle.title_description}
            </h3>
          </Link>
          
          {vehicle.grade && (
            <p className="text-sm text-gray-600 mt-1">{vehicle.grade}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {badges.slice(0, 3).map((badge, index) => (
            <Badge key={index} variant={badge.variant} size="sm">
              {badge.text}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{vehicle.model_year_ad}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TruckIcon className="h-4 w-4" />
            <span>{formatMileageWithMiles(vehicle.mileage_km)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPinIcon className="h-4 w-4" />
            <span>{vehicle.location_prefecture}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-primary-600">
              {formatUSD(convertYenToUSD(vehicle.price_total_yen))}
            </span>
            <span className="text-lg text-gray-600 font-medium">
              {formatYen(vehicle.price_total_yen)}
            </span>
          </div>
          
          {vehicle.price_misc_expenses_yen && vehicle.price_misc_expenses_yen > 0 && (
            <p className="text-xs text-gray-500">
              + {formatYen(vehicle.price_misc_expenses_yen)} misc expenses
            </p>
          )}
        </div>

        {/* AI Competitive Advantage */}
        {showCompetitiveAdvantage && vehicle.ai_analysis && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-600">
                {vehicle.ai_analysis.value_headline}
              </span>
              <span className="text-xs text-gray-500">
                {vehicle.ai_analysis.confidence_score}/10
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{vehicle.ai_analysis.mileage_advantage}</span>
              {vehicle.ai_analysis.savings_amount > 0 && (
                <span className="text-green-600 font-medium">
                  Save ${vehicle.ai_analysis.savings_amount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <WhatsAppButton
            vehicleId={vehicle.id}
            vehicleName={`${vehicle.model_year_ad} ${vehicle.manufacturer.name} ${vehicle.model.name}`}
            price={formatUSD(convertYenToUSD(vehicle.price_total_yen || vehicle.price_vehicle_yen))}
            type="button"
            size="sm"
            className="w-full"
          />
          <div className="flex space-x-2">
            <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                View Details
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInquiryClick}
              className="flex-1"
            >
              Email
            </Button>
          </div>
        </div>

        {vehicle.dealer_name && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Listed by: {vehicle.dealer_name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}