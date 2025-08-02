import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';

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

  const getZoneStyle = (zone: string) => {
    const [row, col] = zone.split('-').map(Number);
    let backgroundColor = '#4CAF50'; // Verde do campo
    
    // Áreas especiais
    if (col < 2) {
      backgroundColor = teamAColor + '20'; // Área do time A (transparente)
    } else if (col > 17) {
      backgroundColor = teamBColor + '20'; // Área do time B (transparente)
    }
    
    // Meio campo
    if (col === 9 || col === 10) {
      backgroundColor = '#FFFFFF20';
    }
    
    // Zona selecionada
    if (selectedZone === zone) {
      backgroundColor = '#FFFF0080';
    }
    
    return { backgroundColor };
  };

  const fieldWidth = Math.min(width * 0.95, height * 0.6);
  const fieldHeight = fieldWidth * 0.65; // Proporção do campo
  const zoneWidth = fieldWidth / 20;
  const zoneHeight = fieldHeight / 13;

  return (
    <View style={[styles.container, { width: fieldWidth, height: fieldHeight }]}>
      <View style={styles.field}>
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
              >
                {selectedZone === zone && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {/* Linhas do campo */}
        <View style={styles.fieldLines}>
          {/* Linha do meio */}
          <View style={[styles.middleLine, { left: fieldWidth / 2 - 1 }]} />
          
          {/* Círculo central */}
          <View style={[styles.centerCircle, { 
            left: fieldWidth / 2 - 30, 
            top: fieldHeight / 2 - 30 
          }]} />
          
          {/* Áreas */}
          <View style={[styles.area, styles.leftArea]} />
          <View style={[styles.area, styles.rightArea, { right: 0 }]} />
          
          {/* Gols */}
          <View style={[styles.goal, styles.leftGoal]} />
          <View style={[styles.goal, styles.rightGoal, { right: -5 }]} />
        </View>
      </View>
      
      {/* Indicador de posse */}
      {possession && (
        <View style={styles.possessionIndicator}>
          <Text style={styles.possessionText}>
            Posse: {possession === 'teamA' ? 'Time A' : 'Time B'}
          </Text>
          <View style={[
            styles.possessionColor,
            { backgroundColor: possession === 'teamA' ? teamAColor : teamBColor }
          ]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    margin: 10,
  },
  field: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  zone: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFF00',
  },
  fieldLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  middleLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
  },
  centerCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  area: {
    position: 'absolute',
    width: '15%',
    height: '40%',
    top: '30%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  leftArea: {
    left: 0,
    borderRightWidth: 2,
    borderLeftWidth: 0,
  },
  rightArea: {
    borderLeftWidth: 2,
    borderRightWidth: 0,
  },
  goal: {
    position: 'absolute',
    width: 10,
    height: '20%',
    top: '40%',
    backgroundColor: '#FFFFFF',
  },
  leftGoal: {
    left: -5,
  },
  rightGoal: {
    // right: -5 is set inline
  },
  possessionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  possessionText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  possessionColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});