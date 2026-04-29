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

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuth()
  const router = useRouter()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>Gali'Pet</Text>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Bienvenue ! Connectez-vous pour continuer.
          </Text>
        </View>

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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Se connecter"
          onPress={() => login({ email, password })}
          isLoading={isLoading}
        />

        <Pressable style={styles.link} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>
            Pas encore de compte ?{' '}
            <Text style={styles.linkBold}>S'inscrire</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  brand: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textLight, textAlign: 'center' },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: colors.textLight },
  linkBold: { color: colors.primary, fontWeight: '700' },
})
