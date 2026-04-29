import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { usePets } from '../../../src/hooks/usePets'
import { bookingsService } from '../../../src/services/bookingsService'

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage ✂️',
  garde: 'Garderie 🏠',
  garderie: 'Garderie 🏠',
  veterinaire: 'Vétérinaire 🩺',
  promenade: 'Promenade 🦮',
  dressage: 'Dressage 🎓',
}

const SPECIES_LABEL: Record<string, string> = {
  dog: 'Chien',
  cat: 'Chat',
}

export default function BookScreen() {
  const router = useRouter()
  const { proId, slotId, slotDate, slotStart, slotEnd, proName, services: servicesParam, pricePerDay } =
    useLocalSearchParams<{
      proId: string
      slotId: string
      slotDate: string
      slotStart: string
      slotEnd: string
      proName: string
      services?: string
      pricePerDay?: string
    }>()

  const { pets, isLoading: loadingPets } = usePets()
  const [selectedPet, setSelectedPet] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formattedDate = slotDate
    ? new Date(slotDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const handleConfirm = async () => {
    if (!selectedPet) {
      Alert.alert('Animal manquant', 'Veuillez sélectionner un animal.')
      return
    }
    if (!selectedService) {
      Alert.alert('Service manquant', 'Veuillez sélectionner un service.')
      return
    }

    setIsSubmitting(true)
    try {
      await bookingsService.createBooking({
        professional_id: proId,
        pet_id: selectedPet,
        service_type: selectedService,
        slot_id: slotId,
        notes: notes.trim() || undefined,
      })
      Alert.alert(
        'Réservation envoyée',
        'Votre demande a été envoyée au professionnel. Vous serez notifié une fois confirmée.',
        [{ text: 'OK', onPress: () => router.replace('/(app)/bookings') }],
      )
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Erreur inconnue'
        : 'Erreur inconnue'
      Alert.alert('Erreur', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const serviceList: string[] = servicesParam ? servicesParam.split(',') : []

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Confirmer la réservation</Text>

        {/* Résumé du créneau */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créneau sélectionné</Text>
          <Text style={styles.proName}>{proName}</Text>
          <Text style={styles.slotDate} numberOfLines={1}>{formattedDate}</Text>
          <Text style={styles.slotTime}>{slotStart} – {slotEnd}</Text>
          {pricePerDay ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tarif journalier</Text>
              <Text style={styles.priceValue}>{pricePerDay} MAD</Text>
            </View>
          ) : null}
        </View>

        {/* Sélection du service */}
        {serviceList.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service *</Text>
            <View style={styles.optionList}>
              {serviceList.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.option, selectedService === s && styles.optionActive]}
                  onPress={() => setSelectedService(s)}
                >
                  <Text style={[styles.optionText, selectedService === s && styles.optionTextActive]}>
                    {SERVICE_LABELS[s] ?? s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Sélection de l'animal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animal *</Text>
          {loadingPets ? (
            <ActivityIndicator color={colors.primary} />
          ) : pets.length === 0 ? (
            <Text style={styles.emptyText}>Aucun animal enregistré sur votre compte.</Text>
          ) : (
            <View style={styles.optionList}>
              {pets.map((pet) => (
                <Pressable
                  key={pet.id}
                  style={[styles.option, selectedPet === pet.id && styles.optionActive]}
                  onPress={() => setSelectedPet(pet.id)}
                >
                  <Text style={[styles.optionText, selectedPet === pet.id && styles.optionTextActive]}>
                    {pet.name} — {SPECIES_LABEL[pet.species] ?? pet.species}
                    {pet.breed ? ` (${pet.breed})` : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Informations particulières sur votre animal..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Bouton confirmation */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.confirmText}>Envoyer la demande</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  proName: { fontSize: 17, fontWeight: '700', color: colors.text },
  slotDate: { fontSize: 15, color: colors.text, textTransform: 'capitalize' },
  slotTime: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceLabel: { fontSize: 14, color: colors.textLight },
  priceValue: { fontSize: 16, fontWeight: '700', color: colors.success },
  optionList: { gap: 8 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
  optionText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  optionTextActive: { color: colors.primary, fontWeight: '700' },
  emptyText: { fontSize: 14, color: colors.textLight },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: { paddingHorizontal: 20, paddingVertical: 24 },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText: { fontSize: 16, fontWeight: '700', color: colors.white },
})
