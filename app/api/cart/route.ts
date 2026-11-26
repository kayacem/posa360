import { NextRequest, NextResponse } from 'next/server'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, type CartItem } from '@/lib/cart'

export async function GET() {
  const cart = await getCart()
  return NextResponse.json(cart)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, item, productId, variantId, quantity } = body

  try {
    switch (action) {
      case 'add':
        const cart = await addToCart(item as CartItem)
        return NextResponse.json(cart)
      
      case 'update':
        const updatedCart = await updateCartItem(productId, variantId, quantity)
        return NextResponse.json(updatedCart)
      
      case 'remove':
        const newCart = await removeFromCart(productId, variantId)
        return NextResponse.json(newCart)
      
      case 'clear':
        await clearCart()
        return NextResponse.json({ items: [], subtotal: 0, total: 0 })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Cart operation failed' }, { status: 500 })
  }
}
