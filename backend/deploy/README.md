# VidyaTrack — EC2 Deployment Guide

## 1. Launch EC2 instance (AWS Console)

- AMI: **Ubuntu 22.04 LTS**
- Type: **t3.micro** (free tier / $50 credit)
- Storage: 20 GB gp3
- Security group — open these ports:
  - 22   (SSH — your IP only)
  - 80   (HTTP — 0.0.0.0/0)
  - 443  (HTTPS — 0.0.0.0/0)
- Download the .pem key file

## 2. SSH into the instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

## 3. Set up the server

```bash
# Upload setup script (from your local machine):
scp -i your-key.pem deploy/setup.sh ubuntu@<EC2-PUBLIC-IP>:~/

# SSH in and run:
chmod +x setup.sh && ./setup.sh

# Clone repo (first time):
git clone https://github.com/YOUR_ORG/YOUR_REPO.git ~/app
```

## 4. Configure .env

```bash
cd ~/app/demo-poc/school/backend
nano .env
```

Fill in:
- `DATABASE_URL` — Supabase pooler URL (port 6543)
- `SECRET_KEY` — run `openssl rand -hex 32`
- `ALLOWED_ORIGINS` — `["https://your-vercel-app.vercel.app"]`
- `SMTP_*` — Gmail app password
- `DB_POOL_SIZE=3`, `DB_MAX_OVERFLOW=2`  (Supabase free tier)

## 5. Install systemd service

```bash
sudo cp ~/app/demo-poc/school/backend/deploy/vidyatrack.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vidyatrack
sudo systemctl start vidyatrack

# Check it's running:
sudo systemctl status vidyatrack
curl http://localhost:8000/health
```

## 6. Set up Nginx

```bash
sudo cp ~/app/demo-poc/school/backend/deploy/nginx.conf /etc/nginx/sites-available/vidyatrack
sudo ln -s /etc/nginx/sites-available/vidyatrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Point your domain (Hostinger DNS)

Add an A record in Hostinger DNS:
```
Type: A
Name: api          (creates api.vidyatrack.com)
Value: <EC2-PUBLIC-IP>
TTL: 300
```

Wait 5–10 minutes for DNS to propagate.

## 8. SSL certificate (free via Let's Encrypt)

```bash
sudo certbot --nginx -d api.vidyatrack.com
# Follow prompts — choose redirect HTTP to HTTPS
```

Certbot auto-renews. Test: `https://api.vidyatrack.com/health`

## 9. Update frontend env on Vercel

In Vercel project settings → Environment Variables:
```
NEXT_PUBLIC_API_URL = https://api.vidyatrack.com/api/v1
```

Redeploy the frontend.

## 10. Verify end-to-end

```
https://api.vidyatrack.com/health      → {"status":"ok"}
https://api.vidyatrack.com/docs        → Swagger (DEBUG=true only)
```

---

## Subsequent deployments (every code push)

```bash
# Upload the redeploy script once:
scp -i your-key.pem deploy/redeploy.sh ubuntu@<EC2-IP>:~/
chmod +x ~/redeploy.sh

# Then every time you push new code, just SSH in and run:
./redeploy.sh
```

`redeploy.sh` does in order:
1. `git pull` — latest code
2. `pip install` — picks up any new packages
3. `alembic upgrade head` — applies any new DB migrations
4. `systemctl restart vidyatrack` — restarts the API
5. Health check — confirms the server came back up

---

## Useful commands (day-to-day)

```bash
# Live logs (stream)
sudo journalctl -u vidyatrack -f

# Last 50 log lines
sudo journalctl -u vidyatrack -n 50

# Check service status
sudo systemctl status vidyatrack

# Manual restart
sudo systemctl restart vidyatrack
```
