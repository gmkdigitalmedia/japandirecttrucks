import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // Fetch user's favorites on mount
  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    } else {
      setFavoriteIds(new Set());
    }
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
        const ids = new Set(data.data.map((fav: any) => fav.id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (vehicleId: number) => {
    if (!user || !token) {
      // Redirect to login if not authenticated
      window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }

    setLoading(true);
    const isFavorited = favoriteIds.has(vehicleId);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`http://localhost:8000/api/favorites/${vehicleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setFavoriteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(vehicleId);
            return newSet;
          });
          return true;
        }
      } else {
        // Add to favorites
        const response = await fetch('http://localhost:8000/api/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vehicle_id: vehicleId }),
        });

        const data = await response.json();
        if (data.success) {
          setFavoriteIds(prev => new Set(prev).add(vehicleId));
          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }

    return false;
  };

  return {
    favoriteIds,
    toggleFavorite,
    loading,
    isFavorited: (vehicleId: number) => favoriteIds.has(vehicleId),
  };
};