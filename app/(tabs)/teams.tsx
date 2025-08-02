import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit, Trash2, Users } from 'lucide-react-native';
import { useFutebolStore, Team, Player } from '../../stores/futebolStore';

export default function TeamsScreen() {
  const { teams, addTeam, updateTeam, deleteTeam, addPlayer, updatePlayer, deletePlayer } = useFutebolStore();
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<{ teamId: string; player: Player } | null>(null);

  const [teamForm, setTeamForm] = useState({
    name: '',
    primaryColor: '#FF0000',
    secondaryColor: '#FFFFFF'
  });

  const [playerForm, setPlayerForm] = useState({
    name: '',
    number: '',
    position: ''
  });

  const handleAddTeam = () => {
    if (!teamForm.name.trim()) {
      Alert.alert('Erro', 'Nome do time é obrigatório');
      return;
    }

    addTeam({
      name: teamForm.name,
      colors: {
        primary: teamForm.primaryColor,
        secondary: teamForm.secondaryColor
      },
      players: []
    });

    setTeamForm({ name: '', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' });
    setShowAddTeam(false);
  };

  const handleEditTeam = () => {
    if (!editingTeam || !teamForm.name.trim()) {
      Alert.alert('Erro', 'Nome do time é obrigatório');
      return;
    }

    updateTeam(editingTeam.id, {
      name: teamForm.name,
      colors: {
        primary: teamForm.primaryColor,
        secondary: teamForm.secondaryColor
      }
    });

    setEditingTeam(null);
    setTeamForm({ name: '', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' });
  };

  const handleAddPlayer = (teamId: string) => {
    if (!playerForm.name.trim() || !playerForm.number.trim() || !playerForm.position.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    const number = parseInt(playerForm.number);
    if (isNaN(number) || number < 1 || number > 99) {
      Alert.alert('Erro', 'Número deve ser entre 1 e 99');
      return;
    }

    // Check if number already exists in team
    const team = teams.find(t => t.id === teamId);
    if (team?.players.some(p => p.number === number)) {
      Alert.alert('Erro', 'Este número já está sendo usado por outro jogador');
      return;
    }

    addPlayer(teamId, {
      name: playerForm.name,
      number,
      position: playerForm.position
    });

    setPlayerForm({ name: '', number: '', position: '' });
    setShowAddPlayer(null);
  };

  const handleEditPlayer = () => {
    if (!editingPlayer || !playerForm.name.trim() || !playerForm.number.trim() || !playerForm.position.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    const number = parseInt(playerForm.number);
    if (isNaN(number) || number < 1 || number > 99) {
      Alert.alert('Erro', 'Número deve ser entre 1 e 99');
      return;
    }

    // Check if number already exists in team (excluding current player)
    const team = teams.find(t => t.id === editingPlayer.teamId);
    if (team?.players.some(p => p.number === number && p.id !== editingPlayer.player.id)) {
      Alert.alert('Erro', 'Este número já está sendo usado por outro jogador');
      return;
    }

    updatePlayer(editingPlayer.teamId, editingPlayer.player.id, {
      name: playerForm.name,
      number,
      position: playerForm.position
    });

    setEditingPlayer(null);
    setPlayerForm({ name: '', number: '', position: '' });
  };

  const startEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      primaryColor: team.colors.primary,
      secondaryColor: team.colors.secondary
    });
  };

  const startEditPlayer = (teamId: string, player: Player) => {
    setEditingPlayer({ teamId, player });
    setPlayerForm({
      name: player.name,
      number: player.number.toString(),
      position: player.position
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciar Times</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddTeam(true)}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {teams.map(team => (
          <View key={team.id} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={styles.teamInfo}>
                <View style={[styles.teamColor, { backgroundColor: team.colors.primary }]} />
                <View>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamPlayers}>{team.players.length} jogadores</Text>
                </View>
              </View>
              <View style={styles.teamActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => startEditTeam(team)}
                >
                  <Edit color="#666" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert(
                      'Confirmar',
                      `Deseja excluir o time ${team.name}?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Excluir', style: 'destructive', onPress: () => deleteTeam(team.id) }
                      ]
                    );
                  }}
                >
                  <Trash2 color="#ff4444" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.playersSection}>
              <View style={styles.playersSectionHeader}>
                <Text style={styles.playersTitle}>Jogadores</Text>
                <TouchableOpacity
                  style={styles.addPlayerButton}
                  onPress={() => setShowAddPlayer(team.id)}
                >
                  <Plus color="#2d5016" size={16} />
                </TouchableOpacity>
              </View>

              {team.players.length === 0 ? (
                <Text style={styles.noPlayers}>Nenhum jogador cadastrado</Text>
              ) : (
                team.players.map(player => (
                  <View key={player.id} style={styles.playerCard}>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerNumber}>#{player.number}</Text>
                      <View>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerPosition}>{player.position}</Text>
                      </View>
                    </View>
                    <View style={styles.playerActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startEditPlayer(team.id, player)}
                      >
                        <Edit color="#666" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          Alert.alert(
                            'Confirmar',
                            `Deseja excluir o jogador ${player.name}?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Excluir', style: 'destructive', onPress: () => deletePlayer(team.id, player.id) }
                            ]
                          );
                        }}
                      >
                        <Trash2 color="#ff4444" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ))}

        {teams.length === 0 && (
          <View style={styles.emptyState}>
            <Users color="#666" size={80} />
            <Text style={styles.emptyTitle}>Nenhum time cadastrado</Text>
            <Text style={styles.emptyText}>Toque no botão + para adicionar seu primeiro time</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Team Modal */}
      {(showAddTeam || editingTeam) && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTeam ? 'Editar Time' : 'Novo Time'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome do time"
              value={teamForm.name}
              onChangeText={(text) => setTeamForm({ ...teamForm, name: text })}
            />

            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>Cor Primária</Text>
              <View style={styles.colorPreview}>
                <View style={[styles.colorSample, { backgroundColor: teamForm.primaryColor }]} />
                <TextInput
                  style={styles.colorInput}
                  value={teamForm.primaryColor}
                  onChangeText={(text) => setTeamForm({ ...teamForm, primaryColor: text })}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddTeam(false);
                  setEditingTeam(null);
                  setTeamForm({ name: '', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingTeam ? handleEditTeam : handleAddTeam}
              >
                <Text style={styles.saveButtonText}>
                  {editingTeam ? 'Salvar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add/Edit Player Modal */}
      {(showAddPlayer || editingPlayer) && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome do jogador"
              value={playerForm.name}
              onChangeText={(text) => setPlayerForm({ ...playerForm, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Número (1-99)"
              value={playerForm.number}
              onChangeText={(text) => setPlayerForm({ ...playerForm, number: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Posição"
              value={playerForm.position}
              onChangeText={(text) => setPlayerForm({ ...playerForm, position: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddPlayer(null);
                  setEditingPlayer(null);
                  setPlayerForm({ name: '', number: '', position: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingPlayer ? handleEditPlayer : () => handleAddPlayer(showAddPlayer!)}
              >
                <Text style={styles.saveButtonText}>
                  {editingPlayer ? 'Salvar' : 'Adicionar'}
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
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teamPlayers: {
    fontSize: 14,
    color: '#666',
  },
  teamActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  playersSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  playersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addPlayerButton: {
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
    padding: 4,
  },
  noPlayers: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
    marginRight: 12,
    minWidth: 30,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playerPosition: {
    fontSize: 14,
    color: '#666',
  },
  playerActions: {
    flexDirection: 'row',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  colorSection: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSample: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
});