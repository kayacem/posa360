# POSA360 — VPS Production Kurulum (Ubuntu 22/24)

Tek sunucuda Docker Compose: **app** (Next.js standalone) + **Postgres 16** (dışarı kapalı) + **Caddy** (80/443, TLS).

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

| Tip | Host | Değer |
|-----|------|--------|
| A | `@` | VPS public IP |
| A | `*` | VPS public IP |
| A | `admin` | VPS public IP |

`admin.posa360.com` → süper admin paneli.  
`magazaadi.posa360.com` → mağaza vitrini; `magazaadi.posa360.com/admin` → merchant panel.

### TLS modu

`.env.production` içinde:

- **`TLS_MODE=ondemand`** (varsayılan): her hostname için ayrı sertifika; Cloudflare gerekmez. Wildcard tek sertifika **yok**.
- **`TLS_MODE=dns`**: Cloudflare DNS challenge ile `*.posa360.com` wildcard. `CLOUDFLARE_API_TOKEN` zorunlu (Zone:DNS:Edit).

Özel merchant domainleri her iki modda da **On-Demand TLS** + `/api/internal/domain-check` ile doğrulanır.

## 3. DNS — merchant özel domain (örn. `shopcem.com`)

| Tip | Host | Değer |
|-----|------|--------|
| A | `@` | VPS IP **veya** CNAME → `elektronikdunya.posa360.com` |
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

Giriş: `https://admin.posa360.com` (veya `https://posa360.com/super-admin`).

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
- Caddy On-Demand TLS, `ask http://app:3000/api/internal/domain-check` — yalnızca doğrulanmış özel domain (ve `admin.*`) 200 döner.
- `NEXT_PUBLIC_PLATFORM_DOMAIN` middleware’in subdomain / custom domain ayrımını belirler.
