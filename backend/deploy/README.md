# VidyaTrack — EC2 Deployment Guide (Docker + GitHub Actions CI/CD)

## Stack
- **Instance:** AWS t4g.small (ARM64 Graviton2 — 2 vCPU, 2 GB RAM)
- **Runtime:** Docker + docker-compose
- **Reverse proxy:** Nginx
- **SSL:** Let's Encrypt (certbot)
- **CI/CD:** GitHub Actions → SSH into EC2 → build & deploy

---

## First-time EC2 setup

### 1. Launch EC2 instance (AWS Console)

- AMI: **Ubuntu 22.04 LTS (ARM64)**  ← must be ARM, not x86
- Type: **t4g.small**
- Storage: 20 GB gp3
- Security group — open ports:
  - 22   (SSH — your IP only)
  - 80   (HTTP — 0.0.0.0/0)
  - 443  (HTTPS — 0.0.0.0/0)
- Download the .pem key

### 2. SSH into the instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 3. Install Docker + Nginx + Git

```bash
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker   # apply without logout

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx git

# Verify
docker --version
```

### 4. Clone repository

```bash
git clone https://github.com/dnyanesh-k/school.git ~/school
```

### 5. Configure .env

```bash
cd ~/school/backend
cp .env.example .env
nano .env
```

Fill in:
- `DATABASE_URL` — Supabase pooler URL (port 6543)
- `SECRET_KEY` — `openssl rand -hex 32`
- `ALLOWED_ORIGINS` — `["https://your-app.vercel.app"]`
- `SMTP_*` — Gmail app password
- `DB_POOL_SIZE=3` / `DB_MAX_OVERFLOW=2` (Supabase free tier)
- `DEBUG=false`

### 6. First build & start

```bash
cd ~/school/backend

# Build image (first time — takes 2-3 min)
docker compose -f docker-compose.prod.yml build

# Start the API (alembic migrations run automatically at container startup)
docker compose -f docker-compose.prod.yml up -d

# Verify
docker compose -f docker-compose.prod.yml ps
curl http://localhost:8000/health
```

### 7. Set up Nginx

```bash
sudo tee /etc/nginx/sites-available/vidyatrack << 'EOF'
server {
    listen 80;
    server_name api.vidyatrackai.com;

    location / {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/vidyatrack /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 8. DNS — Hostinger

Add an A record:
```
Type:  A
Name:  api
Value: <EC2-PUBLIC-IP>
TTL:   300
```

Wait 5-10 min for propagation.

### 9. SSL (free, auto-renewing)

```bash
sudo certbot --nginx -d api.vidyatrackai.com
```

Test: `https://api.vidyatrackai.com/health`

### 10. Update Vercel frontend env

Vercel → Project settings → Environment Variables:
```
NEXT_PUBLIC_API_URL = https://api.vidyatrackai.com/api/v1
```

Redeploy frontend.

---

## CI/CD setup (GitHub Actions)

After the first manual deploy, all future pushes to `main` that touch the backend auto-deploy via `.github/workflows/deploy-backend.yml`.

### Add GitHub Secrets

In your GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | Your EC2 public IP or domain |
| `EC2_SSH_KEY` | Contents of your `.pem` file (the whole text) |

### How the pipeline works

Every `git push` to `main` (that touches `backend/`):
1. GitHub runner SSHes into EC2
2. `git pull` latest code from `~/school`
3. Docker image rebuilt on EC2 (native ARM64 — no QEMU needed)
4. `docker compose up -d` restarts container
5. **Alembic migrations run automatically at container startup** (before uvicorn starts)
6. Old images pruned
7. Health check confirms API is up

You can also trigger manually: GitHub → Actions → Deploy Backend to EC2 → Run workflow

---

## Adding new DB columns (Alembic workflow)

**Never write raw SQL.** Use autogenerate instead:

### Step 1 — Change the SQLAlchemy model
```python
# e.g. add a column to app/models/user.py
last_login = Column(DateTime, nullable=True)
```

### Step 2 — Start local Postgres and sync schema
```bash
# from backend/ folder
docker compose up -d postgres
alembic upgrade head   # brings local DB to current prod schema
```

### Step 3 — Autogenerate migration
```bash
alembic revision --autogenerate -m "add last_login to users"
# creates alembic/versions/YYYYMMDD_HHMM_xxxx_add_last_login_to_users.py
```

### Step 4 — Review the generated file
```python
# alembic/versions/xxxx.py
def upgrade():
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('users', 'last_login')
```

### Step 5 — Commit and push
```bash
git add alembic/versions/
git commit -m "migration: add last_login to users"
git push origin main
```

CI auto-deploys → container restarts → `alembic upgrade head` runs → column appears in Supabase.

---

## Day-to-day operations

```bash
# View live logs
docker compose -f docker-compose.prod.yml logs -f

# Restart manually
docker compose -f docker-compose.prod.yml restart api

# Open a shell in the container
docker compose -f docker-compose.prod.yml exec api bash

# Run migrations manually
docker compose -f docker-compose.prod.yml exec api alembic upgrade head

# Check container status
docker compose -f docker-compose.prod.yml ps
```

---

## Cost estimate (t4g.small)

| Item | Monthly cost |
|------|-------------|
| t4g.small (on-demand) | ~$14/month |
| 20 GB gp3 storage | ~$1.6/month |
| Data transfer (light) | ~$1/month |
| **Total** | **~$16-17/month** |

With $200 credit → ~11-12 months free.
13.234.14.83