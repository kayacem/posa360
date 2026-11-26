import { NextResponse } from 'next/server'

export async function GET() {
  const csvContent = `name,sku,price,stock,description,categorySlug,brandSlug,imageUrl
"Örnek Ürün 1","SKU001",99.90,50,"Bu bir örnek ürün açıklamasıdır","t-shirt","fashion-line","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
"Örnek Ürün 2","SKU002",149.90,30,"İkinci örnek ürün","pantolon","fashion-line","https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"
"Örnek Ürün 3","SKU003",199.90,20,"Üçüncü örnek ürün",,,"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500"`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="urun-sablonu.csv"',
    },
  })
}
