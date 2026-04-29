import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { Button } from '../../src/components/Button'
import { Input } from '../../src/components/Input'
import { useAuth } from '../../src/hooks/useAuth'
import type { UserRole } from '../../src/types'

const ROLES: { value: UserRole; label: string; emoji: string }[] = [
  { value: 'owner', label: 'Propriétaire', emoji: '🐾' },
  { value: 'professional', label: 'Professionnel', emoji: '✂️' },
]

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('owner')
  const { register, isLoading, error } = useAuth()
  const router = useRouter()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>Gali'Pet</Text>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez la communauté des amoureux des animaux.
          </Text>
        </View>

        <Input
          label="Nom complet"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Prénom Nom"
          autoCapitalize="words"
          autoComplete="name"
        />

        <Input
          label="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="votre@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {/* Sélection du rôle */}
        <Text style={styles.roleLabel}>Je suis :</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
              onPress={() => setRole(r.value)}
            >
              <Text style={styles.roleEmoji}>{r.emoji}</Text>
              <Text style={[styles.roleText, role === r.value && styles.roleTextActive]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Créer mon compte"
          onPress={() => register({ full_name: fullName, email, password, role })}
          isLoading={isLoading}
        />

        <Pressable style={styles.link} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.linkText}>
            Déjà un compte ?{' '}
            <Text style={styles.linkBold}>Se connecter</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, paddingTop: 48 },
  header: { marginBottom: 32, alignItems: 'center' },
  brand: { fontSize: 38, fontWeight: '800', color: colors.primary, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textLight, textAlign: 'center' },
  roleLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: {
    flex: 1,
    height: 72,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  roleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF3EF',
  },
  roleEmoji: { fontSize: 22 },
  roleText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  roleTextActive: { color: colors.primary },
  error: { color: colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: colors.textLight },
  linkBold: { color: colors.primary, fontWeight: '700' },
})
