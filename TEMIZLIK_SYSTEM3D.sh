#!/bin/bash
# /tmp/.est1/.system3d zararlı dosyasını temizle ve kaynağını bul

echo "=== 1. ZARARLI DOSYAYI KONTROL ET ==="
ls -la /tmp/.est1/.system3d 2>/dev/null || echo "⚠️ Dosya bulunamadı (zaten silinmiş olabilir)"

echo ""
echo "=== 2. PROCESS ÇALIŞIYOR MU? ==="
ps aux | grep -i "system3d\|\.est1" | grep -v grep || echo "✅ Process çalışmıyor"

echo ""
echo "=== 3. DOSYAYI SİL ==="
rm -rf /tmp/.est1/.system3d 2>/dev/null && echo "✅ Dosya silindi" || echo "⚠️ Dosya zaten yok"
rm -rf /tmp/.est1 2>/dev/null && echo "✅ Dizin silindi" || echo "⚠️ Dizin zaten yok"

echo ""
echo "=== 4. TÜM /tmp/.est* DİZİNLERİNİ KONTROL ET ==="
find /tmp -type d -name ".est*" 2>/dev/null | while read dir; do
    echo "⚠️ Şüpheli dizin bulundu: $dir"
    ls -la "$dir" 2>/dev/null
    echo "Siliniyor..."
    rm -rf "$dir" 2>/dev/null
done
echo "✅ Kontrol tamamlandı"

echo ""
echo "=== 5. CRON JOB KONTROLÜ ==="
for user in $(cut -f1 -d: /etc/passwd); do
    crontab -u $user -l 2>/dev/null | grep -i "system3d\|\.est1\|/tmp/\.est" && echo "⚠️ Zararlı cron job bulundu: $user"
done

echo ""
echo "=== 6. SYSTEMD SERVİSLERİNİ KONTROL ET ==="
systemctl list-units --type=service --all | grep -i "system3d\|\.est1" || echo "✅ Systemd'de yok"

echo ""
echo "=== 7. /etc/rc.local KONTROL ET ==="
grep -i "system3d\|\.est1\|/tmp/\.est" /etc/rc.local 2>/dev/null && echo "⚠️ Zararlı kod bulundu!" || echo "✅ Temiz"

echo ""
echo "=== 8. /etc/profile VE .bashrc KONTROL ET ==="
grep -i "system3d\|\.est1\|/tmp/\.est" /etc/profile /etc/bash.bashrc ~/.bashrc 2>/dev/null && echo "⚠️ Zararlı kod bulundu!" || echo "✅ Temiz"

echo ""
echo "=== 9. /tmp DİZİNİNDEKİ TÜM GİZLİ DİZİNLERİ KONTROL ET ==="
find /tmp -type d -name ".*" -maxdepth 2 2>/dev/null | while read dir; do
    echo "Gizli dizin: $dir"
    ls -la "$dir" 2>/dev/null | head -10
done

echo ""
echo "=== 10. PROCESS'LERİN PARENT ID'SİNİ BUL ==="
ps aux | grep -E "system3d|\.est1" | grep -v grep | while read line; do
    PID=$(echo $line | awk '{print $2}')
    echo "Process: $line"
    ps -ef | grep -E "^\s*$PID" | head -1
done

echo ""
echo "=== 11. NETWORK BAĞLANTILARINI KONTROL ET ==="
netstat -anp | grep -E "ESTABLISHED|LISTEN" | grep -v "127.0.0.1\|::1" | head -20

echo ""
echo "=== 12. IPTABLES KURALLARINI GÜÇLENDİR ==="
# Zararlı IP'leri engelle
iptables -I INPUT 1 -s 51.81.104.115 -j DROP 2>/dev/null
iptables -I OUTPUT 1 -d 51.81.104.115 -j DROP 2>/dev/null
iptables -I INPUT 1 -s 194.69.203.32 -j DROP 2>/dev/null
iptables -I OUTPUT 1 -d 194.69.203.32 -j DROP 2>/dev/null

# /tmp dizininden çıkan bağlantıları engelle (opsiyonel - dikkatli kullan)
# iptables -A OUTPUT -m owner --uid-owner $(id -u) -o lo -j ACCEPT

echo ""
echo "=== 13. SON KONTROL ==="
ps aux | grep -i "system3d\|\.est1" | grep -v grep || echo "✅ Zararlı process yok"
ls -la /tmp/.est* 2>/dev/null || echo "✅ Zararlı dizin/dosya yok"

echo ""
echo "=== 14. PM2 LOG'LARINDA ZARARLI İÇERİK VAR MI? ==="
pm2 logs cg-portal --lines 100 --nostream 2>/dev/null | grep -i "system3d\|\.est1\|/tmp/\.est" || echo "✅ PM2 log'larında yok"

echo ""
echo "✅ Temizlik tamamlandı!"
