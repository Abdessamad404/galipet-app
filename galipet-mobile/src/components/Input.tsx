import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native'
import { colors } from '../constants/colors'

interface Props extends TextInputProps {
  label: string
  error?: string
}

export function Input({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.textLight}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputError: { borderColor: colors.error },
  error: { fontSize: 12, color: colors.error, marginTop: 4 },
})
