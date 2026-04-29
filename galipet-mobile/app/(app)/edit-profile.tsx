import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { useAuthStore } from '../../src/store/authStore'
import { profilesService } from '../../src/services/profilesService'

export default function EditProfileScreen() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isPro = user?.role === 'professional' || user?.role === 'both'

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    bio: user?.bio ?? '',
    price_per_day: user?.price_per_day != null ? String(user.price_per_day) : '',
  })

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      Alert.alert('Nom requis', 'Le nom ne peut pas être vide.')
      return
    }
    setIsSubmitting(true)
    try {
      const priceNum = form.price_per_day.trim() ? Number(form.price_per_day.trim()) : undefined
      const updated = await profilesService.updateMyProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        bio: form.bio.trim() || undefined,
        price_per_day: isPro && priceNum != null && !isNaN(priceNum) ? priceNum : undefined,
      })
      await updateUser(updated as typeof user & typeof updated)
      Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>Modifier mon profil</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            value={form.full_name}
            onChangeText={(v) => setForm((f) => ({ ...f, full_name: v }))}
            placeholder="Votre nom"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
            placeholder="0612345678"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ville</Text>
          <TextInput
            style={styles.input}
            value={form.city}
            onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
            placeholder="Casablanca, Rabat..."
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={form.bio}
            onChangeText={(v) => setForm((f) => ({ ...f, bio: v }))}
            placeholder="Parlez de vous..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {isPro && (
          <View style={styles.section}>
            <Text style={styles.label}>Tarif journalier (MAD)</Text>
            <TextInput
              style={styles.input}
              value={form.price_per_day}
              onChangeText={(v) => setForm((f) => ({ ...f, price_per_day: v }))}
              placeholder="Ex: 150"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </View>
        )}

        <Pressable
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.saveBtnText}>Enregistrer</Text>
          }
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { padding: 20, gap: 16 },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  label: { fontSize: 13, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputMulti: { minHeight: 100 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
})
