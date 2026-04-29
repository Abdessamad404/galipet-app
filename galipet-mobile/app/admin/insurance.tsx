import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/colors'
import { useInsuranceLeads } from '../../src/hooks/useInsuranceLeads'
import { InsuranceLead, InsuranceLeadStatus } from '../../src/types'

type FilterTab = { label: string; value: InsuranceLeadStatus | undefined }

const FILTERS: FilterTab[] = [
  { label: 'Tous', value: undefined },
  { label: 'En attente', value: 'new' },
  { label: 'Contactés', value: 'contacted' },
  { label: 'Convertis', value: 'converted' },
  { label: 'Rejetés', value: 'rejected' },
]

const STATUS_LABELS: Record<InsuranceLeadStatus, string> = {
  new: 'En attente',
  contacted: 'Contacté',
  converted: 'Converti',
  rejected: 'Rejeté',
}

const STATUS_COLORS: Record<InsuranceLeadStatus, string> = {
  new: colors.warning,
  contacted: colors.info,
  converted: colors.success,
  rejected: colors.error,
}

const NEXT_STATUSES: Record<InsuranceLeadStatus, InsuranceLeadStatus[]> = {
  new: ['contacted', 'rejected'],
  contacted: ['converted', 'rejected'],
  converted: [],
  rejected: [],
}

export default function InsuranceAdminScreen() {
  const [activeFilter, setActiveFilter] = useState<InsuranceLeadStatus | undefined>(undefined)
  const { leads, isLoading, isUpdating, error, updateStatus, refresh } =
    useInsuranceLeads(activeFilter)

  const handleLeadPress = (lead: InsuranceLead) => {
    const next = NEXT_STATUSES[lead.status]
    if (next.length === 0) {
      Alert.alert(STATUS_LABELS[lead.status], 'Ce lead ne peut plus être modifié.')
      return
    }

    const buttons = next.map((s) => ({
      text: `→ ${STATUS_LABELS[s]}`,
      onPress: () => updateStatus(lead.id, s),
    }))

    Alert.alert(
      lead.owner_name,
      `Statut actuel : ${STATUS_LABELS[lead.status]}\nChanger vers :`,
      [...buttons, { text: 'Annuler', style: 'cancel' as const }],
    )
  }

  const renderLead = ({ item }: { item: InsuranceLead }) => (
    <Pressable style={styles.card} onPress={() => handleLeadPress(item)} android_ripple={{ color: colors.border }}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.owner_name}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.cardMeta}>🐾 {item.pet_name} · {item.pet_species}</Text>
        <Text style={styles.cardMeta}>📍 {item.owner_city}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.cardPhone}>📞 {item.owner_phone}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString('fr-MA')}
        </Text>
      </View>
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filtres */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item: f }) => (
          <Pressable
            style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        )}
      />

      {/* Erreur */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Liste */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(l) => l.id}
          renderItem={renderLead}
          contentContainerStyle={leads.length === 0 ? styles.center : styles.list}
          refreshControl={<RefreshControl refreshing={isUpdating} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>Aucun lead</Text>
              <Text style={styles.emptyText}>Aucun lead pour ce filtre.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  filterTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { fontSize: 13, color: colors.textLight },
  cardPhone: { fontSize: 13, color: colors.info, fontWeight: '600' },
  cardDate: { fontSize: 12, color: colors.textLight },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', gap: 10, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.error + '15',
    borderRadius: 8,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600' },
})
