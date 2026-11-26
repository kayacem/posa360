'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ProductEditForm({ product, categories, brands }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description || '',
    price: product.price.toString(),
    stock: product.stock.toString(),
    categoryId: product.categories[0]?.categoryId || categories[0]?.id || '',
    brandId: product.brandId || '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  })

  const [variants, setVariants] = useState(product.variants || [])
  const [images, setImages] = useState(product.images || [])
  const [newImageUrl, setNewImageUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/products/${product.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          variants,
          images,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ürün güncellenemedi')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  function addImage() {
    if (newImageUrl.trim()) {
      setImages([...images, { url: newImageUrl, sortOrder: images.length }])
      setNewImageUrl('')
    }
  }

  function removeImage(index: number) {
    setImages(images.filter((_: any, i: number) => i !== index))
  }

  function addVariant() {
    setVariants([
      ...variants,
      { name: '', sku: '', price: formData.price, stock: '0', isActive: true },
    ])
  }

  function updateVariant(index: number, field: string, value: any) {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_: any, i: number) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ürün Adı *</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Açıklama</label>
            <textarea
              className="w-full border rounded-md p-2 min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fiyat (₺)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stok</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Marka</label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              >
                <option value="">Marka yok</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="text-sm">Aktif</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <span className="text-sm">Öne Çıkan</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Görseller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {images.map((img: any, idx: number) => (
              <div key={idx} className="relative group">
                <img src={img.url} alt="" className="w-full h-32 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Görsel URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button type="button" onClick={addImage} variant="outline">
              Ekle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Varyantlar</CardTitle>
            <Button type="button" onClick={addVariant} size="sm">
              + Varyant Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant: any, idx: number) => (
            <div key={idx} className="p-4 border rounded space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Varyant adı (ör: Siyah-M)"
                  value={variant.name || ''}
                  onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                />
                <Input
                  placeholder="SKU"
                  value={variant.sku || ''}
                  onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Fiyat"
                  value={variant.price || ''}
                  onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Stok"
                  value={variant.stock || ''}
                  onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                />
              </div>
              <Button type="button" onClick={() => removeVariant(idx)} variant="destructive" size="sm">
                Sil
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Güncelle'}
        </Button>
      </div>
    </form>
  )
}
