#!/bin/bash
# Güvenli kurulum scripti - Sunucu yeniden kurulumdan sonra

echo "=== 1. GÜVENLİK KONTROLÜ ==="
# Zararlı process'ler var mı?
ps aux | grep -Ei "pACEd|50oN|jdCIjbm|51\.81\.104\.115|nuts|wget.*51\.81\.104\.115|curl.*51\.81\.104\.115" | grep -v grep && echo "⚠️ Zararlı process bulundu!" || echo "✅ Temiz"

# Zararlı dosyalar var mı?
find / -maxdepth 3 -name "pACEd" -o -name "50oN" -o -name "jdCIjbm" 2>/dev/null && echo "⚠️ Zararlı dosya bulundu!" || echo "✅ Temiz"

echo ""
echo "=== 2. FIREWALL KURALLARI ==="
# Zararlı IP'leri engelle
iptables -I INPUT 1 -s 51.81.104.115 -j DROP 2>/dev/null
iptables -I OUTPUT 1 -d 51.81.104.115 -j DROP 2>/dev/null
iptables -I INPUT 1 -s 194.69.203.32 -j DROP 2>/dev/null
iptables -I OUTPUT 1 -d 194.69.203.32 -j DROP 2>/dev/null

# IPTABLES persistent kur
apt-get update -qq
apt-get install -y iptables-persistent netfilter-persistent 2>/dev/null
iptables-save > /etc/iptables/rules.v4 2>/dev/null || true

echo ""
echo "=== 3. GITHUB REPO'SUNDAN KURULUM ==="
cd /var/www/CG_Portal || mkdir -p /var/www/CG_Portal && cd /var/www/CG_Portal

# Git repo'sunu klonla veya güncelle
if [ -d ".git" ]; then
  echo "Repo zaten var, güncelleniyor..."
  git fetch origin
  git reset --hard origin/main
else
  echo "Repo klonlanıyor..."
  git clone https://github.com/0AGP0/CG_Portal.git .
fi

echo ""
echo "=== 4. NODE MODULES KURULUMU ==="
npm ci

echo ""
echo "=== 5. BUILD ==="
rm -rf .next
npm run build

echo ""
echo "=== 6. PM2 KURULUMU ==="
# PM2 yoksa kur
if ! command -v pm2 >/dev/null; then
  npm install -g pm2
fi

# PM2'yi başlat
pm2 delete all 2>/dev/null
pm2 start npm --name "cg-portal" -- start
pm2 save
pm2 startup

echo ""
echo "=== 7. GÜVENLİK KONTROLÜ (SON) ==="
# Zararlı process'ler
ps aux | grep -Ei "pACEd|50oN|jdCIjbm|51\.81\.104\.115|nuts" | grep -v grep || echo "✅ Süreç temiz"

# Network bağlantıları
netstat -an | grep 51.81.104.115 || echo "✅ Network temiz"

# PM2 durumu
pm2 status

echo ""
echo "✅ Kurulum tamamlandı!"


