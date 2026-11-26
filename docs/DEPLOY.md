# POSA360 E-ticaret — Production Kurulum (DigitalOcean)

Bu uygulama **posa360.com apex/www’yi kullanmaz**. Apex’te zaten çalışan POSA hub (`posa-360.service` :3016) ve diğer ürünler (randevu, yonet, ajans, otel, menu) olduğu gibi kalır.

| Host | Görev |
|------|--------|
| `eticaret.posa360.com` | Marketing (`/`, `/paketler`, `/iletisim`, yasal) + `/kayit?plan=` + `/login` + süper admin (`/admin` → `/super-admin`) |
| `panel.posa360.com` | Süper admin alias (isteğe bağlı) |
| `{slug}.posa360.com` | Mağaza vitrini + `/admin` (nginx wildcard; mevcut exact `server_name` blokları kazanır) |
| `örnek.com` / `admin.örnek.com` | Merchant özel domain (TXT doğrulama; SSL sahibi yönetir) |

**Yok:** Docker Compose production, Caddy. Stack: **nginx (80/443)** + **systemd `posa-eticaret` (:3030)** + **native PostgreSQL 16**.

Sunucu: DigitalOcean droplet `206.189.8.235`, Ubuntu 24.04, **2 GB RAM**. **Sunucuda `next build` yapılmaz** (CI build + rsync).

---

## 1. DNS (DigitalOcean)

| Tip | Host | Değer |
|-----|------|--------|
| A | `eticaret` | `206.189.8.235` |
| A | `*` | `206.189.8.235` (mağaza subdomainleri) |
| A | `panel` | `206.189.8.235` (isteğe bağlı süper admin) |

Mevcut exact kayıtlar (`@`, `www`, `randevu`, `yonet`, …) olduğu gibi kalır; nginx’te exact `server_name` wildcard’dan önce eşleşir.

### Merchant özel domain

| Tip | Host | Değer |
|-----|------|--------|
| A / CNAME | `@` / `www` | `206.189.8.235` veya `eticaret.posa360.com` |
| A / CNAME | `admin` | aynı |
| TXT | `_posa360-verification` | panelde üretilen token |

---

## 2. Postgres — yeni DB + rol

Mevcut Postgres’e (127.0.0.1:5432) ayrı rol/DB:

```bash
sudo -u postgres psql <<'SQL'
CREATE USER posa_eticaret WITH PASSWORD 'GÜÇLÜ_ŞİFRE';
CREATE DATABASE posa_eticaret OWNER posa_eticaret;
GRANT ALL PRIVILEGES ON DATABASE posa_eticaret TO posa_eticaret;
\c posa_eticaret
GRANT ALL ON SCHEMA public TO posa_eticaret;
ALTER DATABASE posa_eticaret OWNER TO posa_eticaret;
SQL
```

---

## 3. Uygulama dizini + env

```bash
sudo mkdir -p /opt/posa/apps/eticaret/{releases,backups}
sudo mkdir -p /etc/nginx/sites-available/posa-eticaret-custom
sudo chown -R posa:posa /opt/posa/apps/eticaret

cp .env.production.example /opt/posa/apps/eticaret/.env
nano /opt/posa/apps/eticaret/.env
chmod 600 /opt/posa/apps/eticaret/.env
```

Önemli değişkenler: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://eticaret.posa360.com`, `NEXT_PUBLIC_*`.

```bash
echo 'posa ALL=(root) NOPASSWD: /bin/systemctl restart posa-eticaret' | sudo tee /etc/sudoers.d/posa-eticaret
```

Node 22 sunucuda kurulu olmalı (`node -v`); yalnızca **çalıştırma** için — build CI’da.

---

## 4. systemd

```bash
sudo cp deploy/systemd/posa-eticaret.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable posa-eticaret
# İlk release gelene kadar start etme; Actions ilk deploy’da restart eder
```

Port **3030**, `NODE_OPTIONS=--max-old-space-size=512`, `WorkingDirectory=/opt/posa/apps/eticaret/current`.

---

## 5. nginx

```bash
sudo cp deploy/nginx/eticaret.conf /etc/nginx/sites-available/posa-eticaret.conf
# ssl_certificate yollarını kendi sertifikalarınıza göre düzenleyin (PLACEHOLDER)
sudo ln -sf /etc/nginx/sites-available/posa-eticaret.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Wildcard + hub aynı upstream `127.0.0.1:3030`. Diğer ürünlerin exact bloklarına dokunma. Özel domain örneği: `deploy/nginx/custom-domains.conf.example`.

### SSL (sahibi yönetir)

Bu repo sertifika otomasyonu içermez. nginx conf’taki yolları kendi cert’lerinize göre güncelleyin. Gerekli sertifikalar:

| Sertifika | Kullanım |
|-----------|----------|
| `eticaret.posa360.com` | Hub (isteğe bağlı aynı cert’e `panel.posa360.com` SAN) |
| `*.posa360.com` (wildcard) | Mağaza subdomainleri `{slug}.posa360.com` |
| Her özel domain | `örnek.com` (+ isteğe bağlı `www`) **ve** `admin.örnek.com` |

Reload öncesi her zaman: `sudo nginx -t`.

---

## 6. GitHub Actions auto-deploy

`main` push → CI’da `tsc` + unit test + **standalone build** → artifact → rsync → `releases/<sha>` → `prisma migrate deploy` → `current` symlink → `systemctl restart` → `/api/health` → fail olursa önceki release → son **5** release tutulur.

### Secrets (Settings → Actions)

| Secret | Açıklama |
|--------|----------|
| `VPS_HOST` | `206.189.8.235` |
| `VPS_USER` | örn. `posa` |
| `VPS_SSH_KEY` | Deploy **private** key (tam PEM) |

### Deploy key

```bash
ssh-keygen -t ed25519 -C "posa-eticaret-gha" -f ./posa_eticaret_deploy -N ""
ssh-copy-id -i ./posa_eticaret_deploy.pub posa@206.189.8.235
# Private içeriği → VPS_SSH_KEY
```

İlk seferde Actions’ı çalıştırmadan önce dizin + `.env` + nginx + systemd hazır olmalı.

---

## 7. Yedek

```bash
sudo cp scripts/backup-db.sh /opt/posa/apps/eticaret/backup-db.sh
sudo chmod +x /opt/posa/apps/eticaret/backup-db.sh
# cron: 15 3 * * * /opt/posa/apps/eticaret/backup-db.sh >> /var/log/posa-eticaret-backup.log 2>&1
```

Restore: `gunzip -c /opt/posa/apps/eticaret/backups/….sql.gz | psql "$DATABASE_URL"`.

---

## 8. Hızlı rollback

```bash
cd /opt/posa/apps/eticaret/releases
ls -1dt */ | head
ln -sfn /opt/posa/apps/eticaret/releases/<eski-sha> /opt/posa/apps/eticaret/current
sudo systemctl restart posa-eticaret
curl -s http://127.0.0.1:3030/api/health
```

---

## 9. Rezerve subdomain’ler

Mağaza slug olamaz: `www`, `eticaret`, `admin`, `app`, `api`, `mail`, `randevu`, `yonet`, `ajans`, `otel`, `menu`, `panel`.
