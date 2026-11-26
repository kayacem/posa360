'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Trash2, Minus, Plus } from 'lucide-react'
import type { CartItem } from '@/lib/cart'

export function CartItemRow({ item }: { item: CartItem }) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)

  async function updateQuantity(newQuantity: number) {
    if (newQuantity < 1) return
    
    setIsUpdating(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          productId: item.productId,
          variantId: item.variantId,
          quantity: newQuantity,
        }),
      })

      if (response.ok) {
        setQuantity(newQuantity)
        window.location.reload() // Refresh to update totals
      }
    } finally {
      setIsUpdating(false)
    }
  }

  async function removeItem() {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          productId: item.productId,
          variantId: item.variantId,
        }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex gap-4 pb-4 border-b">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
      )}
      
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{item.name}</h3>
        {item.sku && (
          <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={removeItem}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-lg">{formatCurrency(item.price * quantity)}</p>
        {quantity > 1 && (
          <p className="text-sm text-gray-500">
            {formatCurrency(item.price)} x {quantity}
          </p>
        )}
      </div>
    </div>
  )
}
