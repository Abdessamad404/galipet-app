import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  type ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { useMessages } from '../../src/hooks/useMessages'
import { useAuthStore } from '../../src/store/authStore'
import { bookingsService } from '../../src/services/bookingsService'
import type { Message } from '../../src/types'

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { messages, isLoading, sendMessage, deleteMessage } = useMessages(id)
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const [receiverId, setReceiverId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('Conversation')
  const listRef = useRef<FlatList<Message>>(null)

  useEffect(() => {
    if (!id || !user?.id) return
    bookingsService.getBooking(id)
      .then((booking) => {
        const isOwner = booking.owner_id === user?.id
        setReceiverId(isOwner ? booking.professional_id : booking.owner_id)
        const other = isOwner ? booking.professional : booking.owner
        if (other?.full_name) setOtherName(other.full_name)
      })
      .catch(() => {})
  }, [id, user?.id])

  const handleSend = async () => {
    if (!text.trim() || !receiverId) return
    const content = text.trim()
    setText('')
    await sendMessage(receiverId, content)
    listRef.current?.scrollToEnd({ animated: true })
  }

  const handleLongPress = (item: Message) => {
    if (item.sender_id !== user?.id) return
    Alert.alert('Supprimer ce message', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteMessage(item.id) },
    ])
  }

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isMine = item.sender_id === user?.id
    return (
      <Pressable
        onLongPress={() => handleLongPress(item)}
        delayLongPress={400}
        style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}
      >
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
          {item.content}
        </Text>
        <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
          {new Date(item.sent_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Pressable>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerName} numberOfLines={1}>{otherName}</Text>
        <View style={styles.backBtn} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={renderMessage}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            isLoading ? null : (
              <Text style={styles.emptyText}>Commencez la conversation !</Text>
            )
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Votre message..."
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[styles.sendBtn, (!text.trim() || !receiverId) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || !receiverId}
          >
            <Text style={styles.sendBtnText}>Envoyer</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, alignItems: 'center' },
  backText: { fontSize: 24, color: colors.primary, fontWeight: '300' },
  headerName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  flex: { flex: 1 },
  list: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 20 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: { fontSize: 11, color: colors.textLight, alignSelf: 'flex-end' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
    marginTop: 60,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 18,
    backgroundColor: colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
})
