import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ColorPickerProps {
  label: string;
  color: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ label, color, onColorChange }: ColorPickerProps) {
  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#F44336', 
    '#9C27B0', '#607D8B', '#795548', '#E91E63'
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.colorGrid}>
        {colors.map(colorOption => (
          <TouchableOpacity
            key={colorOption}
            style={[
              styles.colorOption,
              { backgroundColor: colorOption },
              color === colorOption && styles.selectedColor
            ]}
            onPress={() => onColorChange(colorOption)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
  },
});