export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  amenities: string[];
  roomType: 'single' | 'shared' | 'studio' | 'apartment';
  availability: boolean;
  rating: number;
  reviewCount: number;
  agent: Agent;
  distanceFromCampus?: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  rating: number;
  listingsCount: number;
  verified: boolean;
}

export interface SearchFilters {
  query: string;
  priceRange: [number, number];
  roomType: string[];
  amenities: string[];
  maxDistance?: number;
}