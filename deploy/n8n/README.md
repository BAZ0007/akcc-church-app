# n8n on DigitalOcean — Setup Guide

Self-hosted n8n with Postgres + Caddy (auto-HTTPS) on a $6/mo DigitalOcean Basic droplet.

---

## Prerequisites

- A DigitalOcean account
- A domain you control (e.g. `n8n.akcc.org.au`)
- SSH key added to your DO account

---

## 1 — Create the Droplet

1. **Create Droplet** → Ubuntu 24.04 LTS · **Basic** · **Regular SSD** · **$6/mo** (1 vCPU / 1 GB RAM / 25 GB)
2. Choose the datacenter closest to Australia (Sydney — `syd1`)
3. Add your SSH key
4. Note the **public IPv4** address

---

## 2 — Point DNS

In your DNS provider add an **A record**:

| Name | Type | Value |
|------|------|-------|
| `n8n` | A | `<droplet-IPv4>` |

Wait for propagation (usually < 5 min on Cloudflare; up to 30 min elsewhere).  
Verify: `nslookup n8n.yourdomain.com`

---

## 3 — Harden the Droplet

```bash
ssh root@<droplet-IPv4>

# Update packages
apt update && apt upgrade -y

# Create a non-root user
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy/

# Lock down SSH (optional but recommended)
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl reload sshd

# UFW firewall — allow SSH, HTTP, HTTPS only
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## 4 — Install Docker

```bash
ssh deploy@<droplet-IPv4>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy
newgrp docker          # apply group without re-login
docker --version       # should print Docker 25+
```

Docker Compose v2 is bundled with modern Docker — no separate install needed.

---

## 5 — Copy the Config Files

From your **local machine** (inside this repo):

```bash
scp -r deploy/n8n deploy@<droplet-IPv4>:~/n8n
```

Or on the droplet, clone/copy manually.

---

## 6 — Configure Environment

```bash
cd ~/n8n
cp .env.example .env
nano .env          # fill in all CHANGE_ME values
```

Generate secrets:

```bash
# Postgres password
openssl rand -base64 32

# n8n encryption key  (32 bytes hex = 64 chars)
openssl rand -hex 32

# Webhook signing secret
openssl rand -hex 32
```

**Minimum required values before starting:**

| Variable | Example |
|----------|---------|
| `N8N_DOMAIN` | `n8n.akcc.org.au` |
| `POSTGRES_PASSWORD` | *(generated above)* |
| `N8N_BASIC_AUTH_USER` | `admin` |
| `N8N_BASIC_AUTH_PASSWORD` | *(strong password)* |
| `N8N_ENCRYPTION_KEY` | *(generated above — save it permanently)* |
| `N8N_WEBHOOK_SECRET` | *(generated above — also add to Vercel)* |

---

## 7 — Start n8n

```bash
cd ~/n8n
docker compose up -d

# Watch logs until Caddy obtains the TLS cert (< 30 s)
docker compose logs -f caddy
# You should see: "certificate obtained successfully"

docker compose logs -f n8n
# You should see: "n8n ready on port 5678"
```

---

## 8 — Lock the First Login

1. Open `https://n8n.yourdomain.com` in your browser
2. Enter the basic-auth credentials you set in `.env`
3. n8n will prompt you to create an **owner account** — do this immediately
4. **Do not skip** this step; otherwise the first visitor becomes the owner

---

## 9 — Verify Everything Works

```bash
# n8n health check
curl -u admin:<N8N_BASIC_AUTH_PASSWORD> https://n8n.yourdomain.com/healthz
# → {"status":"ok"}

# Check TLS cert expiry
echo | openssl s_client -connect n8n.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Ongoing Maintenance

```bash
# Pull latest n8n image and restart
docker compose pull n8n && docker compose up -d n8n

# View logs
docker compose logs -f n8n

# Backup Postgres
docker compose exec postgres pg_dump -U n8n n8n > backup-$(date +%Y%m%d).sql
```

---

## Environment Variables Reference

| Variable | Purpose |
|----------|---------|
| `N8N_DOMAIN` | Subdomain Caddy provisions TLS for |
| `POSTGRES_PASSWORD` | Local Postgres password (never shared externally) |
| `N8N_BASIC_AUTH_USER/PASSWORD` | HTTP basic-auth gate on the editor |
| `N8N_ENCRYPTION_KEY` | Encrypts n8n stored credentials — **never change** |
| `N8N_WEBHOOK_SECRET` | HMAC secret shared with the AKCC Next.js app (Day 7) |

---

## What's Next

**Day 7** adds a thin HMAC helper in the Next.js app that signs all outbound webhook payloads with `N8N_WEBHOOK_SECRET`. n8n workflows then verify the `X-AKCC-Signature` header before processing.
