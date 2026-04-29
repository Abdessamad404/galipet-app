import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { Avatar } from '../../../src/components/Avatar'
import { useBookings } from '../../../src/hooks/useBookings'
import { useAuthStore } from '../../../src/store/authStore'
import type { Booking } from '../../../src/types'

export default function MessagesScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const asRole = user?.role === 'professional' ? 'professional' : 'owner'
  const { bookings: ownerBookings, isLoading: loadingOwner } = useBookings('owner')
  const { bookings: proBookings, isLoading: loadingPro } = useBookings('professional')

  const isLoading = loadingOwner || loadingPro

  const seen = new Set<string>()
  const allBookings =
    user?.role === 'both'
      ? [...ownerBookings, ...proBookings].filter((b) => {
          if (seen.has(b.id)) return false
          seen.add(b.id)
          return true
        })
      : asRole === 'professional'
        ? proBookings
        : ownerBookings

  const activeBookings = allBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress'
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Messages</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : activeBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>Aucun message</Text>
          <Text style={styles.emptyText}>
            Vos conversations apparaîtront ici après avoir effectué une réservation confirmée.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingRow
              booking={item}
              onPress={() => router.push(`/conversation/${item.id}`)}
              asRole={asRole}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  )
}

function BookingRow({
  booking,
  onPress,
  asRole,
}: {
  booking: Booking
  onPress: () => void
  asRole: 'owner' | 'professional'
}) {
  const other =
    asRole === 'professional' ? booking.owner : booking.professional
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar uri={other?.avatar_url} name={other?.full_name ?? '?'} size={50} />
      <View style={styles.info}>
        <Text style={styles.name}>{other?.full_name ?? '—'}</Text>
        <Text style={styles.pet}>🐾 {booking.pet?.name ?? 'Animal'}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  loader: { marginTop: 40 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    gap: 14,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 3 },
  pet: { fontSize: 13, color: colors.textLight },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 84 },
})
