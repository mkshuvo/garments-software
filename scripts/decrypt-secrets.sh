#!/bin/bash
# Decrypt secrets and generate .env file
set -e

echo "🔐 Decrypting secrets..."

# Check SOPS is installed
command -v sops >/dev/null 2>&1 || { echo "❌ sops not installed. Install with: winget install Mozilla.sops"; exit 1; }

# Check secrets file exists
if [ ! -f "secrets.enc.yaml" ]; then
    echo "❌ secrets.enc.yaml not found!"
    echo "   Create it with: sops -e secrets.yaml > secrets.enc.yaml"
    exit 1
fi

# Decrypt and convert to .env
sops -d secrets.enc.yaml | python3 scripts/yaml-to-env.py > .env

# Generate pgadmin/pgpass from .env
source .env
mkdir -p pgadmin
echo "${POSTGRES_HOST:-postgres}:5432:*:${POSTGRES_USER}:${POSTGRES_PASSWORD}" > pgadmin/pgpass
chmod 600 pgadmin/pgpass 2>/dev/null || true

echo "✅ Secrets decrypted to .env"
echo "✅ pgadmin/pgpass generated"
