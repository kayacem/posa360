import { getTenantContext } from '@/lib/tenant'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CSVImportForm } from '@/components/merchant/CSVImportForm'

export default async function ProductImportPage() {
  const tenantContext = await getTenantContext()
  
  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ürün İçe Aktarma (CSV)</h1>
        <p className="text-gray-500 mt-2">
          CSV dosyası ile toplu ürün ekleme veya güncelleme yapabilirsiniz.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CSV Şablonunu İndir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Önce şablon CSV dosyasını indirin, ürün bilgilerini doldurun ve yükleyin.
            </p>
            <a
              href="/api/products/sample-csv"
              download="urun-sablonu.csv"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              📥 Şablon CSV İndir
            </a>
            <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
              <strong>CSV Formatı:</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• <strong>name</strong>: Ürün adı (zorunlu)</li>
                <li>• <strong>sku</strong>: Stok kodu (zorunlu, benzersiz olmalı)</li>
                <li>• <strong>price</strong>: Fiyat (zorunlu, sayı)</li>
                <li>• <strong>stock</strong>: Stok adedi (zorunlu, sayı)</li>
                <li>• <strong>description</strong>: Açıklama (opsiyonel)</li>
                <li>• <strong>categorySlug</strong>: Kategori slug (opsiyonel)</li>
                <li>• <strong>brandSlug</strong>: Marka slug (opsiyonel)</li>
                <li>• <strong>imageUrl</strong>: Ürün görseli URL (opsiyonel)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Dosyası Yükle</CardTitle>
          </CardHeader>
          <CardContent>
            <CSVImportForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
