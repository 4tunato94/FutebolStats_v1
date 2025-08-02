import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFutebolStore } from '../../stores/futebolStore';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { teams, startMatch } = useFutebolStore();
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [showTeamAModal, setShowTeamAModal] = useState(false);
  const [showTeamBModal, setShowTeamBModal] = useState(false);

  const handleStartMatch = () => {
    if (!teamAId || !teamBId) {
      Alert.alert('Erro', 'Selecione ambos os times!');
      return;
    }
    if (teamAId === teamBId) {
      Alert.alert('Erro', 'Selecione times diferentes!');
      return;
    }
    startMatch(teamAId, teamBId);
    router.push('/game');
  };

  const getTeamById = (id: string) => teams.find(team => team.id === id);
  if (teams.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚽ FutebolStats</Text>
          <Text style={styles.headerSubtitle}>Análise Tática em Tempo Real</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Ionicons name="people" color="#666" size={80} />
          <Text style={styles.emptyTitle}>Times Insuficientes</Text>
          <Text style={styles.emptyText}>
            Cadastre pelo menos 2 times para começar uma análise
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚽ FutebolStats</Text>
        <Text style={styles.headerSubtitle}>Análise Tática em Tempo Real</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="play" color="#2d5016" size={24} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Iniciar Partida</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.teamSelection}>
              <Text style={styles.label}>Selecione Time A:</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowTeamAModal(true)}
              >
                {teamAId ? (
                  <View style={styles.selectedTeam}>
                    <View style={[styles.teamLogo, { backgroundColor: getTeamById(teamAId)?.colors.primary }]} />
                    <Text style={styles.selectedTeamText}>{getTeamById(teamAId)?.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Selecionar time...</Text>
                )}
                <Ionicons name="chevron-down" color="#666" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.teamSelection}>
              <Text style={styles.label}>Selecione Time B:</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowTeamBModal(true)}
              >
                {teamBId ? (
                  <View style={styles.selectedTeam}>
                    <View style={[styles.teamLogo, { backgroundColor: getTeamById(teamBId)?.colors.primary }]} />
                    <Text style={styles.selectedTeamText}>{getTeamById(teamBId)?.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Selecionar time...</Text>
                )}
                <Ionicons name="chevron-down" color="#666" size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                (!teamAId || !teamBId) && styles.startButtonDisabled
              ]}
              onPress={handleStartMatch}
              disabled={!teamAId || !teamBId}
            >
              <Ionicons name="play" color="white" size={28} />
              <Text style={styles.startButtonText}>Iniciar Análise</Text>
              <Ionicons name="chevron-forward" color="white" size={28} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Team A Selection Modal */}
      <Modal
        visible={showTeamAModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTeamAModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Time A</Text>
            {teams.map(team => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamOption}
                onPress={() => {
                  setTeamAId(team.id);
                  setShowTeamAModal(false);
                }}
              >
                <View style={[styles.teamLogo, { backgroundColor: team.colors.primary }]} />
                <Text style={styles.teamOptionText}>{team.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTeamAModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Team B Selection Modal */}
      <Modal
        visible={showTeamBModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTeamBModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Time B</Text>
            {teams.map(team => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamOption}
                onPress={() => {
                  setTeamBId(team.id);
                  setShowTeamBModal(false);
                }}
              >
                <View style={[styles.teamLogo, { backgroundColor: team.colors.primary }]} />
                <Text style={styles.teamOptionText}>{team.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTeamBModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 80,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContent: {
    padding: 24,
  },
  teamSelection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  teamScroll: {
    marginHorizontal: -8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  selectedTeam: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  selectedTeamText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#2d5016',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 80,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  teamOptionText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});