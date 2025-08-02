import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { useFutebolStore } from '../../stores/futebolStore';
import ColorPicker from '../../components/ColorPicker';

export default function ActionsScreen() {
  const { 
    actionTypes, 
    addActionType, 
    updateActionType, 
    deleteActionType 
  } = useFutebolStore();
  
  const [showAddActionType, setShowAddActionType] = useState(false);
  const [editingActionType, setEditingActionType] = useState<any>(null);

  const [actionTypeForm, setActionTypeForm] = useState({
    name: '',
    icon: '',
    color: '#4CAF50',
    category: 'neutral' as 'offensive' | 'defensive' | 'neutral',
    changePossessionAutomatically: false,
    requiresPlayerSelection: false,
    reverseAction: false,
    multiplePlayersAction: false,
    teamChangeAction: false
  });

  const handleAddActionType = () => {
    if (!actionTypeForm.name.trim() || !actionTypeForm.icon.trim()) {
      Alert.alert('Erro', 'Nome e ícone são obrigatórios');
      return;
    }

    addActionType(actionTypeForm);
    setActionTypeForm({
      name: '',
      icon: '',
      color: '#4CAF50',
      category: 'neutral',
      changePossessionAutomatically: false,
      requiresPlayerSelection: false,
      reverseAction: false,
      multiplePlayersAction: false,
      teamChangeAction: false
    });
    setShowAddActionType(false);
  };

  const handleEditActionType = () => {
    if (!editingActionType || !actionTypeForm.name.trim() || !actionTypeForm.icon.trim()) {
      Alert.alert('Erro', 'Nome e ícone são obrigatórios');
      return;
    }

    updateActionType(editingActionType.id, actionTypeForm);
    setEditingActionType(null);
    setActionTypeForm({
      name: '',
      icon: '',
      color: '#4CAF50',
      category: 'neutral',
      changePossessionAutomatically: false,
      requiresPlayerSelection: false,
      reverseAction: false,
      multiplePlayersAction: false,
      teamChangeAction: false
    });
  };

  const startEditActionType = (actionType: any) => {
    setEditingActionType(actionType);
    setActionTypeForm({
      name: actionType.name,
      icon: actionType.icon,
      color: actionType.color,
      category: actionType.category,
      changePossessionAutomatically: actionType.changePossessionAutomatically || false,
      requiresPlayerSelection: actionType.requiresPlayerSelection || false,
      reverseAction: actionType.reverseAction || false,
      multiplePlayersAction: actionType.multiplePlayersAction || false,
      teamChangeAction: actionType.teamChangeAction || false
    });
  };

  const getSelectedTeamPlayers = () => {
    if (!currentMatch || !selectedTeam) return [];
    const team = currentMatch.teamA.id === selectedTeam ? currentMatch.teamA : currentMatch.teamB;
    return team.players;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadastro de Ações</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddActionType(true)}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Ação Cadastrados</Text>
          <View style={styles.actionTypesGrid}>
            {actionTypes.map(actionType => (
              <View key={actionType.id} style={styles.actionTypeCard}>
                <View style={styles.actionTypeHeader}>
                  <View style={[styles.actionTypeIcon, { backgroundColor: actionType.color }]}>
                    <Text style={styles.actionTypeEmoji}>{actionType.icon}</Text>
                  </View>
                  <Text style={styles.actionTypeName}>{actionType.name}</Text>
                  <View style={styles.actionTypeActions}>
                    <TouchableOpacity
                      onPress={() => startEditActionType(actionType)}
                      style={styles.actionTypeButton}
                    >
                      <Edit color="#666" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Confirmar',
                          `Deseja excluir a ação "${actionType.name}"?`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Excluir', style: 'destructive', onPress: () => deleteActionType(actionType.id) }
                          ]
                        );
                      }}
                      style={styles.actionTypeButton}
                    >
                      <Trash2 color="#ff4444" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.actionTypeCategory}>Categoria: {actionType.category}</Text>
                <View style={styles.actionTypeOptions}>
                  {actionType.changePossessionAutomatically && (
                    <Text style={styles.actionTypeOption}>• Muda posse automaticamente</Text>
                  )}
                  {actionType.requiresPlayerSelection && (
                    <Text style={styles.actionTypeOption}>• Requer seleção de jogador</Text>
                  )}
                  {actionType.reverseAction && (
                    <Text style={styles.actionTypeOption}>• Ação reversa</Text>
                  )}
                  {actionType.multiplePlayersAction && (
                    <Text style={styles.actionTypeOption}>• Ação de múltiplos jogadores</Text>
                  )}
                  {actionType.teamChangeAction && (
                    <Text style={styles.actionTypeOption}>• Mudança no time</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Action Type Modal */}
      {(showAddActionType || editingActionType) && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingActionType ? 'Editar Tipo de Ação' : 'Nova Tipo de Ação'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome da ação"
              value={actionTypeForm.name}
              onChangeText={(text) => setActionTypeForm({ ...actionTypeForm, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Ícone (emoji)"
              value={actionTypeForm.icon}
              onChangeText={(text) => setActionTypeForm({ ...actionTypeForm, icon: text })}
            />

            <ColorPicker
              label="Cor"
              color={actionTypeForm.color}
              onColorChange={(color) => setActionTypeForm({ ...actionTypeForm, color })}
            />

            <View style={styles.categoryButtons}>
              {['offensive', 'defensive', 'neutral'].map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    actionTypeForm.category === category && styles.selectedCategory
                  ]}
                  onPress={() => setActionTypeForm({ ...actionTypeForm, category: category as any })}
                >
                  <Text style={styles.categoryButtonText}>
                    {category === 'offensive' ? 'Ofensiva' : 
                     category === 'defensive' ? 'Defensiva' : 'Neutra'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddActionType(false);
                  setEditingActionType(null);
                  setActionTypeForm({
                    name: '',
                    icon: '',
                    color: '#4CAF50',
                    category: 'neutral',
                    changePossessionAutomatically: false,
                    requiresPlayerSelection: false,
                    reverseAction: false,
                    multiplePlayersAction: false,
                    teamChangeAction: false
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingActionType ? handleEditActionType : handleAddActionType}
              >
                <Text style={styles.saveButtonText}>
                  {editingActionType ? 'Salvar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  matchInfo: {
    flex: 1,
    alignItems: 'center',
  },
  matchText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
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
    minWidth: '30%',
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
    minWidth: '30%',
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
  detailsInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top',
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
  recentAction: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentActionTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5016',
    marginRight: 12,
    minWidth: 40,
  },
  recentActionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionTypesGrid: {
    gap: 12,
  },
  actionTypeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  actionTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTypeEmoji: {
    fontSize: 16,
  },
  actionTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actionTypeActions: {
    flexDirection: 'row',
  },
  actionTypeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionTypeCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  actionTypeOptions: {
    marginTop: 4,
  },
  actionTypeOption: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
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
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#2d5016',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2d5016',
    borderRadius: 8,
    padding: 16,
    marginLeft: 8,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2d5016',
    borderColor: '#2d5016',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});