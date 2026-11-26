import { getTenantContext } from '@/lib/tenant'
import { getCart } from '@/lib/cart'
import { redirect } from 'next/navigation'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const tenant = await getTenantContext()
  const cart = await getCart()

  if (!tenant) {
    return <div>Mağaza bulunamadı</div>
  }

  if (cart.items.length === 0) {
    redirect('/cart')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ödeme</h1>
      <CheckoutForm tenant={tenant} cart={cart} />
    </div>
  )
}
