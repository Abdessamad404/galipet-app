import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { Avatar } from '../../../src/components/Avatar'
import { useAuthStore } from '../../../src/store/authStore'
import { useProfiles } from '../../../src/hooks/useProfiles'
import type { Profile } from '../../../src/types'

const CATEGORIES = [
  { id: 'toilettage', label: 'Toilettage', emoji: '✂️' },
  { id: 'garde', label: 'Garderie', emoji: '🏠' },
  { id: 'veterinaire', label: 'Vétérinaire', emoji: '🩺' },
  { id: 'promenade', label: 'Promenade', emoji: '🦮' },
  { id: 'dressage', label: 'Dressage', emoji: '🎓' },
]

export default function HomeScreen() {
  const { user } = useAuthStore()
  const router = useRouter()
  const firstName = user?.full_name?.split(' ')[0] ?? 'vous'
  const { profiles: topPros, isLoading: loadingPros } = useProfiles({ limit: 5 })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Que cherchez-vous aujourd'hui ?</Text>
          </View>
          <Pressable onPress={() => router.push('/(app)/profile')}>
            <Avatar uri={user?.avatar_url} name={user?.full_name ?? '?'} size={44} />
          </Pressable>
        </View>

        {/* Barre de recherche — redirige vers Explorer */}
        <Pressable style={styles.searchBar} onPress={() => router.push('/(app)/explore')}>
          <Text style={styles.searchText}>🔍  Rechercher un professionnel...</Text>
        </Pressable>

        {/* Nos services */}
        <Text style={styles.sectionTitle}>Nos services</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push({ pathname: '/(app)/explore', params: { service: cat.id } })}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Professionnels populaires */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Professionnels populaires</Text>
          <Pressable onPress={() => router.push('/(app)/explore')}>
            <Text style={styles.seeAll}>Voir tous →</Text>
          </Pressable>
        </View>

        {loadingPros ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : topPros.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Explorez les professionnels près de vous.</Text>
          </View>
        ) : (
          <FlatList
            data={topPros}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.proList}
            renderItem={({ item }) => (
              <ProCard profile={item} onPress={() => router.push(`/(app)/pro/${item.id}`)} />
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ProCard({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  return (
    <Pressable style={styles.proCard} onPress={onPress} android_ripple={{ color: colors.border }}>
      <Avatar uri={profile.avatar_url} name={profile.full_name} size={44} />
      <View style={styles.proInfo}>
        <Text style={styles.proName}>{profile.full_name}</Text>
        {profile.city ? <Text style={styles.proCity}>{profile.city}</Text> : null}
      </View>
      {profile.rating_avg != null && profile.rating_avg > 0 ? (
        <Text style={styles.proRating}>★ {profile.rating_avg.toFixed(1)}</Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  subGreeting: { fontSize: 14, color: colors.textLight, marginTop: 2 },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 24,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  searchText: { fontSize: 14, color: colors.textLight },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 13, fontWeight: '700', color: colors.primary },
  categoriesRow: { paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  categoryCard: {
    width: 90,
    height: 90,
    backgroundColor: colors.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: colors.text },
  loader: { marginVertical: 20 },
  proList: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  proInfo: { flex: 1 },
  proName: { fontSize: 14, fontWeight: '600', color: colors.text },
  proCity: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  proRating: { fontSize: 13, color: colors.warning, fontWeight: '700' },
  emptyCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
})
