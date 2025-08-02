import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Pause, Square, RotateCcw } from 'lucide-react-native';
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
  const [isRunning, setIsRunning] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
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
    setShowActions(true);
    setShowHistory(false);
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

    setSelectedZone(null);
    setShowActions(false);
  };

  if (!currentMatch) {
    router.replace('/');
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
      <View style={styles.timerContainer}>
        <Text style={styles.gameTimer}>{formatTime(gameTime)}</Text>
      </View>

      {/* Controles laterais esquerdos */}
      <View style={styles.leftControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleEndMatch}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleStartStop}>
          {isRunning ? <Pause color="white" size={24} /> : <Play color="white" size={24} />}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
          <RotateCcw color="white" size={24} />
        </TouchableOpacity>

        {/* Botões de posse - apenas logos */}
        <TouchableOpacity
          style={[
            styles.possessionButton,
            currentMatch.possession === 'teamA' && styles.activePossession
          ]}
          onPress={() => setPossession(currentMatch.possession === 'teamA' ? null : 'teamA')}
        >
          {currentMatch.teamA.logo ? (
            <Image source={{ uri: currentMatch.teamA.logo }} style={styles.teamLogo} />
          ) : (
            <View style={[styles.teamColor, { backgroundColor: currentMatch.teamA.colors.primary }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.possessionButton,
            currentMatch.possession === 'teamB' && styles.activePossession
          ]}
          onPress={() => setPossession(currentMatch.possession === 'teamB' ? null : 'teamB')}
        >
          {currentMatch.teamB.logo ? (
            <Image source={{ uri: currentMatch.teamB.logo }} style={styles.teamLogo} />
          ) : (
            <View style={[styles.teamColor, { backgroundColor: currentMatch.teamB.colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Aba lateral direita */}
      <View style={styles.rightPanel}>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[styles.tabButton, showActions && styles.activeTab]}
            onPress={() => {
              setShowActions(!showActions);
              setShowHistory(false);
            }}
          >
            <Text style={styles.tabText}>Ações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, showHistory && styles.activeTab]}
            onPress={() => {
              setShowHistory(!showHistory);
              setShowActions(false);
            }}
          >
            <Text style={styles.tabText}>Histórico</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo da aba */}
        {(showActions || showHistory) && (
          <View style={styles.panelContent}>
            {showActions && selectedZone && (
              <ScrollView style={styles.actionsPanel}>
                <Text style={styles.panelTitle}>Zona: {selectedZone}</Text>
                
                <Text style={styles.teamTitle}>{currentMatch.teamA.name}</Text>
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

                <Text style={styles.teamTitle}>{currentMatch.teamB.name}</Text>
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
              </ScrollView>
            )}

            {showHistory && (
              <ScrollView style={styles.historyPanel}>
                <Text style={styles.panelTitle}>Histórico</Text>
                {currentMatch.actions.slice(-10).reverse().map(action => (
                  <View key={action.id} style={styles.historyItem}>
                    <Text style={styles.historyTime}>{action.minute}:{action.second.toString().padStart(2, '0')}</Text>
                    <Text style={styles.historyAction}>{action.action}</Text>
                    <Text style={styles.historyPlayer}>{action.playerName}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
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
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  gameTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#90EE90',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  leftControls: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 15,
  },
  possessionButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 10,
    opacity: 0.7,
  },
  activePossession: {
    opacity: 1,
    borderWidth: 3,
    borderColor: '#FFD700',
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
  rightPanel: {
    position: 'absolute',
    right: 0,
    top: 100,
    bottom: 0,
    width: 250,
    zIndex: 10,
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  panelContent: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  actionsPanel: {
    flex: 1,
    padding: 15,
  },
  historyPanel: {
    flex: 1,
    padding: 15,
  },
  panelTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  teamTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
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
    padding: 10,
    marginBottom: 8,
  },
  historyTime: {
    color: '#90EE90',
    fontWeight: 'bold',
  },
  historyAction: {
    color: 'white',
    fontWeight: 'bold',
  },
  historyPlayer: {
    color: '#ccc',
    fontSize: 12,
  },
});