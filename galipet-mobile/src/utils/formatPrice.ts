// Prix en dirhams marocains
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-MA')} MAD`
}
