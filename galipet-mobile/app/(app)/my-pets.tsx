import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { usePets } from '../../src/hooks/usePets'
import { petsService, CreatePetPayload } from '../../src/services/petsService'

const SPECIES_OPTIONS = [
  { label: 'Chien 🐶', value: 'dog' },
  { label: 'Chat 🐱', value: 'cat' },
  { label: 'Autre', value: 'other' },
]

const SPECIES_LABEL: Record<string, string> = { dog: 'Chien', cat: 'Chat', other: 'Autre' }

export default function MyPetsScreen() {
  const router = useRouter()
  const { pets, isLoading, refresh } = usePets()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<CreatePetPayload>({ name: '', species: 'dog' })

  const handleAdd = async () => {
    if (!form.name.trim()) {
      Alert.alert('Nom requis', 'Veuillez saisir le nom de votre animal.')
      return
    }
    setIsSubmitting(true)
    try {
      await petsService.createPet({ ...form, name: form.name.trim() })
      setForm({ name: '', species: 'dog' })
      setShowForm(false)
      refresh()
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'animal.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer ${name} de votre profil ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await petsService.deletePet(id)
            refresh()
          } catch (e: unknown) {
            const msg = e && typeof e === 'object' && 'response' in e
              ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
              : undefined
            Alert.alert('Impossible de supprimer', msg ?? 'Une erreur est survenue.')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>Mes animaux</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.addBtn}>{showForm ? 'Annuler' : '+ Ajouter'}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Nouvel animal</Text>

            <TextInput
              style={styles.input}
              placeholder="Nom *"
              placeholderTextColor={colors.textLight}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            />

            <View style={styles.speciesRow}>
              {SPECIES_OPTIONS.map((s) => (
                <Pressable
                  key={s.value}
                  style={[styles.speciesBtn, form.species === s.value && styles.speciesBtnActive]}
                  onPress={() => setForm((f) => ({ ...f, species: s.value }))}
                >
                  <Text style={[styles.speciesBtnText, form.species === s.value && styles.speciesBtnTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Race (optionnel)"
              placeholderTextColor={colors.textLight}
              value={form.breed ?? ''}
              onChangeText={(v) => setForm((f) => ({ ...f, breed: v || undefined }))}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Âge (ans)"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={form.age != null ? String(form.age) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, age: v ? parseInt(v) : undefined }))}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Poids (kg)"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={form.weight != null ? String(form.weight) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, weight: v ? parseFloat(v) : undefined }))}
              />
            </View>

            <Pressable
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleAdd}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.submitBtnText}>Ajouter</Text>
              }
            </Pressable>
          </View>
        )}

        {isLoading && pets.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : pets.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>Aucun animal enregistré.</Text>
          </View>
        ) : (
          pets.map((pet) => (
            <View key={pet.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petMeta}>
                  {SPECIES_LABEL[pet.species] ?? pet.species}
                  {pet.breed ? ` · ${pet.breed}` : ''}
                  {pet.age != null ? ` · ${pet.age} ans` : ''}
                </Text>
              </View>
              <Pressable onPress={() => handleDelete(pet.id, pet.name)}>
                <Text style={styles.deleteBtn}>🗑</Text>
              </Pressable>
            </View>
          ))
        )}
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
  addBtn: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  content: { padding: 20, gap: 12 },
  form: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  row: { flexDirection: 'row', gap: 10 },
  inputHalf: { flex: 1 },
  speciesRow: { flexDirection: 'row', gap: 8 },
  speciesBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  speciesBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
  speciesBtnText: { fontSize: 13, color: colors.textLight, fontWeight: '600' },
  speciesBtnTextActive: { color: colors.primary },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: { gap: 4 },
  petName: { fontSize: 15, fontWeight: '700', color: colors.text },
  petMeta: { fontSize: 13, color: colors.textLight },
  deleteBtn: { fontSize: 20, padding: 4 },
  empty: { alignItems: 'center', gap: 10, paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: colors.textLight },
})
