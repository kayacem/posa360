'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function TenantCreateForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    customDomain: '',
    companyName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    taxNumber: '',
    plan: 'professional',
    monthlyFee: '299',
    maxProducts: '500',
    maxOrders: '5000',
    maxStaff: '10',
  })

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name
    if (field === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/super-admin/tenants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const { tenantId } = await response.json()
        alert('Tenant başarıyla oluşturuldu!')
        router.push(`/super-admin/tenants/${tenantId}`)
      } else {
        alert('Tenant oluşturulamadı')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Temel Bilgiler</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Mağaza Adı *</label>
          <Input
            required
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Örn: Elektronik Dünyası"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Subdomain (Slug) *
          </label>
          <div className="flex items-center gap-2">
            <Input
              required
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              placeholder="elektronikdunya"
              pattern="[a-z0-9-]+"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">
              .posa360.com
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sadece küçük harf, rakam ve tire kullanabilirsiniz
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Özel Domain (Opsiyonel)
          </label>
          <Input
            value={formData.customDomain}
            onChange={(e) => updateField('customDomain', e.target.value)}
            placeholder="Örn: shopelektronik.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Müşterinin kendi domain'i (CNAME ile bağlanacak)
          </p>
        </div>
      </div>

      {/* Company Info */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">Firma Bilgileri (CRM)</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Firma Adı</label>
            <Input
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Yetkili Kişi</label>
            <Input
              value={formData.contactPerson}
              onChange={(e) => updateField('contactPerson', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">E-posta</label>
            <Input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <Input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vergi Numarası (VKN)</label>
          <Input
            value={formData.taxNumber}
            onChange={(e) => updateField('taxNumber', e.target.value)}
          />
        </div>
      </div>

      {/* Subscription */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">Subscription Bilgileri</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Plan</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={formData.plan}
            onChange={(e) => updateField('plan', e.target.value)}
          >
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Aylık Ücret (TRY)</label>
            <Input
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => updateField('monthlyFee', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Ürün</label>
            <Input
              type="number"
              value={formData.maxProducts}
              onChange={(e) => updateField('maxProducts', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Sipariş</label>
            <Input
              type="number"
              value={formData.maxOrders}
              onChange={(e) => updateField('maxOrders', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-semibold mb-2">Önizleme</p>
        <div className="space-y-1 text-sm">
          <p><strong>Subdomain:</strong> {formData.slug || '(boş)'}.posa360.com</p>
          {formData.customDomain && (
            <p><strong>Özel Domain:</strong> {formData.customDomain}</p>
          )}
          <p><strong>Admin Panel:</strong> admin.{formData.slug || '(boş)'}.posa360.com</p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Oluşturuluyor...' : 'Tenant Oluştur'}
        </Button>
      </div>
    </form>
  )
}
