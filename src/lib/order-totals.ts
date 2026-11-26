export type OrderLineInput = {
  price: number
  quantity: number
}

export type OrderTotals = {
  subtotal: number
  discountAmount: number
  shippingCost: number
  taxAmount: number
  total: number
}

/**
 * Canonical order money math:
 * subtotal = Σ(price × qty)
 * tax on (subtotal − discount)
 * total = subtotal − discount + shipping + tax
 */
export function computeOrderTotals(
  items: OrderLineInput[],
  options?: {
    discountAmount?: number
    shippingCost?: number
    freeShippingThreshold?: number
    defaultShippingCost?: number
    taxRate?: number
  }
): OrderTotals {
  const subtotal = round2(
    items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
  )
  const discountAmount = round2(Math.min(options?.discountAmount ?? 0, subtotal))
  const taxable = round2(Math.max(0, subtotal - discountAmount))
  const threshold = options?.freeShippingThreshold ?? 500
  const defaultShip = options?.defaultShippingCost ?? 29.9
  const shippingCost = round2(
    options?.shippingCost !== undefined
      ? options.shippingCost
      : taxable >= threshold
        ? 0
        : defaultShip
  )
  const taxRate = options?.taxRate ?? 0.2
  const taxAmount = round2(taxable * taxRate)
  const total = round2(taxable + shippingCost + taxAmount)
  return { subtotal, discountAmount, shippingCost, taxAmount, total }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
