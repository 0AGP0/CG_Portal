# Güvenlik Yaması - CVE-2025-55182 (React2Shell)

## Yapılan Değişiklikler

### 1. Bağımlılık Güncellemeleri
- **Next.js**: 15.3.1 → 15.3.6 (CVE-2025-55182 yamalı)
- **React**: 19.0.0 → 19.0.1 (CVE-2025-55182 yamalı)
- **React-DOM**: 19.0.0 → 19.0.1 (CVE-2025-55182 yamalı)
- **eslint-config-next**: 15.3.1 → 15.3.6

### 2. Zararlı Yazılım Tespit Scriptleri

#### DETECT_MALWARE.sh
Zararlı yazılımları tespit eden kapsamlı script:
- Zararlı dosya/dizin tespiti (`/tmp/.est1/.system3d` vb.)
- Zararlı process tespiti
- Şüpheli network bağlantıları
- Zararlı cron job'ları
- Şüpheli sistem servisleri

**Kullanım:**
```bash
chmod +x DETECT_MALWARE.sh
./DETECT_MALWARE.sh
```

#### CLEAN_MALWARE.sh
Zararlı yazılımları temizleyen script:
- Zararlı process'leri durdurur
- Zararlı dosya/dizinleri siler
- Şüpheli network bağlantılarını keser
- Zararlı cron job'ları temizler
- Firewall kuralları ekler

**Kullanım:**
```bash
chmod +x CLEAN_MALWARE.sh
./CLEAN_MALWARE.sh
```

#### MONITOR_MALWARE.sh (Güncellendi)
Sürekli izleme scripti - her 30 saniyede bir kontrol eder:
- Geliştirilmiş dosya tespiti
- Şüpheli network bağlantı kontrolü
- Daha kapsamlı zararlı içerik tespiti

**Kullanım:**
```bash
chmod +x MONITOR_MALWARE.sh
./MONITOR_MALWARE.sh
```

### 3. API Güvenlik İyileştirmeleri

#### Middleware Güncellemeleri
- React2Shell saldırı desenlerini tespit eder
- URL parametrelerini kontrol eder
- POST/PUT/PATCH isteklerinde body kontrolü
- Zararlı içerik tespiti

#### Webhook Route Güvenlik
- Zararlı pattern'ler zaten mevcut
- Nested object kontrolü
- Gelişmiş logging

## Acil Eylem Planı

### 1. Sunucuda Yapılacaklar

```bash
# 1. Zararlı yazılımları tespit et
cd /var/www/CG_Portal
chmod +x DETECT_MALWARE.sh
./DETECT_MALWARE.sh

# 2. Zararlı yazılımları temizle
chmod +x CLEAN_MALWARE.sh
./CLEAN_MALWARE.sh

# 3. Bağımlılıkları güncelle
npm install

# 4. Uygulamayı yeniden build et
rm -rf .next
npm run build

# 5. PM2'yi yeniden başlat
pm2 restart cg-portal

# 6. Sürekli izlemeyi başlat
chmod +x MONITOR_MALWARE.sh
nohup ./MONITOR_MALWARE.sh > malware_monitor.log 2>&1 &
```

### 2. Tespit Edilen Zararlı Dosyalar

Hostinger tarafından tespit edilen:
- `/tmp/.est1/.system3d` - Zararlı binary
- `/tmp/.est1/` - Zararlı dizin

Bu dosyalar CVE-2025-55182 (React2Shell) açığı kullanılarak yüklenmiş olabilir.

### 3. Önleme Önlemleri

1. **Firewall Kuralları**: Şüpheli IP'ler engellendi
   - 51.81.104.115
   - 194.69.203.32

2. **Rate Limiting**: API endpoint'lerde sıkı rate limiting

3. **Input Validation**: Tüm input'larda zararlı içerik kontrolü

4. **Sürekli İzleme**: MONITOR_MALWARE.sh scripti çalışıyor

## Güvenlik Kontrol Listesi

- [x] Next.js ve React versiyonları güncellendi
- [x] Zararlı yazılım tespit scriptleri oluşturuldu
- [x] Temizleme scripti oluşturuldu
- [x] İzleme scripti güncellendi
- [x] Middleware güvenlik kontrolleri eklendi
- [ ] Sunucuda scriptler çalıştırıldı
- [ ] Bağımlılıklar güncellendi
- [ ] Uygulama yeniden build edildi
- [ ] Sürekli izleme başlatıldı

## Notlar

- CVE-2025-55182 (React2Shell) kritik bir güvenlik açığıdır (CVSS 10.0)
- Saldırganlar bu açığı kullanarak kimlik doğrulama olmadan RCE yapabiliyor
- Tespit edilen zararlı yazılımlar genellikle kripto madenci yazılımları
- Düzenli olarak DETECT_MALWARE.sh çalıştırılmalı
- MONITOR_MALWARE.sh sürekli çalışmalı

## İletişim

Herhangi bir sorun tespit edilirse:
1. DETECT_MALWARE.sh çalıştırın
2. CLEAN_MALWARE.sh ile temizleyin
3. Sunucuyu yeniden başlatın
4. MONITOR_MALWARE.sh'i başlatın
