#!/bin/bash
# Uygulamayı başlat

cd /var/www/CG_Portal

# PM2'yi başlat
pm2 start npm --name "cg-portal" -- start
pm2 save
pm2 status

# Kontrol
sleep 3
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api || echo "❌ Uygulama başlatılamadı"
