import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'

interface Props {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  isLoading?: boolean
  disabled?: boolean
}

export function Button({ title, onPress, variant = 'primary', isLoading, disabled }: Props) {
  const containerStyle =
    variant === 'primary' ? styles.primary
    : variant === 'secondary' ? styles.secondary
    : styles.outline

  const labelStyle =
    variant === 'outline' ? styles.outlineText : styles.solidText

  return (
    <TouchableOpacity
      style={[styles.base, containerStyle, (disabled || isLoading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.label, labelStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '600' },
  solidText: { color: colors.white },
  outlineText: { color: colors.primary },
})
