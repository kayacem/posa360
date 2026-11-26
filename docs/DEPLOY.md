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

## 4. Manuel deploy

```bash
cd /opt/posa360
./scripts/deploy.sh
```

Akış: mevcut imajı `posa360-app:previous` olarak etiketle → `git pull` → `docker compose build` → `up -d` → `/api/health` → `prisma migrate deploy` (entrypoint’te de çalışır). Health başarısız olursa otomatik rollback.

Super admin: `SEED_SUPER_ADMIN_*` · Plan fiyatları süper admin → **Planlar** ekranından güncellenir (seed’deki tutarlar yer tutucu).

### Hızlı rollback

```bash
cd /opt/posa360
docker tag posa360-app:previous posa360-app:latest
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --no-build app
```

## 5. GitHub Actions ile otomatik deploy

`main`’e her push’ta (ve manuel `workflow_dispatch`) `.github/workflows/deploy.yml`:

1. `npm ci` → `prisma generate` → `npm run typecheck` → `npm run test:unit`
2. Başarılıysa SSH ile VPS’te `/opt/posa360` altında `./scripts/deploy.sh`

### 5.1 GitHub repository secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Zorunlu | Açıklama |
|--------|---------|----------|
| `VPS_HOST` | Evet | VPS IP veya hostname (örn. `203.0.113.10`) |
| `VPS_USER` | Evet | SSH kullanıcısı (örn. `deploy` veya `ubuntu`) |
| `VPS_SSH_KEY` | Evet | Deploy için **private** SSH anahtarın tamamı (`-----BEGIN … KEY-----` …) |
| `VPS_PORT` | Hayır | SSH portu; boş bırakılırsa **22** |

Secret değerlerini commit’e veya `.env` dosyasına koyma.

### 5.2 VPS’te deploy SSH anahtarı

GitHub Actions’ın bağlanması için VPS’te yalnızca bu deploy anahtarını kullanın (kişisel anahtardan ayrı tutun).

```bash
# Yerel makinede (bir kez)
ssh-keygen -t ed25519 -C "posa360-github-deploy" -f ./posa360_deploy -N ""

# Public key → VPS
ssh USER@VPS_HOST 'mkdir -p ~/.ssh && chmod 700 ~/.ssh'
ssh-copy-id -i ./posa360_deploy.pub USER@VPS_HOST
# veya: cat posa360_deploy.pub | ssh USER@VPS 'cat >> ~/.ssh/authorized_keys'

# Private key → GitHub secret VPS_SSH_KEY
# (posa360_deploy dosyasının tüm içeriğini yapıştırın)
cat ./posa360_deploy
```

Öneriler:

- Deploy kullanıcısının `/opt/posa360` yazma ve `docker` grubu yetkisi olsun.
- `git pull` için VPS’te repo HTTPS (credential) veya read-only deploy key ile `origin` erişimi kurulu olsun.
- İlk kurulumda bir kez manuel `./scripts/deploy.sh` çalıştırıp stack’i ayağa kaldırın; sonra Actions’a bırakın.

### 5.3 Workflow’u tetikleme

- `main`’e merge/push
- veya Actions → **Deploy production** → **Run workflow**

Loglarda typecheck/unit fail olursa SSH adımı çalışmaz. Deploy sırasında health fail olursa script önceki imaja döner.

## 6–8. Güncelleme / yedek / restore

`./scripts/deploy.sh` · cron: `15 3 * * * …/scripts/backup-db.sh` · restore: `gunzip -c backups/….sql.gz | docker compose … exec -T postgres psql …`
