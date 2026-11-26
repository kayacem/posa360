'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: ValidationError[]
}

export function CSVImportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/products/import-csv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'İçe aktarma başarısız')
      }

      setResult(data)
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      setResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [{ row: 0, field: 'general', message: err.message }],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="csv-file" className="block text-sm font-medium mb-2">
            CSV Dosyası Seç
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Seçili: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <Button type="submit" disabled={!file || loading}>
          {loading ? 'Yükleniyor...' : '📤 İçe Aktar'}
        </Button>
      </form>

      {result && (
        <div className="mt-6">
          {result.success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800">✅ İçe Aktarma Tamamlandı</h3>
              <p className="text-sm text-green-700 mt-1">
                {result.imported} ürün başarıyla içe aktarıldı.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800">⚠️ İçe Aktarma Tamamlandı (Hatalarla)</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {result.imported} ürün içe aktarıldı, {result.failed} ürün başarısız.
              </p>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">Hatalar:</h4>
              <div className="bg-red-50 border border-red-200 rounded p-4 max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-200">
                      <th className="text-left py-2 px-2">Satır</th>
                      <th className="text-left py-2 px-2">Alan</th>
                      <th className="text-left py-2 px-2">Hata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((error, idx) => (
                      <tr key={idx} className="border-b border-red-100">
                        <td className="py-2 px-2">{error.row}</td>
                        <td className="py-2 px-2 font-mono">{error.field}</td>
                        <td className="py-2 px-2 text-red-700">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
