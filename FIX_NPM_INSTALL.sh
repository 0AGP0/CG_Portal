#!/bin/bash
# npm install hatasını düzeltmek için script

echo "=== NPM INSTALL HATASI DÜZELTME ==="
echo ""

# 1. PM2'yi durdur
echo "1. PM2 durduruluyor..."
pm2 stop cg-portal 2>/dev/null || true
pm2 delete cg-portal 2>/dev/null || true
echo "✅ PM2 durduruldu"
echo ""

# 2. node_modules'ı tamamen sil
echo "2. node_modules temizleniyor..."
rm -rf node_modules
echo "✅ node_modules silindi"
echo ""

# 3. package-lock.json'ı sil (opsiyonel, ama bazen gerekli)
echo "3. package-lock.json temizleniyor..."
rm -f package-lock.json
echo "✅ package-lock.json silindi"
echo ""

# 4. npm cache temizle
echo "4. npm cache temizleniyor..."
npm cache clean --force
echo "✅ npm cache temizlendi"
echo ""

# 5. .next build klasörünü temizle
echo "5. .next build klasörü temizleniyor..."
rm -rf .next
echo "✅ .next temizlendi"
echo ""

# 6. npm install (temiz kurulum)
echo "6. npm install çalıştırılıyor..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install başarısız! Lütfen hataları kontrol edin."
    exit 1
fi
echo "✅ npm install başarılı"
echo ""

# 7. Build oluştur
echo "7. Build oluşturuluyor..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build başarısız! Lütfen hataları kontrol edin."
    exit 1
fi
echo "✅ Build başarılı"
echo ""

# 8. PM2'yi başlat
echo "8. PM2 başlatılıyor..."
pm2 start npm --name "cg-portal" -- start
pm2 save
echo "✅ PM2 başlatıldı"
echo ""

# 9. Durum kontrolü
echo "=== DURUM KONTROLÜ ==="
pm2 status
echo ""
echo "✅ Tüm işlemler tamamlandı!"
