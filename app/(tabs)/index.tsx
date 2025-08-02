import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Users, ChevronRight } from 'lucide-react-native';
import { useFutebolStore } from '../../stores/futebolStore';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { teams, startMatch } = useFutebolStore();
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');

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

  if (teams.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚽ FutebolStats</Text>
          <Text style={styles.headerSubtitle}>Análise Tática em Tempo Real</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Users color="#666" size={80} />
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
              <Play color="#2d5016" size={24} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Iniciar Partida</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.teamSelection}>
              <Text style={styles.label}>Time A</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamScroll}>
                {teams.map(team => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamCard,
                      teamAId === team.id && styles.teamCardSelected
                    ]}
                    onPress={() => setTeamAId(team.id)}
                  >
                    <View style={[styles.teamColor, { backgroundColor: team.colors.primary }]} />
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamPlayers}>{team.players.length} jogadores</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.teamSelection}>
              <Text style={styles.label}>Time B</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamScroll}>
                {teams.map(team => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamCard,
                      teamBId === team.id && styles.teamCardSelected
                    ]}
                    onPress={() => setTeamBId(team.id)}
                  >
                    <View style={[styles.teamColor, { backgroundColor: team.colors.primary }]} />
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamPlayers}>{team.players.length} jogadores</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                (!teamAId || !teamBId) && styles.startButtonDisabled
              ]}
              onPress={handleStartMatch}
              disabled={!teamAId || !teamBId}
            >
              <Play color="white" size={28} />
              <Text style={styles.startButtonText}>Iniciar Análise</Text>
              <ChevronRight color="white" size={28} />
            </TouchableOpacity>
          </View>
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
  teamCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  teamCardSelected: {
    borderColor: '#2d5016',
    backgroundColor: '#f0f8f0',
  },
  teamColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    color: '#333',
  },
  teamPlayers: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
});