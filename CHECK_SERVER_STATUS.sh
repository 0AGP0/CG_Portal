#!/bin/bash
# Sunucuda kodların güncel olup olmadığını ve zararlı kodun nereden geldiğini kontrol et

echo "=== 1. GIT DURUMU ==="
cd /var/www/CG_Portal
git status
git log --oneline -5

echo ""
echo "=== 2. WEBHOOK ROUTE KONTROLÜ ==="
grep -n "51.81.104.115" src/app/api/odoo-webhook/route.ts || echo "✅ Zararlı IP kodda yok"

echo ""
echo "=== 3. BUILD CACHE KONTROLÜ ==="
ls -la .next/cache/ 2>/dev/null | head -10
echo "Build tarihi:"
stat .next 2>/dev/null | grep Modify

echo ""
echo "=== 4. ZARARLI PROCESS'LER ==="
ps aux | grep -i "wget\|curl\|51.81.104.115\|nuts" | grep -v grep

echo ""
echo "=== 5. NETWORK BAĞLANTILARI ==="
netstat -anp | grep -E "51.81.104.115|194.69.203.32" | head -5

echo ""
echo "=== 6. PM2 PROCESS DETAYLARI ==="
pm2 describe cg-portal | grep -E "pid|status|restart|uptime"

echo ""
echo "=== 7. SON LOG'LAR (ZARARLI IP ARAMA) ==="
pm2 logs cg-portal --lines 100 --nostream | grep -i "51.81.104.115\|194.69.203.32\|nuts\|security\|violation" | tail -20

echo ""
echo "=== 8. NODE_MODULES KONTROLÜ (Zararlı paket var mı?) ==="
find node_modules -name "*.js" -type f -exec grep -l "51.81.104.115\|194.69.203.32\|nuts\|hiddenbink" {} \; 2>/dev/null | head -5

echo ""
echo "=== 9. BUILD ÇIKTISI KONTROLÜ ==="
find .next -name "*.js" -type f -exec grep -l "51.81.104.115\|194.69.203.32" {} \; 2>/dev/null | head -5
