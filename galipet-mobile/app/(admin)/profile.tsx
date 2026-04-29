import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/colors'
import { Avatar } from '../../src/components/Avatar'
import { Button } from '../../src/components/Button'
import { useAuthStore } from '../../src/store/authStore'
import { useAuth } from '../../src/hooks/useAuth'

export default function AdminProfileScreen() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar uri={user?.avatar_url} name={user?.full_name ?? '?'} size={80} />
          <Text style={styles.name}>{user?.full_name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Administrateur</Text>
          </View>
        </View>

        {(user?.phone || user?.city) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            {user.phone ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            ) : null}
            {user.city ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ville</Text>
                <Text style={styles.infoValue}>{user.city}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.section}>
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
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#FFF3EF',
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  section: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: colors.textLight },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
})
