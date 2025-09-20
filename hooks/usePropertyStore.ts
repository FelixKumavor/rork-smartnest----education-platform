import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback } from 'react';
import { Property, SearchFilters } from '@/types/property';
import { MOCK_PROPERTIES } from '@/constants/properties';

export const [PropertyProvider, useProperties] = createContextHook(() => {
  const [properties] = useState<Property[]>(MOCK_PROPERTIES);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    priceRange: [0, 2000],
    roomType: [],
    amenities: [],
    maxDistance: undefined
  });
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Query filter
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery = 
          property.title.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query) ||
          property.location.address.toLowerCase().includes(query) ||
          property.location.city.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Price filter
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }

      // Room type filter
      if (filters.roomType.length > 0 && !filters.roomType.includes(property.roomType)) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => {
          if (!amenity?.trim()) return true;
          return property.amenities.includes(amenity);
        });
        if (!hasAllAmenities) return false;
      }

      // Distance filter
      if (filters.maxDistance && property.distanceFromCampus && property.distanceFromCampus > filters.maxDistance) {
        return false;
      }

      return true;
    });
  }, [properties, filters]);

  const toggleFavorite = useCallback((propertyId: string) => {
    if (!propertyId?.trim()) return;
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      priceRange: [0, 2000],
      roomType: [],
      amenities: [],
      maxDistance: undefined
    });
  }, []);

  return useMemo(() => ({
    properties,
    filteredProperties,
    filters,
    favorites,
    updateFilters,
    clearFilters,
    toggleFavorite,
    isLoading: false
  }), [properties, filteredProperties, filters, favorites, updateFilters, clearFilters, toggleFavorite]);
});