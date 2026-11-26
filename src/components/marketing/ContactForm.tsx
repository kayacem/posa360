'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/marketing/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, message, source: 'iletisim' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gönderilemedi')
      setStatus('ok')
      setName('')
      setEmail('')
      setPhone('')
      setCompany('')
      setMessage('')
    } catch (err: any) {
      setStatus('err')
      setError(err.message || 'Hata')
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-teal-900">
        Mesajınız alındı. En kısa sürede dönüş yapacağız.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="mb-1 block text-sm font-medium">
            Ad Soyad
          </label>
          <Input id="lead-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="lead-email" className="mb-1 block text-sm font-medium">
            E-posta
          </label>
          <Input
            id="lead-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium">
            Telefon
          </label>
          <Input
            id="lead-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0553…"
          />
        </div>
        <div>
          <label htmlFor="lead-company" className="mb-1 block text-sm font-medium">
            Şirket
          </label>
          <Input id="lead-company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor="lead-message" className="mb-1 block text-sm font-medium">
          Mesaj
        </label>
        <textarea
          id="lead-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={status === 'loading'} className="w-full bg-teal-700 hover:bg-teal-800">
        {status === 'loading' ? 'Gönderiliyor…' : 'Gönder'}
      </Button>
    </form>
  )
}
