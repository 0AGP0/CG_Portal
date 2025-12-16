#!/bin/bash
# Zararlı cron job'ları temizle

echo "=== 1. MEVCUT CRON JOB'LARI GÖSTER ==="
crontab -l

echo ""
echo "=== 2. ZARARLI DOSYAYI SİL ==="
rm -rf /tmp/.est1 2>/dev/null && echo "✅ /tmp/.est1 silindi" || echo "⚠️ Zaten yok"

echo ""
echo "=== 3. ZARARLI CRON JOB'LARI SİL ==="
# Mevcut cron job'ları al, zararlı olanları filtrele, temiz olanları geri yaz
crontab -l 2>/dev/null | grep -v "\.est1\|\.b4nd1d0\|system3d\|51\.81\.104\.115\|nuts" > /tmp/cron_clean.txt 2>/dev/null

# Eğer temiz cron job varsa yükle
if [ -s /tmp/cron_clean.txt ]; then
    crontab /tmp/cron_clean.txt
    echo "✅ Zararlı cron job'lar silindi, temiz olanlar korundu"
else
    # Eğer hiç temiz cron job yoksa, tümünü sil
    crontab -r 2>/dev/null
    echo "✅ Tüm cron job'lar silindi (zararlı olanlar vardı)"
fi

rm -f /tmp/cron_clean.txt

echo ""
echo "=== 4. YENİ CRON JOB'LARI KONTROL ET ==="
crontab -l 2>/dev/null || echo "✅ Cron job yok (temiz)"

echo ""
echo "=== 5. ÇALIŞAN ZARARLI PROCESS'LERİ ÖLDÜR ==="
pkill -9 -f "\.b4nd1d0" 2>/dev/null
pkill -9 -f "\.est1" 2>/dev/null
pkill -9 -f "system3d" 2>/dev/null

echo ""
echo "=== 6. SON KONTROL ==="
ps aux | grep -i "\.b4nd1d0\|\.est1\|system3d" | grep -v grep || echo "✅ Zararlı process yok"

echo ""
echo "✅ Cron temizliği tamamlandı!"
