'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  imageUrl?: string
  sku?: string
}

interface Variant {
  id: string
  name: string
  price: number
  stock: number
  options: string
}

interface AddToCartButtonProps {
  product: Product
  variants?: Variant[]
  tenantColor: string
}

export function AddToCartButton({ product, variants, tenantColor }: AddToCartButtonProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    variants?.[0]?.id
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  async function handleAddToCart() {
    setIsAdding(true)

    const variant = variants?.find(v => v.id === selectedVariant)
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          item: {
            productId: product.id,
            variantId: selectedVariant,
            name: product.name + (variant ? ` - ${variant.name}` : ''),
            price: variant?.price || product.price,
            quantity,
            imageUrl: product.imageUrl,
            sku: product.sku,
          },
        }),
      })

      if (response.ok) {
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }
    } finally {
      setIsAdding(false)
    }
  }

  function goToCart() {
    router.push('/cart')
  }

  return (
    <div className="space-y-4">
      {/* Variant Selection */}
      {variants && variants.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">
            Beden Seçin
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                disabled={variant.stock === 0}
                className={`
                  px-4 py-2 border rounded-lg font-medium transition-all
                  ${selectedVariant === variant.id 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed line-through' : ''}
                `}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Adet
        </label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isAdding}
          style={{ 
            backgroundColor: added ? '#10b981' : tenantColor,
            color: '#ffffff'
          }}
        >
          {added ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Sepete Eklendi
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Sepete Ekle
            </>
          )}
        </Button>

        {added && (
          <Button
            size="lg"
            variant="outline"
            onClick={goToCart}
          >
            Sepete Git
          </Button>
        )}
      </div>
    </div>
  )
}
