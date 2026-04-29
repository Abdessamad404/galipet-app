import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/colors'
import { useAuthStore } from '../../src/store/authStore'
import { useInsuranceLeads } from '../../src/hooks/useInsuranceLeads'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const firstName = user?.full_name?.split(' ')[0] ?? 'Admin'
  const { leads: pendingLeads, isLoading } = useInsuranceLeads('new')

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>Bonjour, {firstName}</Text>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🛡️</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.cardCount}>{pendingLeads.length}</Text>
          )}
          <Text style={styles.cardLabel}>Leads assurance en attente</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textLight, marginTop: 4 },
  cards: { paddingHorizontal: 20, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  cardEmoji: { fontSize: 36 },
  cardCount: { fontSize: 40, fontWeight: '700', color: colors.primary },
  cardLabel: { fontSize: 14, color: colors.textLight, fontWeight: '600' },
})
