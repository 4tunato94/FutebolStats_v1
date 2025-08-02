import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Clock, Users, Zap } from 'lucide-react-native';
import { useFutebolStore } from '../../stores/futebolStore';

export default function HistoryScreen() {
  const { currentMatch } = useFutebolStore();

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
    switch (action.toLowerCase()) {
      case 'gol': return '⚽';
      case 'assistência': return '🎯';
      case 'chute': return '🥅';
      case 'passe': return '⚽';
      case 'falta': return '⚠️';
      case 'cartão amarelo': return '🟨';
      case 'cartão vermelho': return '🟥';
      case 'substituição': return '🔄';
      default: return '⚽';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'gol': return '#4CAF50';
      case 'assistência': return '#2196F3';
      case 'chute': return '#FF9800';
      case 'passe': return '#9C27B0';
      case 'falta': return '#F44336';
      case 'cartão amarelo': return '#FFEB3B';
      case 'cartão vermelho': return '#F44336';
      case 'substituição': return '#607D8B';
      default: return '#666';
    }
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
      shots: actions.filter(a => a.action.toLowerCase() === 'chute').length,
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
              <View style={styles.actionTime}>
                <Text style={styles.minute}>{action.minute}'</Text>
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
                  </View>
                </View>
                <Text style={styles.actionZone}>{action.zone}</Text>
              </View>
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
  actionZone: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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