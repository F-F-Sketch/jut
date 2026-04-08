const WOMPI_BASE = process.env.WOMPI_ENV === 'production'
  ? 'https://production.wompi.co/v1'
  : 'https://sandbox.wompi.co/v1'

export const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? ''
export const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY ?? ''
export const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET ?? ''

export interface WompiTransaction {
  id: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'
  amount_in_cents: number
  currency: string
  reference: string
  customer_email: string
}

export async function getMerchantAcceptanceToken(): Promise<string> {
  const res = await fetch(`${WOMPI_BASE}/merchants/${WOMPI_PUBLIC_KEY}`)
  const data = await res.json()
  return data?.data?.presigned_acceptance?.acceptance_token ?? ''
}

export async function getTransaction(txnId: string): Promise<WompiTransaction | null> {
  const res = await fetch(`${WOMPI_BASE}/transactions/${txnId}`, {
    headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.data ?? null
}

export function generateReference(userId: string, plan: string): string {
  const ts = Date.now()
  return `JUT-${plan.toUpperCase()}-${userId.slice(0, 8)}-${ts}`
}

export function buildCheckoutUrl({
  publicKey,
  amountInCents,
  currency = 'COP',
  reference,
  redirectUrl,
  customerEmail,
}: {
  publicKey: string
  amountInCents: number
  currency?: string
  reference: string
  redirectUrl: string
  customerEmail: string
}): string {
  const base = 'https://checkout.wompi.co/p/'
  const params = new URLSearchParams({
    'public-key': publicKey,
    'currency': currency,
    'amount-in-cents': String(amountInCents),
    'reference': reference,
    'redirect-url': redirectUrl,
    'customer-data:email': customerEmail,
  })
  return `${base}?${params.toString()}`
}

export async function verifyWompiSignature(
  properties: string[],
  checksum: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const data = encoder.encode(properties.join('') + secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex === checksum
}
