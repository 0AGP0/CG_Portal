#!/bin/bash
# Sunucuyu güncel kodlarla senkronize et

echo "=== 1. MEVCUT DURUMU KAYDET ==="
cd /var/www/CG_Portal
git log --oneline -1

echo ""
echo "=== 2. LOCAL DEĞİŞİKLİKLERİ TEMİZLE ==="
# .next klasörünü git'ten kaldır (zaten .gitignore'da olmalı)
git restore .next/ 2>/dev/null || true
git clean -fd .next/ 2>/dev/null || true

echo ""
echo "=== 3. REMOTE BRANCH'I ÇEK ==="
git fetch origin

echo ""
echo "=== 4. LOCAL BRANCH'I REMOTE İLE SENKRONİZE ET ==="
# Force reset yap (dikkatli!)
git reset --hard origin/main

echo ""
echo "=== 5. BUILD CACHE'İ TEMİZLE ==="
rm -rf .next

echo ""
echo "=== 6. YENİ BUILD YAP ==="
npm run build

echo ""
echo "=== 7. PM2'Yİ YENİDEN BAŞLAT ==="
pm2 restart all

echo ""
echo "=== 8. KONTROL ==="
echo "Git durumu:"
git log --oneline -1
echo ""
echo "Webhook route'da zararlı IP var mı?"
grep -n "51.81.104.115" src/app/api/odoo-webhook/route.ts || echo "✅ Zararlı IP kodda yok"
echo ""
echo "PM2 durumu:"
pm2 status
