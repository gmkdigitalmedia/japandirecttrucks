import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import { useAuth } from '@/contexts/AuthContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login?returnTo=/favorites');
      return;
    }

    fetchFavorites();
  }, [user, token]);

  const fetchFavorites = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(data.data);
      } else {
        setError(data.error || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = (vehicleId: number) => {
    router.push(`/vehicles/${vehicleId}#inquiry`);
  };

  const handleRemoveFavorite = async (vehicleId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/favorites/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setFavorites(favorites.filter((fav: any) => fav.id !== vehicleId));
      } else {
        console.error('Failed to remove favorite:', data.error);
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Head>
        <title>My Favorites - Japan Direct Trucks | Saved Vehicles</title>
        <meta name="description" content="View and manage your favorite Japanese vehicles. Track saved Land Cruisers, Hilux, and JDM cars for export from Japan." />
        <meta name="keywords" content="favorite vehicles japan, saved cars japan, land cruiser favorites, vehicle watchlist japan, japan car export favorites" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
            <p className="text-gray-600">
              Vehicles you've saved for later consideration
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">
                Start browsing vehicles and save the ones you like to see them here.
              </p>
              <Link
                href="/vehicles"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse Vehicles
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {favorites.length} vehicle{favorites.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              
              <VehicleGrid
                vehicles={favorites}
                loading={false}
                onInquiry={handleInquiry}
                showFavoriteButton={true}
                onFavoriteToggle={handleRemoveFavorite}
                favoriteVehicleIds={new Set(favorites.map((fav: any) => fav.id))}
              />
            </>
          )}
        </div>
      </Layout>
    </>
  );
}