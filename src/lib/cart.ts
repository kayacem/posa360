// Cart management utilities
import { cookies } from 'next/headers'

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  sku?: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  total: number
}

const CART_COOKIE_NAME = 'cart_items'

export async function getCart(): Promise<Cart> {
  const cookieStore = await cookies()
  const cartData = cookieStore.get(CART_COOKIE_NAME)
  
  if (!cartData) {
    return { items: [], subtotal: 0, total: 0 }
  }

  try {
    const items: CartItem[] = JSON.parse(cartData.value)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return { items, subtotal, total: subtotal }
  } catch {
    return { items: [], subtotal: 0, total: 0 }
  }
}

export async function addToCart(item: CartItem): Promise<Cart> {
  const cart = await getCart()
  
  const existingIndex = cart.items.findIndex(
    i => i.productId === item.productId && i.variantId === item.variantId
  )

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += item.quantity
  } else {
    cart.items.push(item)
  }

  await saveCart(cart.items)
  return getCart()
}

export async function updateCartItem(productId: string, variantId: string | undefined, quantity: number): Promise<Cart> {
  const cart = await getCart()
  
  const index = cart.items.findIndex(
    i => i.productId === productId && i.variantId === variantId
  )

  if (index >= 0) {
    if (quantity <= 0) {
      cart.items.splice(index, 1)
    } else {
      cart.items[index].quantity = quantity
    }
  }

  await saveCart(cart.items)
  return getCart()
}

export async function removeFromCart(productId: string, variantId?: string): Promise<Cart> {
  const cart = await getCart()
  cart.items = cart.items.filter(
    i => !(i.productId === productId && i.variantId === variantId)
  )
  await saveCart(cart.items)
  return getCart()
}

export async function clearCart(): Promise<void> {
  await saveCart([])
}

async function saveCart(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(items), {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}
