import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Pause, RotateCcw, Menu, X } from 'lucide-react-native';
import { useFutebolStore } from '../stores/futebolStore';
import { router } from 'expo-router';
import FieldView from '../components/FieldView';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const { 
    currentMatch, 
    endMatch, 
    addAction, 
    updateMatchTime,
    setPossession,
    actionTypes 
  } = useFutebolStore();
  
  const [gameTime, setGameTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'history'>('actions');
  const [clickCount, setClickCount] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle navigation when currentMatch is null
  useEffect(() => {
    if (!currentMatch) {
      router.replace('/');
    }
  }, [currentMatch]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          updateMatchTime(newTime);
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (clickCount === 0) {
        // Single click - play/pause
        setIsRunning(!isRunning);
      } else if (clickCount === 1) {
        // Double click - reset
        Alert.alert(
          'Resetar Cronômetro',
          'Tem certeza que deseja resetar o cronômetro?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Resetar', 
              onPress: () => {
                setGameTime(0);
                setIsRunning(false);
                updateMatchTime(0);
              }
            }
          ]
        );
      }
      setClickCount(0);
    }, 300);
    
    setClickTimeout(timeout);
  };

  const handlePossessionToggle = () => {
    if (!currentMatch) return;
    
    if (!currentMatch.possession) {
      setPossession('teamA');
    } else if (currentMatch.possession === 'teamA') {
      setPossession('teamB');
    } else {
      setPossession(null);
    }
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
    setSelectedZone(zone);
    setSidebarOpen(true);
    setActiveTab('actions');
  };

  const handleActionPress = (actionTypeId: string, teamId: string) => {
    if (!currentMatch || !selectedZone) return;

    const team = currentMatch.teamA.id === teamId ? currentMatch.teamA : currentMatch.teamB;
    const actionType = actionTypes.find(at => at.id === actionTypeId);
    const minute = Math.floor(gameTime / 60);
    const second = gameTime % 60;

    if (!actionType) return;

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

    // Close sidebar after action
    setSidebarOpen(false);
    setSelectedZone(null);
  };

  const getCurrentPossessionTeam = () => {
    if (!currentMatch || !currentMatch.possession) return null;
    return currentMatch.possession === 'teamA' ? currentMatch.teamA : currentMatch.teamB;
  };

  if (!currentMatch) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Campo maximizado */}
      <FieldView
        onZonePress={handleZonePress}
        selectedZone={selectedZone}
        possession={currentMatch.possession}
        teamAColor={currentMatch.teamA.colors.primary}
        teamBColor={currentMatch.teamB.colors.primary}
      />

      {/* Cronômetro no topo centro */}
      <TouchableOpacity style={styles.timerContainer} onPress={handleTimerClick}>
        <Text style={styles.gameTimer}>{formatTime(gameTime)}</Text>
        <Text style={styles.timerHint}>
          {isRunning ? 'Pausar' : 'Iniciar'} • 2x Resetar
        </Text>
      </TouchableOpacity>

      {/* Controles laterais esquerdos */}
      <View style={styles.leftControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleEndMatch}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handlePossessionToggle}>
          {getCurrentPossessionTeam() ? (
            getCurrentPossessionTeam()!.logo ? (
              <Image source={{ uri: getCurrentPossessionTeam()!.logo }} style={styles.teamLogo} />
            ) : (
              <View style={[styles.teamColor, { backgroundColor: getCurrentPossessionTeam()!.colors.primary }]} />
            )
          ) : (
            <View style={styles.noPossession}>
              <Text style={styles.noPossessionText}>?</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, sidebarOpen && styles.activeControl]} 
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X color="white" size={24} /> : <Menu color="white" size={24} />}
        </TouchableOpacity>
      </View>

      {/* Sidebar lateral esquerda */}
      {sidebarOpen && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'actions' && styles.activeTab]}
              onPress={() => setActiveTab('actions')}
            >
              <Text style={styles.tabText}>Ações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={styles.tabText}>Histórico</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sidebarContent}>
            {activeTab === 'actions' && selectedZone && (
              <View>
                <Text style={styles.sectionTitle}>Zona: {selectedZone}</Text>
                
                <Text style={styles.teamTitle}>{currentMatch.teamA.name}</Text>
                <View style={styles.actionButtons}>
                  {actionTypes.slice(0, 9).map(actionType => (
                    <TouchableOpacity
                      key={`${actionType.id}-A`}
                      style={[styles.actionButton, { backgroundColor: actionType.color }]}
                      onPress={() => handleActionPress(actionType.id, currentMatch.teamA.id)}
                    >
                      <Text style={styles.actionEmoji}>{actionType.icon}</Text>
                      <Text style={styles.actionButtonText}>{actionType.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.teamTitle}>{currentMatch.teamB.name}</Text>
                <View style={styles.actionButtons}>
                  {actionTypes.slice(0, 9).map(actionType => (
                    <TouchableOpacity
                      key={`${actionType.id}-B`}
                      style={[styles.actionButton, { backgroundColor: actionType.color }]}
                      onPress={() => handleActionPress(actionType.id, currentMatch.teamB.id)}
                    >
                      <Text style={styles.actionEmoji}>{actionType.icon}</Text>
                      <Text style={styles.actionButtonText}>{actionType.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {activeTab === 'history' && (
              <View>
                <Text style={styles.sectionTitle}>Histórico</Text>
                {currentMatch.actions.slice(-15).reverse().map(action => (
                  <View key={action.id} style={styles.historyItem}>
                    <Text style={styles.historyTime}>
                      {action.minute}:{action.second.toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.historyAction}>{action.action}</Text>
                    <Text style={styles.historyPlayer}>{action.playerName}</Text>
                    <Text style={styles.historyZone}>{action.zone}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d5016',
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  gameTimer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#90EE90',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  timerHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  leftControls: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 30,
    padding: 15,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeControl: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  teamLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  teamColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  noPossession: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPossessionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  teamTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 70,
    maxWidth: 80,
  },
  actionEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyTime: {
    color: '#90EE90',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyAction: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyPlayer: {
    color: '#ccc',
    fontSize: 12,
  },
  historyZone: {
    color: '#999',
    fontSize: 11,
    fontStyle: 'italic',
  },
});