import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Clock, Users, Zap, Edit, Trash2, Save, X } from 'lucide-react-native';
import { useFutebolStore } from '../../stores/futebolStore';

export default function HistoryScreen() {
  const { currentMatch, updateAction, deleteAction } = useFutebolStore();
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    action: '',
    zone: '',
    details: '',
    minute: '',
    second: ''
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getActionIcon = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'gol': '⚽',
      'assistência': '🎯',
      'chute no gol': '🥅',
      'chute fora': '📤',
      'passe certo': '✅',
      'passe errado': '❌',
      'cruzamento': '↗️',
      'escanteio': '📐',
      'tiro livre': '🦶',
      'pênalti': '🎯',
      'falta': '⚠️',
      'cartão amarelo': '🟨',
      'cartão vermelho': '🟥',
      'substituição': '🔄',
      'impedimento': '🚫',
      'desarme': '🛡️',
      'interceptação': '✋',
      'defesa': '🧤'
    };
    return actionMap[action.toLowerCase()] || '⚽';
  };

  const getActionColor = (action: string) => {
    const colorMap: { [key: string]: string } = {
      'gol': '#4CAF50',
      'assistência': '#2196F3',
      'chute no gol': '#FF9800',
      'chute fora': '#FF5722',
      'passe certo': '#8BC34A',
      'passe errado': '#F44336',
      'cruzamento': '#9C27B0',
      'escanteio': '#607D8B',
      'tiro livre': '#795548',
      'pênalti': '#E91E63',
      'falta': '#F44336',
      'cartão amarelo': '#FFEB3B',
      'cartão vermelho': '#F44336',
      'substituição': '#607D8B',
      'impedimento': '#9E9E9E',
      'desarme': '#3F51B5',
      'interceptação': '#009688',
      'defesa': '#00BCD4'
    };
    return colorMap[action.toLowerCase()] || '#666';
  };

  const startEditAction = (action: any) => {
    setEditingAction(action.id);
    setEditForm({
      action: action.action,
      zone: action.zone,
      details: action.details || '',
      minute: action.minute.toString(),
      second: action.second.toString()
    });
  };

  const saveEditAction = () => {
    if (!editingAction) return;

    const minute = parseInt(editForm.minute) || 0;
    const second = parseInt(editForm.second) || 0;

    updateAction(editingAction, {
      action: editForm.action,
      zone: editForm.zone,
      details: editForm.details || undefined,
      minute,
      second
    });

    setEditingAction(null);
    setEditForm({
      action: '',
      zone: '',
      details: '',
      minute: '',
      second: ''
    });
  };

  const cancelEdit = () => {
    setEditingAction(null);
    setEditForm({
      action: '',
      zone: '',
      details: '',
      minute: '',
      second: ''
    });
  };

  const handleDeleteAction = (actionId: string, actionName: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a ação "${actionName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: () => deleteAction(actionId) 
        }
      ]
    );
  };

  if (!currentMatch || currentMatch.actions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Histórico</Text>
        </View>
        
        <View style={styles.emptyState}>
          <History color="#666" size={80} />
          <Text style={styles.emptyTitle}>Nenhuma ação registrada</Text>
          <Text style={styles.emptyText}>
            {!currentMatch 
              ? 'Inicie uma partida para ver o histórico de ações'
              : 'As ações registradas durante a partida aparecerão aqui'
            }
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedActions = [...currentMatch.actions].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  const actionsByTeam = {
    [currentMatch.teamA.id]: sortedActions.filter(action => action.teamId === currentMatch.teamA.id),
    [currentMatch.teamB.id]: sortedActions.filter(action => action.teamId === currentMatch.teamB.id),
  };

  const getTeamStats = (teamId: string) => {
    const actions = actionsByTeam[teamId];
    return {
      goals: actions.filter(a => a.action.toLowerCase() === 'gol').length,
      shots: actions.filter(a => a.action.toLowerCase().includes('chute')).length,
      fouls: actions.filter(a => a.action.toLowerCase() === 'falta').length,
      cards: actions.filter(a => a.action.toLowerCase().includes('cartão')).length,
    };
  };

  const teamAStats = getTeamStats(currentMatch.teamA.id);
  const teamBStats = getTeamStats(currentMatch.teamB.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico da Partida</Text>
        <View style={styles.matchInfo}>
          <Text style={styles.matchText}>
            {currentMatch.teamA.name} vs {currentMatch.teamB.name}
          </Text>
          <Text style={styles.matchTime}>
            Iniciada às {formatTime(currentMatch.startTime)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo da Partida</Text>
          
          <View style={styles.scoreBoard}>
            <View style={styles.teamScore}>
              <View style={[styles.teamColorIndicator, { backgroundColor: currentMatch.teamA.colors.primary }]} />
              <Text style={styles.teamName}>{currentMatch.teamA.name}</Text>
              <Text style={styles.score}>{teamAStats.goals}</Text>
            </View>
            
            <Text style={styles.vs}>×</Text>
            
            <View style={styles.teamScore}>
              <Text style={styles.score}>{teamBStats.goals}</Text>
              <Text style={styles.teamName}>{currentMatch.teamB.name}</Text>
              <View style={[styles.teamColorIndicator, { backgroundColor: currentMatch.teamB.colors.primary }]} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sortedActions.length}</Text>
              <Text style={styles.statLabel}>Ações</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamAStats.shots + teamBStats.shots}</Text>
              <Text style={styles.statLabel}>Chutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamAStats.fouls + teamBStats.fouls}</Text>
              <Text style={styles.statLabel}>Faltas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamAStats.cards + teamBStats.cards}</Text>
              <Text style={styles.statLabel}>Cartões</Text>
            </View>
          </View>
        </View>

        {/* Actions Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Linha do Tempo</Text>
          
          {sortedActions.map((action, index) => (
            <View key={action.id} style={styles.actionItem}>
              {editingAction === action.id ? (
                // Edit Mode
                <View style={styles.editMode}>
                  <View style={styles.editHeader}>
                    <Text style={styles.editTitle}>Editando Ação</Text>
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={saveEditAction} style={styles.saveButton}>
                        <Save color="#4CAF50" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                        <X color="#F44336" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.editForm}>
                    <View style={styles.timeInputs}>
                      <TextInput
                        style={styles.timeInput}
                        placeholder="Min"
                        value={editForm.minute}
                        onChangeText={(text) => setEditForm({ ...editForm, minute: text })}
                        keyboardType="numeric"
                      />
                      <Text style={styles.timeSeparator}>:</Text>
                      <TextInput
                        style={styles.timeInput}
                        placeholder="Seg"
                        value={editForm.second}
                        onChangeText={(text) => setEditForm({ ...editForm, second: text })}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <TextInput
                      style={styles.editInput}
                      placeholder="Ação"
                      value={editForm.action}
                      onChangeText={(text) => setEditForm({ ...editForm, action: text })}
                    />
                    
                    <TextInput
                      style={styles.editInput}
                      placeholder="Zona"
                      value={editForm.zone}
                      onChangeText={(text) => setEditForm({ ...editForm, zone: text })}
                    />
                    
                    <TextInput
                      style={[styles.editInput, styles.detailsInput]}
                      placeholder="Detalhes (opcional)"
                      value={editForm.details}
                      onChangeText={(text) => setEditForm({ ...editForm, details: text })}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </View>
              ) : (
                // View Mode
                <>
                  <View style={styles.actionTime}>
                    <Text style={styles.minute}>{action.minute}:{action.second.toString().padStart(2, '0')}</Text>
                    <Text style={styles.timestamp}>{formatTime(action.timestamp)}</Text>
                  </View>
                  
                  <View style={styles.actionContent}>
                    <View style={styles.actionHeader}>
                      <View style={[styles.actionIcon, { backgroundColor: getActionColor(action.action) }]}>
                        <Text style={styles.actionEmoji}>{getActionIcon(action.action)}</Text>
                      </View>
                      <View style={styles.actionInfo}>
                        <Text style={styles.actionType}>{action.action}</Text>
                        <Text style={styles.actionDetails}>
                          {action.playerName} • {action.teamName}
                        </Text>
                        {action.details && (
                          <Text style={styles.actionDetailsText}>{action.details}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.actionZone}>{action.zone}</Text>
                  </View>
                  
                  <View style={styles.actionActions}>
                    <TouchableOpacity
                      onPress={() => startEditAction(action)}
                      style={styles.actionButton}
                    >
                      <Edit color="#666" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteAction(action.id, action.action)}
                      style={styles.actionButton}
                    >
                      <Trash2 color="#ff4444" size={16} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
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
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  matchTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  teamScore: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5016',
    marginHorizontal: 8,
  },
  vs: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  minute: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionEmoji: {
    fontSize: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionDetailsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionZone: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actionActions: {
    flexDirection: 'column',
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
    marginBottom: 4,
  },
  editMode: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editActions: {
    flexDirection: 'row',
  },
  saveButton: {
    padding: 4,
    marginRight: 8,
  },
  cancelButton: {
    padding: 4,
  },
  editForm: {
    gap: 8,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    width: 50,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  detailsInput: {
    height: 60,
    textAlignVertical: 'top',
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