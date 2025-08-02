import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Target, Users, Clock } from 'lucide-react-native';
import { useFutebolStore } from '@/stores/futebolStore';
import * as Haptics from 'expo-haptics';

const ACTION_TYPES = [
  { id: 'goal', name: 'Gol', icon: '⚽', color: '#4CAF50' },
  { id: 'assist', name: 'Assistência', icon: '🎯', color: '#2196F3' },
  { id: 'shot', name: 'Chute', icon: '🥅', color: '#FF9800' },
  { id: 'pass', name: 'Passe', icon: '⚽', color: '#9C27B0' },
  { id: 'foul', name: 'Falta', icon: '⚠️', color: '#F44336' },
  { id: 'card_yellow', name: 'Cartão Amarelo', icon: '🟨', color: '#FFEB3B' },
  { id: 'card_red', name: 'Cartão Vermelho', icon: '🟥', color: '#F44336' },
  { id: 'substitution', name: 'Substituição', icon: '🔄', color: '#607D8B' },
];

const FIELD_ZONES = [
  'Área 1', 'Área 2', 'Meio-campo', 'Ataque', 'Defesa'
];

export default function ActionsScreen() {
  const { currentMatch, teams, addAction } = useFutebolStore();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleActionPress = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAction(actionId);
  };

  const handleTeamPress = (teamId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTeam(teamId);
    setSelectedPlayer(null); // Reset player selection
  };

  const handlePlayerPress = (playerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlayer(playerId);
  };

  const handleZonePress = (zone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedZone(zone);
  };

  const handleSubmitAction = () => {
    if (!selectedAction || !selectedTeam || !selectedPlayer || !selectedZone) {
      Alert.alert('Erro', 'Selecione todos os campos obrigatórios');
      return;
    }

    if (!currentMatch) {
      Alert.alert('Erro', 'Nenhuma partida em andamento');
      return;
    }

    const team = currentMatch.teamA.id === selectedTeam ? currentMatch.teamA : currentMatch.teamB;
    const player = team.players.find(p => p.id === selectedPlayer);
    
    if (!player) {
      Alert.alert('Erro', 'Jogador não encontrado');
      return;
    }

    const actionType = ACTION_TYPES.find(a => a.id === selectedAction);
    const minute = Math.floor((Date.now() - currentMatch.startTime.getTime()) / 60000);

    addAction({
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      action: actionType?.name || selectedAction,
      zone: selectedZone,
      minute
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Reset selections
    setSelectedAction(null);
    setSelectedTeam(null);
    setSelectedPlayer(null);
    setSelectedZone(null);

    Alert.alert('Sucesso', 'Ação registrada com sucesso!');
  };

  const getSelectedTeamPlayers = () => {
    if (!currentMatch || !selectedTeam) return [];
    const team = currentMatch.teamA.id === selectedTeam ? currentMatch.teamA : currentMatch.teamB;
    return team.players;
  };

  if (!currentMatch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ações do Jogo</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Zap color="#666" size={80} />
          <Text style={styles.emptyTitle}>Nenhuma partida em andamento</Text>
          <Text style={styles.emptyText}>
            Inicie uma partida na tela inicial para registrar ações
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ações do Jogo</Text>
        <View style={styles.matchInfo}>
          <Text style={styles.matchText}>
            {currentMatch.teamA.name} vs {currentMatch.teamB.name}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Action Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Ação</Text>
          <View style={styles.actionGrid}>
            {ACTION_TYPES.map(action => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton,
                  { backgroundColor: action.color },
                  selectedAction === action.id && styles.selectedButton
                ]}
                onPress={() => handleActionPress(action.id)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionText}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Team Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.teamGrid}>
            <TouchableOpacity
              style={[
                styles.teamButton,
                { backgroundColor: currentMatch.teamA.colors.primary },
                selectedTeam === currentMatch.teamA.id && styles.selectedTeamButton
              ]}
              onPress={() => handleTeamPress(currentMatch.teamA.id)}
            >
              <Text style={styles.teamText}>{currentMatch.teamA.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.teamButton,
                { backgroundColor: currentMatch.teamB.colors.primary },
                selectedTeam === currentMatch.teamB.id && styles.selectedTeamButton
              ]}
              onPress={() => handleTeamPress(currentMatch.teamB.id)}
            >
              <Text style={styles.teamText}>{currentMatch.teamB.name}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Player Selection */}
        {selectedTeam && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jogador</Text>
            <View style={styles.playerGrid}>
              {getSelectedTeamPlayers().map(player => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerButton,
                    selectedPlayer === player.id && styles.selectedPlayerButton
                  ]}
                  onPress={() => handlePlayerPress(player.id)}
                >
                  <Text style={styles.playerNumber}>#{player.number}</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Zone Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona do Campo</Text>
          <View style={styles.zoneGrid}>
            {FIELD_ZONES.map(zone => (
              <TouchableOpacity
                key={zone}
                style={[
                  styles.zoneButton,
                  selectedZone === zone && styles.selectedZoneButton
                ]}
                onPress={() => handleZonePress(zone)}
              >
                <Text style={styles.zoneText}>{zone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedAction || !selectedTeam || !selectedPlayer || !selectedZone) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitAction}
          disabled={!selectedAction || !selectedTeam || !selectedPlayer || !selectedZone}
        >
          <Zap color="white" size={24} />
          <Text style={styles.submitButtonText}>Registrar Ação</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2d5016',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  matchInfo: {
    marginTop: 4,
  },
  matchText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedButton: {
    borderWidth: 3,
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  teamGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  teamButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  selectedTeamButton: {
    borderWidth: 3,
    borderColor: '#333',
  },
  teamText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: '30%',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedPlayerButton: {
    borderColor: '#2d5016',
    backgroundColor: '#f0f8f0',
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  playerPosition: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedZoneButton: {
    borderColor: '#2d5016',
    backgroundColor: '#f0f8f0',
  },
  zoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2d5016',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});