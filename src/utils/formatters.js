/**
 * Formatea un número como moneda CLP
 * Ej: 1500000 → "$1.500.000"
 * Usa regex en vez de Intl para garantizar formato consistente en
 * todos los sistemas operativos y dentro del worker de react-pdf.
 */
export function formatCLP(amount) {
  if (amount === null || amount === undefined) return '$0'
  const v = Math.round(Number(amount) || 0)
  return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Formatea un RUT chileno con puntos y guión
 * Ej: "123456785" → "12.345.678-5"
 */
export function formatRUT(rut) {
  if (!rut) return ''
  const clean = rut.replace(/[^0-9kK]/g, '')
  if (clean.length < 2) return clean

  const body = clean.slice(0, -1)
  const dv   = clean.slice(-1).toUpperCase()

  const formatted = body
    .split('')
    .reverse()
    .join('')
    .replace(/(\d{3})/g, '$1.')
    .split('')
    .reverse()
    .join('')
    .replace(/^\./, '')

  return `${formatted}-${dv}`
}

/**
 * Valida un RUT chileno (algoritmo módulo 11)
 */
export function validateRUT(rut) {
  if (!rut) return false
  const clean = rut.replace(/[^0-9kK]/g, '')
  if (clean.length < 2) return false

  const body = clean.slice(0, -1)
  const dv   = clean.slice(-1).toUpperCase()

  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = 11 - (sum % 11)
  const expected =
    remainder === 11 ? '0' :
    remainder === 10 ? 'K' :
    String(remainder)

  return dv === expected
}

/**
 * Formatea fecha a formato chileno
 * Ej: "2024-03-15" → "15/03/2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CL').format(date)
}

/**
 * Número de cotización con padding de ceros
 * Ej: 5 → "COT-0005"
 */
export function formatQuoteNumber(num) {
  return `COT-${String(num).padStart(4, '0')}`
}
