import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { Avatar } from '../../../src/components/Avatar'
import { Button } from '../../../src/components/Button'
import { useAuthStore } from '../../../src/store/authStore'
import { useAuth } from '../../../src/hooks/useAuth'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  professional: 'Professionnel',
  both: 'Propriétaire & Professionnel',
  admin: 'Administrateur',
}

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage ✂️',
  garde: 'Garderie 🏠',
  garderie: 'Garderie 🏠',
  veterinaire: 'Vétérinaire 🩺',
  promenade: 'Promenade 🦮',
  dressage: 'Dressage 🎓',
}

export default function ProfileScreen() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const router = useRouter()

  const isPro = user?.role === 'professional' || user?.role === 'both'
  const isOwner = user?.role === 'owner' || user?.role === 'both'

  const stars = user?.rating_avg != null && user.rating_avg > 0
    ? '★'.repeat(Math.round(user.rating_avg)) + '☆'.repeat(5 - Math.round(user.rating_avg))
    : null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* En-tête */}
        <View style={styles.header}>
          <Avatar uri={user?.avatar_url} name={user?.full_name ?? '?'} size={88} />
          <Text style={styles.name}>{user?.full_name}</Text>
          <View style={styles.headerBadges}>
            {user?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{ROLE_LABELS[user.role]}</Text>
              </View>
            )}
            {user?.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✅ Vérifié</Text>
              </View>
            )}
            {isPro && user?.accepts_insurance && (
              <View style={styles.insuranceBadge}>
                <Text style={styles.insuranceText}>🛡️ Assurance</Text>
              </View>
            )}
          </View>
        </View>

        {/* Évaluation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Évaluation</Text>
          {stars ? (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>{stars}</Text>
              <Text style={styles.ratingValue}>{user!.rating_avg!.toFixed(1)} / 5</Text>
            </View>
          ) : (
            <Text style={styles.emptyValue}>Pas encore évalué</Text>
          )}
        </View>

        {/* Informations de contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          {user?.email ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          ) : null}
          {user?.phone ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          ) : null}
          {user?.city ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ville</Text>
              <Text style={styles.infoValue}>{user.city}</Text>
            </View>
          ) : null}
          {user?.location_text ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{user.location_text}</Text>
            </View>
          ) : null}
          {!user?.email && !user?.phone && !user?.city && !user?.location_text && (
            <Text style={styles.emptyValue}>Aucune information renseignée</Text>
          )}
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          {user?.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : (
            <Pressable onPress={() => router.push('/(app)/edit-profile')}>
              <Text style={styles.emptyLink}>Ajouter une description →</Text>
            </Pressable>
          )}
        </View>

        {/* Services (professionnels) */}
        {isPro && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services proposés</Text>
            {user?.services && user.services.length > 0 ? (
              <View style={styles.chips}>
                {user.services.map((s) => (
                  <View key={s} style={styles.chip}>
                    <Text style={styles.chipText}>{SERVICE_LABELS[s] ?? s}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyValue}>Aucun service configuré</Text>
            )}
          </View>
        )}

        {/* Animaux (owners) */}
        {isOwner && (
          <View style={styles.section}>
            <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/my-pets')}>
              <Text style={styles.linkRowText}>🐾 Mes animaux</Text>
              <Text style={styles.linkRowArrow}>›</Text>
            </Pressable>
          </View>
        )}

        {/* Modifier le profil */}
        <View style={styles.section}>
          <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/edit-profile')}>
            <Text style={styles.linkRowText}>✏️ Modifier mon profil</Text>
            <Text style={styles.linkRowArrow}>›</Text>
          </Pressable>
        </View>

        {/* Panneau admin */}
        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push('/admin/insurance')}
              android_ripple={{ color: colors.border }}
            >
              <Text style={styles.linkRowText}>🛡️ Leads Assurance</Text>
              <Text style={styles.linkRowArrow}>›</Text>
            </Pressable>
          </View>
        )}

        {/* Déconnexion */}
        <View style={[styles.section, styles.lastSection]}>
          <Button title="Se déconnecter" onPress={signOut} variant="outline" />
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  headerBadges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFF3EF',
    borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  verifiedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F0FFF4',
    borderRadius: 20,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: colors.success },
  insuranceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  insuranceText: { fontSize: 12, fontWeight: '600', color: colors.info },
  section: {
    backgroundColor: colors.white,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  lastSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: colors.textLight },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  bio: { fontSize: 14, color: colors.text, lineHeight: 22 },
  emptyValue: { fontSize: 14, color: colors.textLight, fontStyle: 'italic' },
  emptyLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingStars: { fontSize: 18, color: colors.warning, letterSpacing: 2 },
  ratingValue: { fontSize: 15, fontWeight: '700', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  linkRowText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  linkRowArrow: { fontSize: 20, color: colors.textLight },
})
