import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useProperties } from '@/hooks/usePropertyStore';
import { AMENITIES, ROOM_TYPES } from '@/constants/properties';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const { filters, updateFilters, clearFilters } = useProperties();
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApply = () => {
    updateFilters(tempFilters);
    onClose();
  };

  const handleClear = () => {
    clearFilters();
    setTempFilters({
      query: '',
      priceRange: [0, 2000],
      roomType: [],
      amenities: [],
      maxDistance: undefined
    });
  };

  const toggleRoomType = (type: string) => {
    setTempFilters(prev => ({
      ...prev,
      roomType: prev.roomType.includes(type)
        ? prev.roomType.filter(t => t !== type)
        : [...prev.roomType, type]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    if (!amenity?.trim() || amenity.length > 100) return;
    const sanitized = amenity.trim();
    setTempFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(sanitized)
        ? prev.amenities.filter(a => a !== sanitized)
        : [...prev.amenities, sanitized]
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <PriceRangeSlider
              range={tempFilters.priceRange}
              onRangeChange={(range) => setTempFilters(prev => ({ ...prev, priceRange: range }))}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Type</Text>
            <View style={styles.chipContainer}>
              {ROOM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    tempFilters.roomType.includes(type.value) && styles.chipSelected
                  ]}
                  onPress={() => toggleRoomType(type.value)}
                >
                  <Text style={[
                    styles.chipText,
                    tempFilters.roomType.includes(type.value) && styles.chipTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.chipContainer}>
              {AMENITIES.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.chip,
                    tempFilters.amenities.includes(amenity) && styles.chipSelected
                  ]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Text style={[
                    styles.chipText,
                    tempFilters.amenities.includes(amenity) && styles.chipTextSelected
                  ]}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});