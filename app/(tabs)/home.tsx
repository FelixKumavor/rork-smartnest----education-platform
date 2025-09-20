import React, { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useProperties } from '@/hooks/usePropertyStore';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import FilterModal from '@/components/FilterModal';

export default function HomeScreen() {
  const { filteredProperties } = useProperties();
  const [showFilters, setShowFilters] = useState(false);

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item.id)}
          />
        )}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={[styles.header, { paddingTop: insets.top + 24 }]}
            >
              <Text style={styles.headerTitle}>Find Your Perfect Place</Text>
              <Text style={styles.headerSubtitle}>
                {filteredProperties.length} properties available
              </Text>
            </LinearGradient>
            <SearchBar onFilterPress={() => setShowFilters(true)} />
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
});