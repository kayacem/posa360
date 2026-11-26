/** Canonical JSON snapshot shape stored on Order.shippingAddress / billingAddress */
export type OrderAddress = {
  firstName?: string
  lastName?: string
  fullName?: string
  line1?: string
  line2?: string
  district?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
}

/** Normalize legacy seed keys (addressLine1, ilce, il) and canonical keys. */
export function parseOrderAddress(raw: string | null | undefined): OrderAddress | null {
  if (!raw) return null
  try {
    const a = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!a || typeof a !== 'object') return null
    const firstName = a.firstName || undefined
    const lastName = a.lastName || undefined
    const fullName =
      a.fullName ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      undefined
    return {
      firstName,
      lastName,
      fullName,
      line1: a.line1 || a.addressLine1 || undefined,
      line2: a.line2 || a.addressLine2 || undefined,
      district: a.district || a.ilce || undefined,
      city: a.city || a.il || undefined,
      postalCode: a.postalCode || undefined,
      country: a.country || undefined,
      phone: a.phone || undefined,
    }
  } catch {
    return null
  }
}

export function buildOrderAddressSnapshot(input: {
  firstName: string
  lastName: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  line1?: string
  line2?: string
  il?: string
  ilce?: string
  city?: string
  district?: string
  postalCode?: string
  country?: string
}): string {
  const line1 = input.line1 || input.addressLine1 || ''
  const line2 = input.line2 || input.addressLine2 || ''
  const city = input.city || input.il || ''
  const district = input.district || input.ilce || ''
  return JSON.stringify({
    firstName: input.firstName,
    lastName: input.lastName,
    fullName: `${input.firstName} ${input.lastName}`.trim(),
    line1,
    line2: line2 || undefined,
    district,
    city,
    postalCode: input.postalCode || '',
    country: input.country || 'Türkiye',
    phone: input.phone || undefined,
  } satisfies OrderAddress)
}
