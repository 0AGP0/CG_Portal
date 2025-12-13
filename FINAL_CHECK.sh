#!/bin/bash
# Sunucuda final kontrol scripti

echo "=== 1. GIT DURUMU ==="
cd /var/www/CG_Portal
git log --oneline -1
echo ""

echo "=== 2. NEXT.CONFIG.MJS KONTROLÜ ==="
cat next.config.mjs | grep -A 5 "ignoreBuildErrors\|ignoreDuringBuilds" || echo "❌ Config dosyası güncel değil"
echo ""

echo "=== 3. WEBHOOK ROUTE GÜVENLİK KONTROLÜ ==="
grep -n "51.81.104.115\|nuts\|reactOnMynuts" src/app/api/odoo-webhook/route.ts | head -5 || echo "✅ Zararlı IP pattern'leri kodda yok"
echo ""

echo "=== 4. BUILD DURUMU ==="
if [ -d ".next" ]; then
  echo "✅ .next klasörü var"
  ls -la .next/BUILD_ID 2>/dev/null && echo "✅ BUILD_ID var" || echo "❌ BUILD_ID yok"
else
  echo "❌ .next klasörü yok - build yapılmamış"
fi
echo ""

echo "=== 5. PM2 DURUMU ==="
pm2 status
echo ""

echo "=== 6. PM2 LOG'LARI (SON 20 SATIR) ==="
pm2 logs cg-portal --lines 20 --nostream | tail -20
echo ""

echo "=== 7. ZARARLI PROCESS'LER ==="
ps aux | grep -i "wget\|curl\|51.81.104.115\|nuts" | grep -v grep || echo "✅ Zararlı process yok"
echo ""

echo "=== 8. NETWORK BAĞLANTILARI ==="
netstat -an | grep -E "51.81.104.115|194.69.203.32" || echo "✅ Zararlı IP bağlantısı yok"
echo ""

echo "=== 9. IPTABLES KURALLARI ==="
iptables -L -n | grep -E "51.81.104.115|194.69.203.32" | head -5 || echo "⚠️ IPTABLES kuralları görünmüyor"
echo ""

echo "=== 10. UYGULAMA ERİŞİM KONTROLÜ ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api || echo "❌ Uygulama erişilemiyor"
