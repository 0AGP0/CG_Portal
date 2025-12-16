#!/bin/bash
# CPU yükünü hızlıca kontrol et

echo "=== 1. EN ÇOK CPU KULLANAN PROCESS'LER (İLK 10) ==="
ps aux --sort=-%cpu | head -11

echo ""
echo "=== 2. SYSTEM LOAD ==="
uptime

echo ""
echo "=== 3. İZLEME SCRIPT ÇALIŞIYOR MU? ==="
ps aux | grep MONITOR_MALWARE.sh | grep -v grep || echo "✅ İzleme scripti çalışmıyor"

echo ""
echo "=== 4. PM2 DURUMU ==="
pm2 status

echo ""
echo "=== 5. TOP CPU PROCESS'LER (REALTIME) ==="
top -bn1 | head -20
