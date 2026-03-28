import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Share,
  MapPin,
  Star,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react-native';
import { useProperties } from '@/hooks/usePropertyStore';



export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, favorites, toggleFavorite } = useProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Property not found</Text>
      </View>
    );
  }

  const isFavorite = favorites.includes(property.id);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {property.images.map((image) => (
              <Image key={image} source={{ uri: image }} style={styles.image} />
            ))}
          </ScrollView>
          
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.topGradient}
          />
          
          <View style={[styles.headerButtons, { top: insets.top + 10 }]}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerRightButtons}>
              <TouchableOpacity style={styles.headerButton}>
                <Share size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => toggleFavorite(property.id)}
              >
                <Heart
                  size={24}
                  color={isFavorite ? '#FF6B6B' : '#fff'}
                  fill={isFavorite ? '#FF6B6B' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.imageIndicator}>
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1} / {property.images.length}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceSection}>
            <Text style={styles.price}>${property.price}/month</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{property.rating}</Text>
              <Text style={styles.reviews}>({property.reviewCount})</Text>
            </View>
          </View>

          <Text style={styles.title}>{property.title}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#666" />
            <Text style={styles.location}>{property.location.address}</Text>
            {property.distanceFromCampus && (
              <Text style={styles.distance}>• {property.distanceFromCampus}mi from campus</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {property.amenities.map((amenity) => (
                <View key={amenity} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agent</Text>
            <View style={styles.agentCard}>
              <Image source={{ uri: property.agent.avatar }} style={styles.agentAvatar} />
              <View style={styles.agentInfo}>
                <View style={styles.agentNameRow}>
                  <Text style={styles.agentName}>{property.agent.name}</Text>
                  {property.agent.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.agentStats}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.agentRating}>{property.agent.rating}</Text>
                  <Text style={styles.agentListings}>• {property.agent.listingsCount} listings</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton}>
          <Phone size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Mail size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton}>
          <MessageCircle size={20} color="#fff" />
          <Text style={styles.messageButtonText}>Message Agent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  distance: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 8,
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
  agentStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  agentListings: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});