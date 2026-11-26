# POSA360 — VPS Production Kurulum (Ubuntu 22/24)

Tek sunucuda Docker Compose: **app** (Next.js standalone) + **Postgres 16** (dışarı kapalı) + **Caddy** (80/443, TLS).

Bu stack şunları sunar:

| Host | Görev |
|------|--------|
| `posa360.com` | Marketing sitesi (`/`, `/paketler`, `/iletisim`, …) |
| `www.posa360.com` | Apex’e **308 redirect** |
| `app.posa360.com` | Giriş + kayıt (`/login`, `/kayit?plan=`) |
| `admin.posa360.com` | Süper admin |
| `{slug}.posa360.com` | Mağaza vitrini /admin |
| Özel merchant domain | On-Demand TLS + doğrulama |

## 1. VPS hazırlığı

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

sudo ufw allow OpenSSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

```bash
sudo mkdir -p /opt/posa360 && sudo chown $USER:$USER /opt/posa360
git clone <REPO_URL> /opt/posa360
cd /opt/posa360
cp .env.production.example .env.production
nano .env.production
chmod +x scripts/*.sh deploy/caddy/entrypoint.sh
```

## 2. DNS — platform (`posa360.com`)

| Tip | Host | Değer |
|-----|------|--------|
| A | `@` | VPS public IP (marketing) |
| A | `www` | VPS public IP (→ apex redirect) |
| A | `app` | VPS public IP |
| A | `admin` | VPS public IP |
| A | `*` | VPS public IP (mağaza subdomainleri) |

Marketing CTA: `https://app.posa360.com/kayit?plan=profesyonel`

### TLS

- `TLS_MODE=ondemand` (varsayılan) veya `TLS_MODE=dns` + `CLOUDFLARE_API_TOKEN` (wildcard `*.posa360.com` + apex/www).

## 3. Merchant özel domain

A `@` / CNAME `www` + `admin` → VPS veya `{slug}.posa360.com`; TXT `_posa360-verification`.

## 4. Deploy

```bash
./scripts/deploy.sh
```

Super admin: `SEED_SUPER_ADMIN_*` · Plan fiyatları süper admin → **Planlar** ekranından güncellenir (seed’deki tutarlar yer tutucu).

## 5–8. Güncelleme / yedek / restore

`./scripts/deploy.sh` · cron: `15 3 * * * …/scripts/backup-db.sh` · restore: `gunzip -c backups/….sql.gz | docker compose … exec -T postgres psql …`
