#!/bin/bash
# İzleme scriptini durdur ve CPU kullanımını kontrol et

echo "=== 1. İZLEME SCRIPT'İNİ DURDUR ==="
pkill -9 -f MONITOR_MALWARE.sh
echo "✅ İzleme scripti durduruldu"

echo ""
echo "=== 2. CPU KULLANIMI ==="
top -bn1 | head -20

echo ""
echo "=== 3. EN ÇOK CPU KULLANAN PROCESS'LER ==="
ps aux --sort=-%cpu | head -11

echo ""
echo "=== 4. İZLEME SCRIPT ÇALIŞIYOR MU? ==="
ps aux | grep MONITOR_MALWARE.sh | grep -v grep || echo "✅ İzleme scripti çalışmıyor"

echo ""
echo "=== 5. PM2 DURUMU ==="
pm2 status

echo ""
echo "✅ Kontrol tamamlandı!"
