import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Dropdown from '@/components/ui/Dropdown';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Vehicles', href: '/vehicles' },
  { name: 'Export Process', href: '/export-process' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const exportCountries = [
  { name: 'United States', href: '/regions/usa' },
  { name: 'Canada', href: '/regions/canada' },
  { name: 'United Kingdom', href: '/regions/uk' },
  { name: 'France', href: '/regions/france' },
  { name: 'Germany', href: '/regions/germany' },
  { name: 'Italy', href: '/regions/italy' },
  { name: 'Australia', href: '/regions/australia' },
  { name: 'Nigeria', href: '/regions/nigeria' },
  { name: 'Kenya', href: '/regions/kenya' },
  { name: 'Pakistan', href: '/regions/pakistan' },
  { name: 'India', href: '/regions/india' },
  { name: 'Philippines', href: '/regions/philippines' },
  { name: 'Ukraine', href: '/regions/ukraine' },
  { name: 'Qatar', href: '/regions/qatar' },
  { name: 'Saudi Arabia', href: '/regions/saudi-arabia' },
  { name: 'Dubai (UAE)', href: '/regions/dubai' },
  { name: 'Iran', href: '/regions/iran' },
  { name: 'Lebanon', href: '/regions/lebanon' },
];

interface Manufacturer {
  id: number;
  name: string;
  country: string;
  vehicle_count: string;
}

interface Model {
  id: number;
  name: string;
  body_type: string;
  vehicle_count: string;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (selectedManufacturer) {
      fetchModels(selectedManufacturer);
    }
  }, [selectedManufacturer]);

  const fetchManufacturers = async () => {
    setLoadingManufacturers(true);
    try {
      const response = await fetch('/api/manufacturers');
      const result = await response.json();
      if (result.success) {
        setManufacturers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
    } finally {
      setLoadingManufacturers(false);
    }
  };

  const fetchModels = async (manufacturerId: number) => {
    setLoadingModels(true);
    try {
      const response = await fetch(`/api/manufacturers/${manufacturerId}/models`);
      const result = await response.json();
      if (result.success) {
        setModels(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    if (query.trim()) {
      router.push(`/vehicles?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm'
          : 'bg-white'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">JDT</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-display font-bold text-gray-900">
                  Japan Direct Trucks
                </span>
                <div className="text-xs text-gray-500">
                  American Truck Exporter in Japan
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="query"
                placeholder="Search Land Cruiser, Hilux..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  router.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
            
            <Dropdown
              title="Brands"
              items={manufacturers.map(m => ({
                id: m.id,
                name: m.name,
                href: `/manufacturers/${m.id}`,
                count: parseInt(m.vehicle_count)
              }))}
              loading={loadingManufacturers}
              onItemHover={setSelectedManufacturer}
            />
            
            
            <Dropdown
              title="Countries"
              items={exportCountries.map((country, index) => ({
                id: index,
                name: country.name,
                href: country.href
              }))}
            />
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/favorites"
                  className="hidden sm:inline-flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Favorites</span>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <UserIcon className="h-5 w-5" />
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Favorites
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex btn btn-primary"
                >
                  Sign up
                </Link>
              </>
            )}

            <Link
              href="/contact"
              className="hidden sm:inline-flex btn btn-outline"
            >
              Get Quote
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <div className="mb-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    name="query"
                    placeholder="Search vehicles..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>
              </div>
              
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                    router.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/favorites"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      My Favorites
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full btn btn-primary text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
                <Link
                  href="/contact"
                  className="block w-full btn btn-outline text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Get Quote
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}