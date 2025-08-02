import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeamsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Times</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gerenciar Times</Text>
          <Text style={styles.cardText}>
            Funcionalidade em desenvolvimento...
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});