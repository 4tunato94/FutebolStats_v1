import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';

const { width, height } = Dimensions.get('window');

interface FieldViewProps {
  onZonePress: (zone: string) => void;
  selectedZone?: string | null;
  possession?: 'teamA' | 'teamB' | null;
  teamAColor?: string;
  teamBColor?: string;
}

export default function FieldView({ 
  onZonePress, 
  selectedZone, 
  possession,
  teamAColor = '#FF0000',
  teamBColor = '#0000FF'
}: FieldViewProps) {
  // Campo 20x13 zonas
  const zones = [];
  for (let row = 0; row < 13; row++) {
    const zoneRow = [];
    for (let col = 0; col < 20; col++) {
      zoneRow.push(`${row}-${col}`);
    }
    zones.push(zoneRow);
  }

  const fieldWidth = width;
  const fieldHeight = height * 0.7; // 70% da altura da tela
  const zoneWidth = fieldWidth / 20;
  const zoneHeight = fieldHeight / 13;

  const getZoneStyle = (zone: string) => {
    const [row, col] = zone.split('-').map(Number);
    let backgroundColor = 'transparent';
    
    // Zona selecionada
    if (selectedZone === zone) {
      backgroundColor = 'rgba(255, 255, 0, 0.6)';
    }
    
    return { backgroundColor };
  };

  return (
    <View style={[styles.container, { width: fieldWidth, height: fieldHeight }]}>
      <ImageBackground 
        source={require('../assets/campov1-horizontal.png')} 
        style={styles.fieldBackground}
        resizeMode="stretch"
      >
        <View style={styles.zonesContainer}>
          {zones.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((zone, colIndex) => (
                <TouchableOpacity
                  key={zone}
                  style={[
                    styles.zone,
                    { 
                      width: zoneWidth, 
                      height: zoneHeight,
                      ...getZoneStyle(zone)
                    }
                  ]}
                  onPress={() => onZonePress(zone)}
                />
              ))}
            </View>
          ))}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  fieldBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  zonesContainer: {
    flex: 1,
    padding: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  zone: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});