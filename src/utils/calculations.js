const IVA_RATE = 0.19

/**
 * Calcula el subtotal de un ítem
 */
export function calcItemSubtotal(quantity, unitPrice) {
  const qty   = parseFloat(quantity) || 0
  const price = parseFloat(unitPrice) || 0
  return qty * price
}

/**
 * Calcula los totales de una cotización a partir de sus ítems
 * @param {Array} items - [{quantity, unit_price, ...}]
 * @returns {{ subtotal, iva_amount, total }}
 */
export function calcQuoteTotals(items = []) {
  const subtotal = items.reduce((acc, item) => {
    return acc + calcItemSubtotal(item.quantity, item.unit_price)
  }, 0)

  const iva_amount = Math.round(subtotal * IVA_RATE)
  const total      = subtotal + iva_amount

  return { subtotal, iva_amount, total }
}

/**
 * Devuelve la fecha de vencimiento sumando validity_days a hoy
 */
export function calcExpiryDate(validityDays) {
  const date = new Date()
  date.setDate(date.getDate() + (parseInt(validityDays) || 30))
  return date.toISOString().split('T')[0]
}
