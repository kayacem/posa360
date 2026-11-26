# POSA360 - Çok Kiracılı E-Ticaret Platformu

Shopify benzeri, Türkiye pazarına özel çok kiracılı (multi-tenant) SaaS e-ticaret platformu. Ajans sahipleri için tasarlanmış, her müşteriye (tenant) kendi mağazasını açma imkanı sunar.

## 🌟 Özellikler

### Super Admin Panel
- ✅ Tenant (mağaza) yönetimi - oluştur, askıya al, sil
- ✅ CRM: Müşteri bilgileri, iletişim, vergi bilgisi
- ✅ Subscription takibi: Aylık ödeme durumu, plan yönetimi
- ✅ Domain yönetimi: Subdomain ve özel domain ataması
- ✅ Cross-tenant raporlama ve analitik
- ✅ Platform ayarları ve limitler

### Merchant Admin Panel (Her Tenant İçin)
- ✅ Dashboard: Satış, sipariş, gelir grafikleri
- ✅ Ürün yönetimi: Varyantlar, stok, kategori, marka, SKU/barkod
- ✅ Toplu ürün import/export (CSV)
- ✅ Müşteri yönetimi
- ✅ Sipariş yönetimi: Tüm yaşam döngüsü
- ✅ İndirim kuponları ve kampanyalar
- ✅ CMS: Sayfalar ve menüler
- ✅ Tema/branding ayarları (logo, renkler)
- ✅ Kargo ayarları
- ✅ Ödeme ayarları
- ✅ Vergi ayarları
- ✅ Personel yönetimi: Roller ve yetkiler
- ✅ SEO ayarları

### Storefront (Müşteri Vitrin)
- ✅ Responsive, mobil-uyumlu tasarım
- ✅ Ana sayfa: Öne çıkan ürünler, kategoriler
- ✅ Kategori listeleme ve filtreleme
- ✅ Ürün detay sayfaları
- ✅ Alışveriş sepeti
- ✅ Checkout: Misafir ve üye girişi
- ✅ Müşteri hesabı: Siparişler, adresler, iadeler, favoriler
- ✅ SEO-friendly URL'ler ve SSR

### Sipariş Yaşam Döngüsü
- ✅ Sepet → Ödeme → Sipariş Oluşturma
- ✅ Hazırlanıyor → Kargoya Verildi → Teslim Edildi
- ✅ İptal ve iade süreçleri
- ✅ Sipariş durum geçmişi
- ✅ E-posta/SMS bildirimleri (altyapı hazır)
- ✅ Fatura/PDF oluşturma

### İade (Return) Süreci
- ✅ Müşteri hesabından iade talebi (sebep, fotoğraf)
- ✅ Merchant onay/red işlemi
- ✅ İade kargo kodu
- ✅ Ürün alındı onayı
- ✅ Tam/kısmi iade
- ✅ Stok güncelleme

