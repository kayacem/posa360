'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImage {
  url: string
  altText?: string
}

export function ProductImages({ images }: { images: ProductImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-6xl">📦</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
        <img
          src={images[selectedIndex].url}
          alt={images[selectedIndex].altText || 'Product'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${selectedIndex === index ? 'border-black' : 'border-gray-200 hover:border-gray-400'}
              `}
            >
              <img
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
