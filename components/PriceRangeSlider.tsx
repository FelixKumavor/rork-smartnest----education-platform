import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriceRangeSliderProps {
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export default function PriceRangeSlider({ range }: PriceRangeSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.rangeDisplay}>
        <Text style={styles.rangeText}>${range[0]}</Text>
        <Text style={styles.separator}>-</Text>
        <Text style={styles.rangeText}>${range[1]}</Text>
      </View>
      <Text style={styles.note}>Price range slider (simplified for demo)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  rangeDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  separator: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 16,
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});