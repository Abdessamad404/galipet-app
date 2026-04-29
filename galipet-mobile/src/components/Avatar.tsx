import { View, Image, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'

interface Props {
  uri?: string
  name: string
  size?: number
}

export function Avatar({ uri, name, size = 48 }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    )
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.border },
  fallback: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { color: colors.white, fontWeight: '700' },
})
