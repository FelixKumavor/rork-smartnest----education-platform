import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MapPin, Star, User } from 'lucide-react-native';
import { Property } from '@/types/property';
import { useProperties } from '@/hooks/usePropertyStore';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
}

export default function PropertyCard({ property, onPress }: PropertyCardProps) {
  const { favorites, toggleFavorite } = useProperties();
  const isFavorite = favorites.includes(property.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: property.images[0] }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(property.id)}
        >
          <Heart
            size={20}
            color={isFavorite ? '#FF6B6B' : '#fff'}
            fill={isFavorite ? '#FF6B6B' : 'transparent'}
          />
        </TouchableOpacity>
        <View style={styles.priceTag}>
          <Text style={styles.price}>${property.price}/mo</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        
        <View style={styles.locationRow}>
          <MapPin size={14} color="#666" />
          <Text style={styles.location}>{property.location.address}</Text>
          {property.distanceFromCampus && (
            <Text style={styles.distance}>• {property.distanceFromCampus}mi</Text>
          )}
        </View>
        
        <View style={styles.ratingRow}>
          <Star size={14} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{property.rating}</Text>
          <Text style={styles.reviews}>({property.reviewCount})</Text>
        </View>
        
        <View style={styles.agentRow}>
          <User size={14} color="#666" />
          <Text style={styles.agentName}>{property.agent.name}</Text>
          {property.agent.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  price: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});