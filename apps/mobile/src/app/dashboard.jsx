import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>ArabDG Finance</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
            <Text style={styles.statTitle}>Total Income</Text>
            <Text style={styles.statValue}>$0</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
            <Text style={styles.statTitle}>Total Expenses</Text>
            <Text style={styles.statValue}>$0</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
            <Text style={styles.statTitle}>Net Profit</Text>
            <Text style={styles.statValue}>$0</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.statTitle}>Outstanding</Text>
            <Text style={styles.statValue}>$0</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>View Invoices</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>Add Payment</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>View Clients</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>Payroll</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#1f2937',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
});