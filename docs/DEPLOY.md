# POSA360 — VPS Production Kurulum (Ubuntu 22/24)

Tek sunucuda Docker Compose: **app** (Next.js standalone) + **Postgres 16** (dışarı kapalı) + **Caddy** (80/443, TLS).

> **Önemli:** `posa360.com` apex (ve `/eticaret` vb. marketing sayfaları) **bu uygulamaya ait değildir**. Apex/www marketing sitesinde kalır. Bu stack yalnızca alt alan adlarını ve merchant özel domainlerini sunar.

## 1. VPS hazırlığı

```bash
# Docker
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# oturumu kapatıp açın

# Güvenlik duvarı
sudo ufw allow OpenSSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Repo:

```bash
sudo mkdir -p /opt/posa360
sudo chown $USER:$USER /opt/posa360
git clone <REPO_URL> /opt/posa360
cd /opt/posa360
cp .env.production.example .env.production
nano .env.production   # sırları doldurun
chmod +x scripts/*.sh deploy/caddy/entrypoint.sh
```

## 2. DNS — platform (`posa360.com`)

**Apex (`@`) ve `www` kaydını değiştirmeyin** — marketing sitesi orada kalır.

Bu uygulama için VPS’e yönlendirin:

| Tip | Host | Değer | Not |
|-----|------|--------|-----|
| A | `app` | VPS public IP | Kayıt / giriş (`app.posa360.com`) |
| A | `admin` | VPS public IP | Süper admin (`admin.posa360.com`) |
| A | `*` | VPS public IP | Mağaza subdomainleri (`{slug}.posa360.com`) |

Caddy **`posa360.com` / `www.posa360.com` claim etmez**; yalnızca `*.posa360.com` (+ özel merchant domainleri).

Host → görev:

| Host | Görev |
|------|--------|
| `app.posa360.com` | Platform giriş + kayıt (`/login`, **`/kayit`**) |
| `admin.posa360.com` | Süper admin paneli |
| `{slug}.posa360.com` | Mağaza vitrini; `{slug}.posa360.com/admin` merchant panel |
| `www` / `mail` / apex | Bu app’te **yok** (404 / marketing) |

Marketing CTA örneği: `https://app.posa360.com/kayit`

### TLS modu

`.env.production` içinde:

- **`TLS_MODE=ondemand`** (varsayılan): her subdomain için ayrı sertifika; Cloudflare gerekmez.
- **`TLS_MODE=dns`**: Cloudflare DNS challenge ile `*.posa360.com` wildcard. `CLOUDFLARE_API_TOKEN` zorunlu (Zone:DNS:Edit). Apex’i kapsamaz.

Özel merchant domainleri her iki modda da **On-Demand TLS** + `/api/internal/domain-check` ile doğrulanır (apex/www platform için 404).

## 3. DNS — merchant özel domain (örn. `shopcem.com`)

| Tip | Host | Değer |
|-----|------|--------|
| A | `@` | VPS IP **veya** CNAME → `{slug}.posa360.com` |
| CNAME | `www` | `shopcem.com` (veya tenant subdomain) |
| CNAME | `admin` | `shopcem.com` (veya tenant subdomain) |
| TXT | `_posa360-verification` | Super-admin panelden üretilen token |

Doğrulama sonrası:

- `https://shopcem.com` → vitrin (**yönlendirme yok**)
- `https://admin.shopcem.com` → o tenant’ın `/admin` paneli

## 4. İlk deploy

```bash
cd /opt/posa360
./scripts/deploy.sh
```

Entrypoint sırası: Postgres bekle → `prisma migrate deploy` → opsiyonel super admin seed → `node server.js`.

### Super admin oluşturma

`.env.production`:

```env
SEED_SUPER_ADMIN_EMAIL=admin@posa360.com
SEED_SUPER_ADMIN_PASSWORD=guclu-sifre
SEED_SUPER_ADMIN_NAME=Platform Admin
```

İlk `up` sırasında yoksa oluşturulur. Sonra bu satırları silebilir veya boş bırakabilirsiniz (tekrar çalıştırmaz / mevcutu atlar).

Girişler:

- Super admin: `https://admin.posa360.com`
- Merchant kayıt: `https://app.posa360.com/kayit`
- Merchant giriş: `https://app.posa360.com/login`

## 5. Güncelleme

```bash
cd /opt/posa360
./scripts/deploy.sh
```

(`git pull` → build → `up -d`; migrate entrypoint’te.)

## 6. Yedekleme / geri yükleme

### Cron (günlük 03:15, 7 gün sakla)

```cron
15 3 * * * cd /opt/posa360 && ENV_FILE=.env.production /opt/posa360/scripts/backup-db.sh >> /var/log/posa360-backup.log 2>&1
```

Manuel:

```bash
./scripts/backup-db.sh
```

Dump’lar: `backups/posa360_YYYYMMDD_HHMMSS.sql.gz`

### Restore

```bash
gunzip -c backups/posa360_XXXX.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec -T postgres psql -U posa360 -d posa360
```

## 7. Faydalı komutlar

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f app
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f caddy
```

## 8. Mimari notlar

- Postgres host’a port açmaz; sadece `posa360` Docker ağı.
- Caddy site blocks: `*.posa360.com` + On-Demand `https://` (custom domains) — **apex/www yok**.
- `/api/internal/domain-check` apex/www için 404; doğrulanmış özel domain (+ `admin.*`) ve platform alt alan adları için 200.
- `NEXT_PUBLIC_PLATFORM_DOMAIN=posa360.com` (apex’i ayırır; app host = `app.` + domain).
