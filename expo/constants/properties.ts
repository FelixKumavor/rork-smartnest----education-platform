import { Property } from '@/types/property';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Studio Near Campus',
    description: 'Beautiful studio apartment with modern amenities, perfect for students. Walking distance to university campus.',
    price: 850,
    currency: 'USD',
    location: {
      address: '123 University Ave',
      city: 'Boston',
      coordinates: { latitude: 42.3601, longitude: -71.0589 }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    amenities: ['WiFi', 'Laundry', 'Kitchen', 'Air Conditioning', 'Parking'],
    roomType: 'studio',
    availability: true,
    rating: 4.8,
    reviewCount: 24,
    agent: {
      id: 'a1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
      phone: '+1 (555) 123-4567',
      email: 'sarah@properties.com',
      rating: 4.9,
      listingsCount: 12,
      verified: true
    },
    distanceFromCampus: 0.3,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Shared Room in Student House',
    description: 'Cozy shared room in a friendly student house. Great community atmosphere with study areas.',
    price: 450,
    currency: 'USD',
    location: {
      address: '456 College St',
      city: 'Boston',
      coordinates: { latitude: 42.3505, longitude: -71.0621 }
    },
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
    ],
    amenities: ['WiFi', 'Shared Kitchen', 'Study Room', 'Garden'],
    roomType: 'shared',
    availability: true,
    rating: 4.5,
    reviewCount: 18,
    agent: {
      id: 'a2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      phone: '+1 (555) 987-6543',
      email: 'mike@studenthousing.com',
      rating: 4.7,
      listingsCount: 8,
      verified: true
    },
    distanceFromCampus: 0.8,
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    title: 'Luxury Single Room',
    description: 'Premium single room with private bathroom and modern furnishing. Perfect for graduate students.',
    price: 1200,
    currency: 'USD',
    location: {
      address: '789 Academic Blvd',
      city: 'Boston',
      coordinates: { latitude: 42.3398, longitude: -71.0892 }
    },
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    amenities: ['WiFi', 'Private Bathroom', 'Gym', 'Pool', 'Concierge', 'Parking'],
    roomType: 'single',
    availability: true,
    rating: 4.9,
    reviewCount: 31,
    agent: {
      id: 'a3',
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      phone: '+1 (555) 456-7890',
      email: 'emma@luxuryhousing.com',
      rating: 4.8,
      listingsCount: 15,
      verified: true
    },
    distanceFromCampus: 1.2,
    createdAt: '2024-01-10'
  }
];

export const AMENITIES = [
  'WiFi',
  'Laundry',
  'Kitchen',
  'Air Conditioning',
  'Heating',
  'Parking',
  'Gym',
  'Pool',
  'Study Room',
  'Garden',
  'Balcony',
  'Private Bathroom',
  'Shared Kitchen',
  'Concierge',
  'Security'
];

export const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'shared', label: 'Shared Room' },
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Apartment' }
];