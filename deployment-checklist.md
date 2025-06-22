# Production Deployment Checklist

## ✅ Ön Hazırlık

### Sunucu Hazırlığı
- [ ] VPS sunucusu alındı (Hostinger)
- [ ] SSH erişimi kuruldu
- [ ] Domain adı ayarlandı
- [ ] SSL sertifikası hazırlandı

### Sistem Gereksinimleri
- [ ] Node.js 18+ yüklendi
- [ ] PostgreSQL yüklendi
- [ ] Nginx yüklendi (opsiyonel)
- [ ] PM2 yüklendi

## ✅ Uygulama Hazırlığı

### Kod Kontrolü
- [ ] Tüm JSON dosyaları veritabanına aktarıldı
- [ ] Environment değişkenleri production için hazırlandı
- [ ] Build test edildi
- [ ] Lint hataları düzeltildi

### Güvenlik Kontrolü
- [ ] JWT_SECRET değiştirildi
- [ ] API_TOKEN değiştirildi
- [ ] POSTGRES_PASSWORD güçlü şifre yapıldı
- [ ] Rate limiting aktif
- [ ] Security headers eklendi

## ✅ Veritabanı Hazırlığı

### PostgreSQL Kurulumu
- [ ] PostgreSQL servisi başlatıldı
- [ ] cg_portal veritabanı oluşturuldu
- [ ] Kullanıcı oluşturuldu ve yetkilendirildi
- [ ] Tablolar oluşturuldu
- [ ] Veriler aktarıldı

### Backup Stratejisi
- [ ] Otomatik backup scripti hazırlandı
- [ ] Backup dizini oluşturuldu
- [ ] Cron job ayarlandı

## ✅ Deployment

### Dosya Yükleme
- [ ] Proje sunucuya yüklendi
- [ ] node_modules yüklendi
- [ ] .env dosyası oluşturuldu
- [ ] Production build yapıldı

### Uygulama Başlatma
- [ ] PM2 ile uygulama başlatıldı
- [ ] PM2 startup ayarlandı
- [ ] Port 3000 açıldı
- [ ] Uygulama erişilebilir durumda

### Nginx Konfigürasyonu
- [ ] Nginx config dosyası oluşturuldu
- [ ] Domain yönlendirmesi ayarlandı
- [ ] SSL sertifikası eklendi
- [ ] Proxy ayarları yapıldı

## ✅ Test

### Fonksiyonel Test
- [ ] Ana sayfa yükleniyor
- [ ] Login sistemi çalışıyor
- [ ] Öğrenci paneli erişilebilir
- [ ] Danışman paneli erişilebilir
- [ ] Admin paneli erişilebilir
- [ ] Mesaj sistemi çalışıyor
- [ ] Döküman yükleme çalışıyor

### Performans Test
- [ ] Sayfa yükleme hızları kabul edilebilir
- [ ] API response süreleri uygun
- [ ] Veritabanı sorguları optimize
- [ ] Memory kullanımı normal

### Güvenlik Test
- [ ] HTTPS çalışıyor
- [ ] JWT authentication çalışıyor
- [ ] Rate limiting aktif
- [ ] SQL injection koruması var
- [ ] XSS koruması var

## ✅ Monitoring

### Logging
- [ ] Error logları aktif
- [ ] Access logları aktif
- [ ] PM2 logları izleniyor
- [ ] Nginx logları aktif

### Monitoring
- [ ] PM2 monitoring aktif
- [ ] Server resource monitoring
- [ ] Database monitoring
- [ ] Uptime monitoring

## ✅ Backup & Recovery

### Backup
- [ ] Database backup scripti hazır
- [ ] File backup scripti hazır
- [ ] Otomatik backup çalışıyor
- [ ] Backup dosyaları güvenli yerde

### Recovery
- [ ] Restore prosedürü test edildi
- [ ] Disaster recovery planı hazır
- [ ] Rollback prosedürü hazır

## ✅ Documentation

### Kullanıcı Dokümantasyonu
- [ ] Admin kullanım kılavuzu
- [ ] Danışman kullanım kılavuzu
- [ ] Öğrenci kullanım kılavuzu

### Teknik Dokümantasyon
- [ ] API dokümantasyonu
- [ ] Database şeması
- [ ] Deployment prosedürü
- [ ] Troubleshooting kılavuzu

## ✅ Go-Live

### Son Kontroller
- [ ] Tüm testler geçti
- [ ] Performance kabul edilebilir
- [ ] Güvenlik kontrolleri tamamlandı
- [ ] Backup sistemi çalışıyor

### Canlıya Geçiş
- [ ] Domain DNS ayarları yapıldı
- [ ] SSL sertifikası aktif
- [ ] Uygulama canlıda erişilebilir
- [ ] Monitoring sistemleri aktif

### Post-Launch
- [ ] İlk 24 saat monitoring
- [ ] Kullanıcı geri bildirimleri toplandı
- [ ] Gerekli düzeltmeler yapıldı
- [ ] Performance optimizasyonları

## 🔧 Environment Variables (Production)

```bash
# Production .env dosyası
NODE_ENV=production
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=localhost
POSTGRES_DATABASE=cg_portal
POSTGRES_PORT=5432
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
API_TOKEN=your-api-token-here-change-this-in-production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ODOO_API_URL=https://your-odoo-instance.com/api
ODOO_API_KEY=your-odoo-api-key
WEBHOOK_SECRET=your-webhook-secret-here
```

## 🚀 Deployment Commands

```bash
# Sunucuda çalıştırılacak komutlar
npm install
npm run build:prod
pm2 start npm --name "cg-portal" -- start:prod
pm2 startup
pm2 save
```

## 📞 Emergency Contacts

- **Developer:** [Your Contact]
- **Server Admin:** [Hostinger Support]
- **Database Admin:** [Your Contact] 