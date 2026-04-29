import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { Avatar } from '../../../src/components/Avatar'
import { profilesService } from '../../../src/services/profilesService'
import { useAvailability } from '../../../src/hooks/useAvailability'
import { useReviews } from '../../../src/hooks/useReviews'
import type { Profile, AvailabilitySlot } from '../../../src/types'

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  garde: 'Garderie',
  garderie: 'Garderie',
  veterinaire: 'Vétérinaire',
  promenade: 'Promenade',
  dressage: 'Dressage',
}

function formatSlotDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function ProDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { slots, isLoading: loadingSlots } = useAvailability(id)
  const { reviews, isLoading: loadingReviews, error: reviewsError } = useReviews(id)

  useEffect(() => {
    if (!id) return
    profilesService
      .getProfile(id)
      .then(setProfile)
      .catch(() => setError('Professionnel introuvable'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleBook = (slot: AvailabilitySlot) => {
    const services: string[] = (profile as unknown as { services?: string[] }).services ?? []
    router.push({
      pathname: `/(app)/book/${id}`,
      params: {
        slotId: slot.id,
        slotDate: slot.date,
        slotStart: slot.start_time,
        slotEnd: slot.end_time,
        proName: profile?.full_name ?? '',
        services: services.join(','),
        pricePerDay: profile?.price_per_day != null ? String(profile.price_per_day) : '',
      },
    })
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    )
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{error ?? 'Erreur inconnue'}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>← Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const services: string[] = (profile as unknown as { services?: string[] }).services ?? []

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <Avatar uri={profile.avatar_url} name={profile.full_name} size={80} />
          <Text style={styles.name}>{profile.full_name}</Text>
          <View style={styles.metaRow}>
            {profile.city ? <Text style={styles.city}>📍 {profile.city}</Text> : null}
            {profile.is_verified ? <Text style={styles.verified}>✅ Vérifié</Text> : null}
          </View>
          {profile.rating_avg != null && profile.rating_avg > 0 ? (
            <Text style={styles.rating}>★ {profile.rating_avg.toFixed(1)} / 5</Text>
          ) : null}
          {profile.price_per_day != null ? (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>À partir de {profile.price_per_day} MAD / jour</Text>
            </View>
          ) : null}
        </View>

        {/* Bio */}
        {profile.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* Services */}
        {services.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services proposés</Text>
            <View style={styles.chips}>
              {services.map((s) => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{SERVICE_LABELS[s] ?? s}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Créneaux disponibles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créneaux disponibles</Text>
          {loadingSlots ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />
          ) : slots.length === 0 ? (
            <Text style={styles.noSlots}>Aucun créneau disponible pour le moment.</Text>
          ) : (
            <View style={styles.slotList}>
              {slots.map((slot) => (
                <View key={slot.id} style={styles.slotRow}>
                  <View style={styles.slotInfo}>
                    <Text style={styles.slotDate}>{formatSlotDate(slot.date)}</Text>
                    <Text style={styles.slotTime}>{slot.start_time} – {slot.end_time}</Text>
                  </View>
                  <Pressable style={styles.bookBtn} onPress={() => handleBook(slot)}>
                    <Text style={styles.bookBtnText}>Réserver</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Avis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Avis {reviews.length > 0 ? `(${reviews.length})` : ''}
          </Text>
          {loadingReviews ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />
          ) : reviewsError ? (
            <Text style={styles.noSlots}>{reviewsError}</Text>
          ) : reviews.length === 0 ? (
            <Text style={styles.noSlots}>Aucun avis pour le moment.</Text>
          ) : (
            <View style={styles.reviewList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>
                      {review.reviewer?.full_name ?? 'Anonyme'}
                    </Text>
                    <Text style={styles.reviewStars}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </Text>
                  </View>
                  {review.booking?.service_type ? (
                    <Text style={styles.reviewService}>{review.booking.service_type}</Text>
                  ) : null}
                  {review.comment ? (
                    <Text style={styles.reviewComment}>"{review.comment}"</Text>
                  ) : null}
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { marginTop: 60 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  metaRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  city: { fontSize: 14, color: colors.textLight },
  verified: { fontSize: 13, color: colors.success },
  rating: { fontSize: 16, color: colors.warning, fontWeight: '700' },
  section: {
    backgroundColor: colors.white,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  bio: { fontSize: 14, color: colors.textLight, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  priceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.success + '18',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  priceText: { fontSize: 14, fontWeight: '700', color: colors.success },
  noSlots: { fontSize: 14, color: colors.textLight },
  slotList: { gap: 10 },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  slotInfo: { gap: 2 },
  slotDate: { fontSize: 14, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  slotTime: { fontSize: 13, color: colors.textLight },
  bookBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  reviewList: { gap: 12 },
  reviewCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: colors.text },
  reviewStars: { fontSize: 14, color: colors.warning, letterSpacing: 1 },
  reviewService: { fontSize: 12, color: colors.textLight, textTransform: 'capitalize' },
  reviewComment: { fontSize: 14, color: colors.text, lineHeight: 20, fontStyle: 'italic' },
  reviewDate: { fontSize: 12, color: colors.textLight },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 15, color: colors.error },
  backLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
})
