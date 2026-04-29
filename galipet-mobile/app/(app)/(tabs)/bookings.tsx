import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { useBookings } from '../../../src/hooks/useBookings'
import { useAuthStore } from '../../../src/store/authStore'
import { bookingsService } from '../../../src/services/bookingsService'
import type { Booking, BookingStatus } from '../../../src/types'

type FilterValue = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Confirmées', value: 'confirmed' },
  { label: 'Terminées', value: 'completed' },
  { label: 'Annulées', value: 'cancelled' },
]

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  in_progress: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: colors.warning,
  confirmed: colors.info,
  in_progress: colors.info,
  completed: colors.success,
  cancelled: colors.error,
}

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  garde: 'Garderie',
  garderie: 'Garderie',
  veterinaire: 'Vétérinaire',
  promenade: 'Promenade',
  dressage: 'Dressage',
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BookingsScreen() {
  const { user } = useAuthStore()
  const isPro = user?.role === 'professional' || user?.role === 'both'
  const isOwner = user?.role === 'owner' || user?.role === 'both'
  const showToggle = isPro && isOwner

  const [viewAs, setViewAs] = useState<'owner' | 'professional'>(
    isPro && !isOwner ? 'professional' : 'owner'
  )
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const { bookings, isLoading, error, refresh } = useBookings(viewAs)

  useFocusEffect(useCallback(() => { refresh() }, [refresh]))

  const displayed = activeFilter === 'all'
    ? bookings
    : bookings.filter((b) => {
        if (activeFilter === 'confirmed') return b.status === 'confirmed' || b.status === 'in_progress'
        return b.status === activeFilter
      })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Réservations</Text>

      {showToggle ? (
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleBtn, viewAs === 'owner' && styles.toggleBtnActive]}
            onPress={() => setViewAs('owner')}
          >
            <Text style={[styles.toggleText, viewAs === 'owner' && styles.toggleTextActive]}>
              Mes animaux
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewAs === 'professional' && styles.toggleBtnActive]}
            onPress={() => setViewAs('professional')}
          >
            <Text style={[styles.toggleText, viewAs === 'professional' && styles.toggleTextActive]}>
              Mes clients
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            style={[styles.chip, activeFilter === f.value && styles.chipActive]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text style={[styles.chipText, activeFilter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading && displayed.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Erreur de chargement</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={displayed.length === 0 ? styles.emptyState : styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />}
        >
          {displayed.length === 0 ? (
            <>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>Aucune réservation</Text>
              <Text style={styles.emptyText}>Vos réservations apparaîtront ici.</Text>
            </>
          ) : (
            displayed.map((item) => (
              <BookingCard key={item.id} booking={item} viewAs={viewAs} onRefresh={refresh} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function BookingCard({
  booking,
  viewAs,
  onRefresh,
}: {
  booking: Booking
  viewAs: 'owner' | 'professional'
  onRefresh: () => void
}) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const otherProfile = viewAs === 'professional' ? booking.owner : booking.professional
  const otherName = otherProfile?.full_name ?? (viewAs === 'professional' ? 'Client' : 'Professionnel')

  const isActive = booking.status === 'confirmed' || booking.status === 'in_progress'

  const doUpdate = async (status: BookingStatus) => {
    setIsUpdating(true)
    try {
      await bookingsService.updateStatus(booking.id, status)
      onRefresh()
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la réservation.')
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmAction = (status: BookingStatus, label: string) => {
    Alert.alert(label, `Confirmer : ${label.toLowerCase()} ?`, [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: status === 'cancelled' ? 'destructive' : 'default',
        onPress: () => doUpdate(status),
      },
    ])
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardName}>{otherName}</Text>
          <Text style={styles.cardPet}>
            🐾 {booking.pet?.name ?? 'Animal'}
            {booking.pet?.species ? ` · ${booking.pet.species}` : ''}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[booking.status] }]}>
          <Text style={styles.badgeText}>{STATUS_LABEL[booking.status]}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.cardDetails}>
        <Text style={styles.detailService}>
          {SERVICE_LABELS[booking.service_type] ?? booking.service_type}
        </Text>
        {booking.start_date ? (
          <Text style={styles.detailDate}>{formatDate(booking.start_date)}</Text>
        ) : null}
        {booking.total_price != null ? (
          <Text style={styles.detailPrice}>{booking.total_price} MAD</Text>
        ) : null}
      </View>

      {/* Actions */}
      {isUpdating ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      ) : (
        <View style={styles.actions}>
          {/* Messagerie */}
          <Pressable
            style={styles.msgBtn}
            onPress={() => router.push(`/(app)/conversation/${booking.id}`)}
          >
            <Text style={styles.msgBtnText}>💬 Messagerie</Text>
          </Pressable>

          {/* Pro actions */}
          {viewAs === 'professional' && booking.status === 'pending' ? (
            <>
              <Pressable
                style={[styles.actionBtn, styles.actionConfirm]}
                onPress={() => confirmAction('confirmed', 'Confirmer')}
              >
                <Text style={styles.actionConfirmText}>Confirmer</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.actionRefuse]}
                onPress={() => confirmAction('cancelled', 'Refuser')}
              >
                <Text style={styles.actionRefuseText}>Refuser</Text>
              </Pressable>
            </>
          ) : null}

          {viewAs === 'professional' && isActive ? (
            <Pressable
              style={[styles.actionBtn, styles.actionComplete]}
              onPress={() => confirmAction('completed', 'Marquer terminée')}
            >
              <Text style={styles.actionConfirmText}>Marquer terminée</Text>
            </Pressable>
          ) : null}

          {/* Owner actions */}
          {viewAs === 'owner' && booking.status === 'pending' ? (
            <Pressable
              style={[styles.actionBtn, styles.actionRefuse]}
              onPress={() => confirmAction('cancelled', 'Annuler la demande')}
            >
              <Text style={styles.actionRefuseText}>Annuler la demande</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  toggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.white },
  toggleText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  toggleTextActive: { color: colors.text },
  filterRow: { flexGrow: 0, flexShrink: 0 },
  filters: { paddingHorizontal: 20, paddingVertical: 12, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  chipTextActive: { color: colors.white },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  emptyState: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
  retryText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderLeft: { flex: 1, marginRight: 10, gap: 4 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardPet: { fontSize: 13, color: colors.textLight },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  cardDetails: { gap: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border },
  detailService: { fontSize: 14, fontWeight: '600', color: colors.text },
  detailDate: { fontSize: 13, color: colors.textLight, textTransform: 'capitalize' },
  detailPrice: { fontSize: 14, fontWeight: '700', color: colors.success },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  msgBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  msgBtnText: { fontSize: 13, fontWeight: '600', color: colors.text },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionConfirm: { backgroundColor: colors.success },
  actionComplete: { backgroundColor: colors.primary },
  actionRefuse: { backgroundColor: colors.error + '15', borderWidth: 1, borderColor: colors.error },
  actionConfirmText: { fontSize: 13, fontWeight: '700', color: colors.white },
  actionRefuseText: { fontSize: 13, fontWeight: '700', color: colors.error },
})