### Kargo Entegrasyonu
- ✅ Provider soyutlama katmanı
- ✅ Türk kargo firmaları adaptörleri: Yurtiçi, Aras, MNG, Sürat, PTT
- ✅ Gönderi oluşturma, etiket, takip numarası
- ✅ Tracking senkronizasyonu
- ✅ Kargo kuralları: Sabit, ağırlık bazlı, ücretsiz kargo eşiği
- ✅ Mock/sandbox mod (gerçek API'lar kolayca entegre edilebilir)

### Ödeme Entegrasyonu
- ✅ Provider soyutlama katmanı
- ✅ iyzico adaptörü (3D Secure)
- ✅ PayTR adaptörü (3D Secure)
- ✅ Havale/EFT
- ✅ Kapıda ödeme
- ✅ Tenant bazında credentials
- ✅ Sandbox/mock mode (uçtan uca çalışır)

### Multi-Tenancy & Domain Routing
- ✅ **Subdomain routing**: `shopmagaza.posa360.com`
- ✅ **Path routing**: `posa360.com/shopmagaza`
- ✅ **Custom domain mapping**: `shopcem.com` (CNAME ile)
- ✅ **Admin subdomains**: `admin.shopcem.com` veya `admin.shopmagaza.posa360.com`
- ✅ Host header bazında tenant çözümleme
- ✅ Redirect YOK - browser URL değişmez
- ✅ Domain doğrulama (TXT record)
- ✅ SSL/TLS desteği (dokümante)

### Türkiye'ye Özel
- ✅ Türkçe UI (i18n-ready)
- ✅ TRY para birimi
- ✅ TCKN/VKN alanları
- ✅ İl/İlçe adres formatı
- ✅ KDV hesaplaması (%20 varsayılan)

### Güvenlik
- ✅ Super admin, merchant staff ve müşteri auth
- ✅ Veri katmanında tenant izolasyonu
- ✅ RBAC (Role-Based Access Control)
- ✅ Audit log

## 🛠 Teknoloji Stack

- **Frontend/Backend**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL 16+
- **ORM**: Prisma 8
- **Auth**: NextAuth.js (beta)
- **UI**: Tailwind CSS 4 + Radix UI components
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Kurulum

### Gereksinimler

- Node.js 20+
- PostgreSQL 16+ (Docker ile çalıştırabilirsiniz)
- npm veya yarn

### 1. Depoyu Klonlayın

```bash
git clone <repo-url>
cd posa360
npm install
```

### 2. PostgreSQL Veritabanını Başlatın

Docker Compose ile:

```bash
docker compose up -d
```

Veya manuel olarak PostgreSQL kurulumunuz varsa, veritabanı bilgilerini `.env` dosyasında güncelleyin.

### 3. Ortam Değişkenlerini Ayarlayın

`.env` dosyası zaten hazır. Gerekirse şifreleri güncelleyin:

```env
DATABASE_URL="postgresql://posa360:posa360secure@localhost:5432/posa360?schema=public"
NEXTAUTH_URL=http://localhost:43210
NEXTAUTH_SECRET=your-super-secret-key-change-in-production-min-32-chars
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:43210
```

### 4. Veritabanını Kurun ve Seed Edin

Tek komutla tüm setup:

```bash
npm run setup
```

Veya adım adım:

```bash
# Prisma contract'ı oluştur
npm run contract:emit

# Veritabanı tablolarını oluştur
npm run db:push

# Demo verilerini yükle
npm run db:seed
```

### 5. Uygulamayı Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:43210` adresinde çalışacak.

## 🌐 Demo Kullanıcılar

Seed işlemi sonrasında şu kullanıcılar oluşturulur:

### Super Admin
- **E-posta**: `admin@posa360.com`
- **Şifre**: `admin123`
- **URL**: `http://localhost:43210/super-admin`

### Merchant 1 (Shop Mağaza)
- **E-posta**: `ahmet@shopmagaza.com`
- **Şifre**: `merchant123`
- **Admin URL**: `http://shopmagaza.localhost:43210/admin`
- **Storefront**: `http://shopmagaza.localhost:43210`

### Merchant 2 (Elektronik Dünyası)
- **E-posta**: `mehmet@elektronikdunya.com`
- **Şifre**: `merchant123`
- **Admin URL**: `http://admin.shopcem.local:43210`
- **Storefront**: `http://shopcem.local:43210`

### Müşteri Hesapları
- **Tenant 1**: `musteri@example.com` / `customer123`
- **Tenant 2**: `ali@example.com` / `customer123`

## 🔧 Özel Domain Testi (Localhost)

Custom domain'leri local'de test etmek için `/etc/hosts` (Linux/Mac) veya `C:\Windows\System32\drivers\etc\hosts` (Windows) dosyanıza ekleyin:

```
127.0.0.1 shopcem.local
127.0.0.1 admin.shopcem.local
127.0.0.1 shopmagaza.localhost
127.0.0.1 admin.shopmagaza.localhost
```

**Not**: `.localhost` subdomainleri çoğu modern tarayıcıda otomatik olarak 127.0.0.1'e çözümlenir, ek ayar gerekmez.

## 🏗 Yeni Tenant Ekleme

### 1. Super Admin Panelinden

1. `http://localhost:43210/super-admin` adresine gidin
2. **Tenant Yönetimi** → **Yeni Tenant** butonuna tıklayın
3. Formu doldurun:
   - Tenant adı (örn: "Yeni Mağaza")
   - Slug (örn: "yenimagaza") - subdomain olacak
   - Opsiyonel: Custom domain (örn: "yenimagaza.com")
4. İletişim ve subscription bilgilerini girin
5. Kaydet

### 2. Programatik Olarak

`src/lib/seed.ts` dosyasına bakarak örnek kod görebilirsiniz.

## 🌍 Özel Domain Bağlama

### 1. DNS Ayarları

Müşterinizin domain panelinde (GoDaddy, Cloudflare, vb.) aşağıdaki kayıtları ekletirin:

#### Yöntem A: CNAME (Önerilen)
```
Type: CNAME
Host: @ (veya www)
Value: posa360.com (veya sizin platform domain'iniz)
TTL: 3600
```

#### Yöntem B: A Record
```
Type: A
Host: @
Value: <sunucunuzun-IP-adresi>
TTL: 3600
```

### 2. Domain Doğrulama

Super Admin panelinde:
1. Tenant detay sayfasına gidin
2. **Domain Bağla** butonuna tıklayın
3. Müşteri domain'ini girin (örn: `shopcem.com`)
4. Sistem bir doğrulama TXT kaydı oluşturur:
   ```
   Type: TXT
   Host: _posa360-verification
   Value: <generated-token>
   TTL: 3600
   ```
5. Müşteri bu kaydı DNS'e ekler
6. **Doğrula** butonuna tıklayın
7. Doğrulama başarılı olduğunda tenant'ın `customDomain` alanı güncellenir

### 3. SSL/TLS Sertifikası

**Production'da** aşağıdaki yaklaşımlardan birini kullanın:

#### A) Caddy (Önerilen - Otomatik SSL)
Caddy reverse proxy kullanarak tüm custom domain'ler için otomatik Let's Encrypt sertifikası:

```caddy
{
  on_demand_tls {
    ask http://localhost:43210/api/caddy/check-domain
  }
}

:443 {
  tls {
    on_demand
  }
  reverse_proxy localhost:43210
}
```

#### B) Vercel/Cloudflare for SaaS
- Vercel: `vercel.json` ile wildcard domain routing
- Cloudflare for SaaS: Cloudflare dashboard'dan custom hostnames

#### C) Nginx + Certbot
Manuel sertifika yönetimi (her domain için ayrı):

```bash
certbot certonly --nginx -d shopcem.com -d www.shopcem.com
```

## 📊 Sandbox Flow Testi

Tüm akış mock/sandbox mode'da çalışır:

### 1. Alışveriş ve Sipariş
1. Storefront'a gidin (örn: `http://shopmagaza.localhost:43210`)
2. Ürünlere göz atın, sepete ekleyin
3. Checkout'a gidin, adres bilgilerini doldurun
4. Ödeme seçeneği olarak **Mock Ödeme** seçin
5. Ödeme başarılı olacak, sipariş oluşacak

### 2. Kargo Gönderimi
1. Merchant admin'e gidin
2. **Siparişler** bölümünde yeni siparişi görün
3. Sipariş detayına girin
4. **Kargoya Ver** butonuna tıklayın
5. Mock kargo firması seçin (örn: "Yurtiçi Kargo")
6. Sistem otomatik takip numarası oluşturur

### 3. İade Talebi
1. Müşteri hesabına giriş yapın
2. **Siparişlerim** → İade edilecek siparişi seç
3. **İade Talebi Oluştur** butonuna tıklayın
4. Sebep ve fotoğraf ekle, gönder

### 4. İade Onayı ve Para İadesi
1. Merchant admin'de **İadeler** bölümüne gidin
2. Yeni iade talebini gör
3. **Onayla** butonuna tıklayın
4. İade kargo kodunu müşteriye gönder
5. Müşteri ürünü gönderdiğinde **Ürün Alındı** işaretle
6. **Para İadesi Yap** (tam veya kısmi) butonuna tıklayın
7. Mock ödeme provider otomatik iade yapacak

## 🧪 Testler

(Test dosyaları ileride eklenecek)

```bash
npm test
```

## 📁 Proje Yapısı

```
posa360/
├── app/
│   ├── (storefront)/          # Müşteri vitrin sayfaları
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   ├── super-admin/           # Super admin panel
│   │   ├── page.tsx
│   │   ├── tenants/
│   │   ├── crm/
│   │   └── reports/
│   ├── admin/                 # Merchant admin panel (her tenant için)
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   └── settings/
│   ├── api/                   # API routes
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── tenant.ts
│   │   ├── payment-providers.ts
│   │   ├── shipping-providers.ts
│   │   ├── seed.ts
│   │   └── utils.ts
│   └── prisma/
│       ├── contract.prisma    # Database schema
│       ├── contract.json
│       └── db.ts
├── middleware.ts              # Multi-tenant routing
├── docker-compose.yml
├── package.json
└── README.md
```

## 🚀 Production'a Hazırlık

### Yapılması Gerekenler

1. **Gerçek Ödeme Entegrasyonları**
   - iyzico API anahtarlarını alın ve `src/lib/payment-providers.ts`'deki adaptörleri tamamlayın
   - PayTR merchant bilgilerini ekleyin

2. **Gerçek Kargo Entegrasyonları**
   - Yurtiçi, Aras, MNG, vb. API anahtarlarını alın
   - `src/lib/shipping-providers.ts`'deki adaptörleri tamamlayın

3. **E-posta/SMS Servisi**
   - Sipariş onay, kargo tracking, iade bildirimleri için servis entegre edin
   - Öneriler: AWS SES, SendGrid, Netgsm

4. **SSL/TLS**
   - Caddy, Nginx+Certbot veya Cloudflare for SaaS ile otomatik SSL

5. **Güvenlik**
   - `.env` dosyasındaki secret'ları güçlü olanlarla değiştirin
   - Rate limiting ekleyin
   - CORS ayarlarını production'a göre yapın
   - CSP (Content Security Policy) headers ekleyin

6. **Monitoring**
   - Application monitoring (Sentry, Datadog)
   - Uptime monitoring
   - Log aggregation

7. **Backup**
   - Veritabanı otomatik backup'ı
   - Media/upload dosyaları için object storage (S3, Cloudflare R2)

8. **CDN**
   - Statik asset'ler için CDN (Cloudflare, AWS CloudFront)

9. **Environment**
   - `NODE_ENV=production` olarak ayarlayın
   - Database connection pooling
   - Redis cache (opsiyonel)

## 📞 Destek

Sorularınız için: cem@posa360.com

## 📄 Lisans

Özel lisans - Cem Kaya / Ceka Ajans

---

**Geliştirici**: POSA360 Platform  
**Versiyon**: 1.0.0  
**Tarih**: Kasım 2026
