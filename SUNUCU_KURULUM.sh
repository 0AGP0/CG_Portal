#!/bin/bash
# Sunucuda çalıştırılacak kurulum scripti
# CVE-2025-55182 (React2Shell) güvenlik yaması

echo "=========================================="
echo "GÜVENLİK YAMASI KURULUMU"
echo "CVE-2025-55182 (React2Shell)"
echo "=========================================="
echo ""

# 1. Git'ten son değişiklikleri çek
echo "=== 1. GİT GÜNCELLEMESİ ==="
cd /var/www/CG_Portal || { echo "❌ Dizin bulunamadı: /var/www/CG_Portal"; exit 1; }
git fetch origin
git pull origin main
echo "✅ Git güncellemesi tamamlandı"
echo ""

# 2. Zararlı yazılımları tespit et
echo "=== 2. ZARARLI YAZILIM TESPİTİ ==="
chmod +x DETECT_MALWARE.sh
./DETECT_MALWARE.sh
DETECT_EXIT=$?
if [ $DETECT_EXIT -eq 1 ]; then
    echo ""
    echo "⚠️  ZARARLI YAZILIM TESPİT EDİLDİ!"
    echo "Temizleme için CLEAN_MALWARE.sh çalıştırılacak..."
    echo ""
    read -p "Temizlemeye devam etmek istiyor musunuz? (evet/hayır): " confirm
    if [ "$confirm" = "evet" ]; then
        chmod +x CLEAN_MALWARE.sh
        echo "evet" | ./CLEAN_MALWARE.sh
    else
        echo "Temizleme atlandı. Lütfen manuel olarak temizleyin."
    fi
else
    echo "✅ Zararlı yazılım tespit edilmedi"
fi
echo ""

# 3. Bağımlılıkları güncelle
echo "=== 3. BAĞIMLILIK GÜNCELLEMESİ ==="
npm install
echo "✅ Bağımlılıklar güncellendi"
echo ""

# 4. Eski build'i temizle
echo "=== 4. BUILD TEMİZLİĞİ ==="
rm -rf .next
echo "✅ Eski build temizlendi"
echo ""

# 5. Yeni build oluştur
echo "=== 5. YENİ BUILD OLUŞTURMA ==="
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build hatası! Lütfen hataları kontrol edin."
    exit 1
fi
echo "✅ Build başarılı"
echo ""

# 6. PM2'yi yeniden başlat
echo "=== 6. PM2 YENİDEN BAŞLATMA ==="
pm2 restart cg-portal
if [ $? -ne 0 ]; then
    echo "⚠️  PM2 restart başarısız, start denenecek..."
    pm2 start npm --name "cg-portal" -- start
fi
pm2 save
echo "✅ PM2 yeniden başlatıldı"
echo ""

# 7. Sürekli izleme scriptini başlat
echo "=== 7. SÜREKLI İZLEME BAŞLATMA ==="
# Önceki izleme process'ini durdur
pkill -f "MONITOR_MALWARE.sh" 2>/dev/null || true
sleep 2

# Yeni izlemeyi başlat
chmod +x MONITOR_MALWARE.sh
nohup ./MONITOR_MALWARE.sh > malware_monitor.log 2>&1 &
echo "✅ Sürekli izleme başlatıldı (PID: $!)"
echo "   Log dosyası: malware_monitor.log"
echo ""

# 8. Son kontrol
echo "=== 8. SON KONTROL ==="
echo "PM2 Durumu:"
pm2 status
echo ""
echo "İzleme Process'i:"
ps aux | grep "MONITOR_MALWARE.sh" | grep -v grep || echo "⚠️  İzleme process'i bulunamadı"
echo ""

echo "=========================================="
echo "✅ KURULUM TAMAMLANDI"
echo "=========================================="
echo ""
echo "Yapılanlar:"
echo "  ✓ Git güncellemesi"
echo "  ✓ Zararlı yazılım tespiti/temizliği"
echo "  ✓ Bağımlılık güncellemesi"
echo "  ✓ Build oluşturma"
echo "  ✓ PM2 yeniden başlatma"
echo "  ✓ Sürekli izleme başlatma"
echo ""
echo "Öneriler:"
echo "  1. DETECT_MALWARE.sh'i düzenli çalıştırın"
echo "  2. malware_monitor.log dosyasını kontrol edin"
echo "  3. PM2 logs cg-portal ile uygulama loglarını izleyin"
echo ""
