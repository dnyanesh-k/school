#!/bin/bash
# VidyaTrack backend — EC2 Ubuntu 22.04 setup
# Run once as ubuntu user after SSH into the instance:
#   chmod +x setup.sh && ./setup.sh

set -e

echo "=== 1. System packages ==="
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip nginx certbot python3-certbot-nginx git

echo "=== 2. Clone / pull repo ==="
# If first time:
#   git clone https://github.com/YOUR_ORG/YOUR_REPO.git ~/app
# If updating:
#   git -C ~/app pull
#
# Then navigate to backend:
#   cd ~/app/demo-poc/school/backend

echo "=== 3. Python venv ==="
cd ~/app/demo-poc/school/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "=== 4. Environment file ==="
# Copy and fill in your values:
cp .env.example .env
echo ">>> Edit .env now: nano .env <<<"

echo "=== Done. Next: sudo cp deploy/vidyatrack.service /etc/systemd/system/ ==="
