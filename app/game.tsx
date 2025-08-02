import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Pause, Square, Clock, RotateCcw } from 'lucide-react-native';
import { useFutebolStore } from '../stores/futebolStore';
import { router } from 'expo-router';
import FieldView from '../components/FieldView';

export default function GameScreen() {
  const { 
    currentMatch, 
    endMatch, 
    addAction, 
    pauseMatch, 
    resumeMatch, 
    updateMatchTime,
    setPossession,
    actionTypes 
  } = useFutebolStore();
  
  const [gameTime, setGameTime] = useState(0);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentMatch && !currentMatch.isPaused) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentMatch.startTime.getTime()) / 1000);
        setGameTime(elapsed);
        updateMatchTime(elapsed);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [currentMatch?.isPaused, currentMatch]);

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

  const handlePauseResume = () => {
    if (!currentMatch) return;
    
    if (currentMatch.isPaused) {
      resumeMatch();
    } else {
      pauseMatch();
    }
  };

  const handleZonePress = (zone: string) => {
    setSelectedZone(zone);
    setShowActions(true);
  };

  const handleActionPress = (actionTypeId: string, teamId: string) => {
    if (!currentMatch || !selectedZone) {
      Alert.alert('Erro', 'Selecione uma zona do campo primeiro');
      return;
    }

    const team = currentMatch.teamA.id === teamId ? currentMatch.teamA : currentMatch.teamB;
    const actionType = actionTypes.find(at => at.id === actionTypeId);
    const minute = Math.floor(gameTime / 60);
    const second = gameTime % 60;

    if (!actionType) return;

    // Para ações rápidas, usar o primeiro jogador do time
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
      action: actionType.name,
      zone: selectedZone,
      minute,
      second
    });

    setSelectedZone(null);
    setShowActions(false);
  };

  const resetTimer = () => {
    Alert.alert(
      'Resetar Cronômetro',
      'Tem certeza que deseja resetar o cronômetro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetar', 
          onPress: () => {
            setGameTime(0);
            updateMatchTime(0);
          }
        }
      ]
    );
  };

  if (!currentMatch) {
    router.replace('/');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleEndMatch}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>
            {currentMatch.teamA.name} vs {currentMatch.teamB.name}
          </Text>
          <View style={styles.timerContainer}>
            <Clock color="#90EE90" size={20} />
            <Text style={styles.gameTimer}>{formatTime(gameTime)}</Text>
            <TouchableOpacity onPress={resetTimer} style={styles.resetButton}>
              <RotateCcw color="#90EE90" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePauseResume}
          >
            {currentMatch.isPaused ? 
              <Play color="white" size={20} /> : 
              <Pause color="white" size={20} />
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleEndMatch}
          >
            <Square color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Possession Control */}
        <View style={styles.possessionControl}>
          <TouchableOpacity
            style={[
              styles.possessionButton,
              { backgroundColor: currentMatch.teamA.colors.primary },
              currentMatch.possession === 'teamA' && styles.activePossession
            ]}
            onPress={() => setPossession(currentMatch.possession === 'teamA' ? null : 'teamA')}
          >
            <Text style={styles.possessionText}>{currentMatch.teamA.name}</Text>
            <Text style={styles.possessionLabel}>Posse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.possessionButton,
              { backgroundColor: currentMatch.teamB.colors.primary },
              currentMatch.possession === 'teamB' && styles.activePossession
            ]}
            onPress={() => setPossession(currentMatch.possession === 'teamB' ? null : 'teamB')}
          >
            <Text style={styles.possessionText}>{currentMatch.teamB.name}</Text>
            <Text style={styles.possessionLabel}>Posse</Text>
          </TouchableOpacity>
        </View>

        {/* Field */}
        <FieldView
          onZonePress={handleZonePress}
          selectedZone={selectedZone}
          possession={currentMatch.possession}
          teamAColor={currentMatch.teamA.colors.primary}
          teamBColor={currentMatch.teamB.colors.primary}
        />

        {/* Quick Actions */}
        {showActions && selectedZone && (
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>
              Ações Rápidas - Zona: {selectedZone}
            </Text>
            
            <View style={styles.teamActions}>
              <View style={styles.teamSection}>
                <View style={[styles.teamHeader, { backgroundColor: currentMatch.teamA.colors.primary }]}>
                  <Text style={styles.teamHeaderText}>{currentMatch.teamA.name}</Text>
                </View>
                <View style={styles.actionButtons}>
                  {actionTypes.slice(0, 6).map(actionType => (
                    <TouchableOpacity
                      key={actionType.id}
                      style={[styles.actionButton, { backgroundColor: actionType.color }]}
                      onPress={() => handleActionPress(actionType.id, currentMatch.teamA.id)}
                    >
                      <Text style={styles.actionEmoji}>{actionType.icon}</Text>
                      <Text style={styles.actionButtonText}>{actionType.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.teamSection}>
                <View style={[styles.teamHeader, { backgroundColor: currentMatch.teamB.colors.primary }]}>
                  <Text style={styles.teamHeaderText}>{currentMatch.teamB.name}</Text>
                </View>
                <View style={styles.actionButtons}>
                  {actionTypes.slice(0, 6).map(actionType => (
                    <TouchableOpacity
                      key={actionType.id}
                      style={[styles.actionButton, { backgroundColor: actionType.color }]}
                      onPress={() => handleActionPress(actionType.id, currentMatch.teamB.id)}
                    >
                      <Text style={styles.actionEmoji}>{actionType.icon}</Text>
                      <Text style={styles.actionButtonText}>{actionType.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeActionsButton}
              onPress={() => {
                setShowActions(false);
                setSelectedZone(null);
              }}
            >
              <Text style={styles.closeActionsText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  headerButton: {
    padding: 8,
  },
  matchInfo: {
    flex: 1,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gameTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#90EE90',
    marginHorizontal: 8,
  },
  resetButton: {
    padding: 4,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  possessionControl: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  possessionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.7,
  },
  activePossession: {
    opacity: 1,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  possessionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  possessionLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  teamActions: {
    gap: 16,
  },
  teamSection: {
    marginBottom: 16,
  },
  teamHeader: {
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
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  closeActionsButton: {
    backgroundColor: '#666',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeActionsText: {
    color: 'white',
    fontWeight: 'bold',
  },
});