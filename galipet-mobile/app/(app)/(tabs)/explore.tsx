import { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { useProfiles } from '../../../src/hooks/useProfiles'
import { Avatar } from '../../../src/components/Avatar'
import type { Profile } from '../../../src/types'

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  garde: 'Garderie',
  veterinaire: 'Vétérinaire',
  promenade: 'Promenade',
  dressage: 'Dressage',
}

export default function ExploreScreen() {
  const router = useRouter()
  const { service: serviceParam } = useLocalSearchParams<{ service?: string }>()

  const [searchText, setSearchText] = useState('')
  const [activeService, setActiveService] = useState<string | undefined>(
    serviceParam || undefined
  )
  const { profiles, isLoading, search, fetch } = useProfiles()

  // Sync local filter when arriving from home with a service param
  useEffect(() => {
    const next = serviceParam || undefined
    setActiveService(next)
    setSearchText('')
    fetch({ service: next })
  }, [serviceParam])

  const handleSearch = (text: string) => {
    setSearchText(text)
    search({ city: text || undefined, service: activeService })
  }

  const clearFilter = () => {
    setActiveService(undefined)
    setSearchText('')
    fetch({})
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Explorer</Text>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Rechercher par ville..."
          placeholderTextColor={colors.textLight}
          returnKeyType="search"
        />
      </View>

      {activeService ? (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>{SERVICE_LABELS[activeService] ?? activeService}</Text>
          <Pressable onPress={clearFilter} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : profiles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Aucun professionnel trouvé</Text>
          <Text style={styles.emptyText}>Essayez de modifier votre recherche.</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProfessionalCard
              profile={item}
              onPress={() => router.push(`/(app)/pro/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  )
}

function ProfessionalCard({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: colors.border }}>
      <Avatar uri={profile.avatar_url} name={profile.full_name} size={52} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{profile.full_name}</Text>
        {profile.city ? <Text style={styles.cardCity}>{profile.city}</Text> : null}
        <View style={styles.cardMeta}>
          {profile.rating_avg != null && profile.rating_avg > 0 ? (
            <Text style={styles.cardRating}>★ {profile.rating_avg.toFixed(1)}</Text>
          ) : null}
          {profile.price_per_day != null ? (
            <Text style={styles.cardPrice}>{profile.price_per_day} MAD/j</Text>
          ) : null}
        </View>
      </View>
      {profile.is_verified ? <Text style={styles.verifiedBadge}>✅</Text> : null}
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
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },
  searchInput: { fontSize: 15, color: colors.text },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.primary,
    borderRadius: 20,
    gap: 8,
  },
  activeFilterText: { fontSize: 13, fontWeight: '700', color: colors.white },
  clearBtn: { padding: 2 },
  clearText: { fontSize: 12, color: colors.white, fontWeight: '700' },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 14,
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: colors.text },
  cardCity: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  cardRating: { fontSize: 13, color: colors.warning },
  cardPrice: { fontSize: 13, fontWeight: '700', color: colors.success },
  verifiedBadge: { fontSize: 18 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
})
