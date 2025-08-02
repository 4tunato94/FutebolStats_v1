import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Pause, Square, Clock } from 'lucide-react-native';
import { useFutebolStore } from '@/stores/futebolStore';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const { currentMatch, endMatch, addAction } = useFutebolStore();
  const [gameTime, setGameTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    // Force landscape orientation
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      // Unlock orientation when leaving
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentMatch) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentMatch.startTime.getTime()) / 1000);
        setGameTime(elapsed);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentMatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndMatch = () => {
    Alert.alert(
      'Finalizar Partida',
      'Tem certeza que deseja finalizar a partida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          style: 'destructive',
          onPress: () => {
            endMatch();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleZonePress = (zone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedZone(zone);
  };

  const quickAction = (action: string, teamId: string) => {
    if (!currentMatch || !selectedZone) {
      Alert.alert('Erro', 'Selecione uma zona do campo primeiro');
      return;
    }

    const team = currentMatch.teamA.id === teamId ? currentMatch.teamA : currentMatch.teamB;
    const minute = Math.floor(gameTime / 60);

    // For quick actions, use the first player of the team
    const player = team.players[0];
    if (!player) {
      Alert.alert('Erro', 'Time não possui jogadores');
      return;
    }

    addAction({
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      action,
      zone: selectedZone,
      minute
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedZone(null);
  };

  if (!currentMatch) {
    router.replace('/');
    return null;
  }

  const fieldZones = [
    ['Defesa A', 'Meio A', 'Ataque A'],
    ['Lateral A', 'Centro', 'Lateral B'],
    ['Ataque B', 'Meio B', 'Defesa B']
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleEndMatch}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>
            {currentMatch.teamA.name} vs {currentMatch.teamB.name}
          </Text>
          <Text style={styles.gameTimer}>{formatTime(gameTime)}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause color="white" size={20} /> : <Play color="white" size={20} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleEndMatch}
          >
            <Square color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gameArea}>
        {/* Field */}
        <View style={styles.field}>
          <View style={styles.fieldGrid}>
            {fieldZones.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.fieldRow}>
                {row.map((zone, colIndex) => (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.fieldZone,
                      selectedZone === zone && styles.selectedZone
                    ]}
                    onPress={() => handleZonePress(zone)}
                  >
                    <Text style={styles.zoneText}>{zone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Action Panel */}
        <View style={styles.actionPanel}>
          <Text style={styles.panelTitle}>Ações Rápidas</Text>
          
          {selectedZone && (
            <Text style={styles.selectedZoneText}>Zona: {selectedZone}</Text>
          )}

          <View style={styles.teamActions}>
            <View style={styles.teamSection}>
              <View style={[styles.teamHeader, { backgroundColor: currentMatch.teamA.colors.primary }]}>
                <Text style={styles.teamHeaderText}>{currentMatch.teamA.name}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => quickAction('Gol', currentMatch.teamA.id)}
                  disabled={!selectedZone}
                >
                  <Text style={styles.actionButtonText}>⚽ Gol</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => quickAction('Chute', currentMatch.teamA.id)}
                  disabled={!selectedZone}
                >
                  <Text style={styles.actionButtonText}>🥅 Chute</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={() => quickAction('Falta', currentMatch.teamA.id)}
                  disabled={!selectedZone}
                >
                  <Text style={styles.actionButtonText}>⚠️ Falta</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.teamSection}>
              <View style={[styles.teamHeader, { backgroundColor: currentMatch.teamB.colors.primary }]}>
                <Text style={styles.teamHeaderText}>{currentMatch.teamB.name}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => quickAction('Gol', currentMatch.teamB.id)}
                  disabled={!selectedZone}
                >
                  <Text style={styles.actionButtonText}>⚽ Gol</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => quickAction('Chute', currentMatch.teamB.id)}
                  disabled={!selectedZone}
                >
                  <Text style={styles.actionButtonText}>🥅 Chute</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={() => quickAction('Falta', currentMatch.teamB.id)}
                  disabled={!selectedZone}
                >
                  <Text style={styles.actionButtonText}>⚠️ Falta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d5016',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2d5016',
  },
  backButton: {
    padding: 8,
  },
  matchInfo: {
    flex: 1,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  gameTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#90EE90',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  field: {
    flex: 2,
    backgroundColor: '#4CAF50',
    margin: 8,
    borderRadius: 12,
    padding: 16,
  },
  fieldGrid: {
    flex: 1,
  },
  fieldRow: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 2,
  },
  fieldZone: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedZone: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderColor: 'white',
    borderWidth: 2,
  },
  zoneText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionPanel: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
    padding: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  selectedZoneText: {
    fontSize: 14,
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  teamActions: {
    flex: 1,
  },
  teamSection: {
    flex: 1,
    marginBottom: 16,
  },
  teamHeader: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  teamHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});