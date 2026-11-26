import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ProductRow {
  name: string
  sku: string
  price: string
  stock: string
  description?: string
  categorySlug?: string
  brandSlug?: string
  imageUrl?: string
}

function parseCSV(text: string): ProductRow[] {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  
  return lines.slice(1).map(line => {
    // Simple CSV parser (handles quoted fields)
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/^"|"$/g, '') || ''
    })
    
    return row
  })
}

function validateRow(row: ProductRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = []

  if (!row.name || row.name.trim() === '') {
    errors.push({ row: rowNumber, field: 'name', message: 'Ürün adı zorunludur' })
  }

  if (!row.sku || row.sku.trim() === '') {
    errors.push({ row: rowNumber, field: 'sku', message: 'SKU zorunludur' })
  }

  if (!row.price || isNaN(parseFloat(row.price))) {
    errors.push({ row: rowNumber, field: 'price', message: 'Geçerli bir fiyat giriniz' })
  } else if (parseFloat(row.price) < 0) {
    errors.push({ row: rowNumber, field: 'price', message: 'Fiyat negatif olamaz' })
  }

  if (!row.stock || isNaN(parseInt(row.stock))) {
    errors.push({ row: rowNumber, field: 'stock', message: 'Geçerli bir stok adedi giriniz' })
  } else if (parseInt(row.stock) < 0) {
    errors.push({ row: rowNumber, field: 'stock', message: 'Stok negatif olamaz' })
  }

  return errors
}

export async function POST(req: NextRequest) {
  try {
    const tenantContext = await getTenantContext()
    if (!tenantContext) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    const errors: ValidationError[] = []
    let imported = 0
    let failed = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // +2 because header is row 1 and array is 0-indexed

      const rowErrors = validateRow(row, rowNumber)
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
        failed++
        continue
      }

      try {
        // Check if SKU already exists
        const existing = await prisma.product.findFirst({
          where: {
            tenantId: tenantContext.id,
            sku: row.sku,
          },
        })

        if (existing) {
          errors.push({
            row: rowNumber,
            field: 'sku',
            message: `SKU "${row.sku}" zaten mevcut`,
          })
          failed++
          continue
        }

        // Find category if provided
        let categoryId: string | undefined
        if (row.categorySlug) {
          const category = await prisma.category.findFirst({
            where: {
              tenantId: tenantContext.id,
              slug: row.categorySlug,
            },
          })
          categoryId = category?.id
        }

        // Find brand if provided
        let brandId: string | undefined
        if (row.brandSlug) {
          const brand = await prisma.brand.findFirst({
            where: {
              tenantId: tenantContext.id,
              slug: row.brandSlug,
            },
          })
          brandId = brand?.id
        }

        // Create product
        const product = await prisma.product.create({
          data: {
            tenantId: tenantContext.id,
            name: row.name,
            slug: row.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            sku: row.sku,
            price: parseFloat(row.price),
            stock: parseInt(row.stock),
            description: row.description || '',
            trackInventory: true,
            hasVariants: false,
            isActive: true,
            taxable: true,
            brandId,
          },
        })

        // Link to category if found
        if (categoryId) {
          await prisma.productCategory.create({
            data: {
              productId: product.id,
              categoryId,
            },
          })
        }

        // Add image if provided
        if (row.imageUrl) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: row.imageUrl,
              altText: row.name,
              sortOrder: 0,
            },
          })
        }

        imported++
      } catch (err: any) {
        errors.push({
          row: rowNumber,
          field: 'general',
          message: err.message || 'Ürün oluşturulamadı',
        })
        failed++
      }
    }

    return NextResponse.json({
      success: failed === 0,
      imported,
      failed,
      errors,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'İçe aktarma başarısız' },
      { status: 500 }
    )
  }
}
