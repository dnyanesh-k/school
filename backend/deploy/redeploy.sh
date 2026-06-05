#!/bin/bash
# VidyaTrack — run this on EC2 every time you push new code
# Usage: ./redeploy.sh

set -e

APP_DIR=~/app/demo-poc/school/backend

echo "=== Pulling latest code ==="
git -C ~/app pull

echo "=== Installing new dependencies (if any) ==="
source $APP_DIR/venv/bin/activate
pip install -r $APP_DIR/requirements.txt --quiet

echo "=== Running Alembic migrations ==="
cd $APP_DIR
alembic upgrade head

echo "=== Restarting service ==="
sudo systemctl restart vidyatrack

echo "=== Health check ==="
sleep 2
curl -sf http://localhost:8000/health && echo " ✓ Backend is up" || echo " ✗ Health check failed — run: sudo journalctl -u vidyatrack -n 50"
