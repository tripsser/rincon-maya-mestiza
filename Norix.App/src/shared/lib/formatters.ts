export function formatDate(value: string | null) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
