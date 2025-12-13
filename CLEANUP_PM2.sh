#!/bin/bash
# PM2 duplicate process'leri temizle

cd /var/www/CG_Portal

# Tüm cg-portal process'lerini durdur
pm2 delete all

# Tekrar başlat
pm2 start npm --name "cg-portal" -- start
pm2 save

# Kontrol
sleep 3
pm2 status
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api
