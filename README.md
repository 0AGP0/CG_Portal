# Campus Global Portal

Next.js tabanlı öğrenci ve danışman yönetim sistemi.

## Özellikler

- Öğrenci kayıt ve takip sistemi
- Danışman paneli
- Mesajlaşma sistemi
- Döküman yönetimi
- Vize süreç takibi
- Admin paneli

## Teknolojiler

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes
- **Veritabanı:** PostgreSQL
- **Styling:** Tailwind CSS
- **Authentication:** JWT
- **Deployment:** VPS (Hostinger)

## Kurulum

### Geliştirme Ortamı

1. **Bağımlılıkları yükle:**
```bash
npm install
```

2. **Environment değişkenlerini ayarla:**
```bash
# .env.local dosyası oluştur
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_DATABASE=cg_portal
POSTGRES_PORT=5432
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
API_TOKEN=your-api-token-here
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. **Veritabanını hazırla:**
```bash
# PostgreSQL'de cg_portal veritabanını oluştur
# Tablolar otomatik oluşturulacak
```

4. **Uygulamayı başlat:**
```bash
npm run dev
```

### Production Deployment

1. **VPS Sunucusu Hazırlığı:**
```bash
# Node.js 18+ yükle
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL yükle
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Nginx yükle (opsiyonel)
sudo apt-get install nginx
```

2. **Projeyi sunucuya yükle:**
```bash
# Git ile klonla
git clone your-repository-url
cd CG_Portal-main

# Bağımlılıkları yükle
npm install

# Production build
npm run build:prod
```

3. **Environment değişkenlerini ayarla:**
```bash
# .env dosyası oluştur (env.production.example'ı kopyala)
cp env.production.example .env

# Değerleri güncelle:
NODE_ENV=production
POSTGRES_PASSWORD=your_secure_password
NEXT_PUBLIC_APP_URL=https://your-domain.com
JWT_SECRET=your-super-secret-jwt-key-change-this
API_TOKEN=your-api-token-here-change-this
```

4. **Veritabanını hazırla:**
```bash
# PostgreSQL'de veritabanı oluştur
sudo -u postgres psql
CREATE DATABASE cg_portal;
CREATE USER cg_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cg_portal TO cg_user;
\q

# Tablolar otomatik oluşturulacak
```

5. **Uygulamayı başlat:**
```bash
# PM2 ile process yönetimi
npm install -g pm2
pm2 start npm --name "cg-portal" -- start:prod
pm2 startup
pm2 save
```

6. **Nginx Konfigürasyonu (Opsiyonel):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/student` - Öğrenci girişi
- `POST /api/auth/advisor` - Danışman girişi
- `POST /api/auth/admin` - Admin girişi

### Students
- `GET /api/student/[email]` - Öğrenci bilgileri
- `PUT /api/student/[email]` - Öğrenci güncelleme
- `GET /api/student/messages` - Öğrenci mesajları

### Advisors
- `GET /api/advisor/students` - Danışman öğrencileri
- `GET /api/advisor/[email]` - Danışman bilgileri
- `POST /api/advisor/start-process` - Süreç başlatma

### Messages
- `GET /api/messages` - Mesajları listele
- `POST /api/messages/send` - Mesaj gönder
- `POST /api/messages/[id]/read` - Mesajı okundu işaretle

## Veritabanı Yapısı

### Tablolar
- `students` - Öğrenci bilgileri
- `advisors` - Danışman bilgileri
- `messages` - Mesajlar
- `documents` - Dökümanlar

## Güvenlik

- JWT token authentication
- Rate limiting
- SQL injection koruması
- XSS koruması
- CSRF koruması

## Monitoring

- PM2 process monitoring
- Error logging
- Performance monitoring

## Backup

```bash
# Veritabanı yedekleme
pg_dump cg_portal > backup_$(date +%Y%m%d_%H%M%S).sql

# Dosya yedekleme
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/app
```

## Troubleshooting

### Yaygın Sorunlar

1. **Veritabanı bağlantı hatası:**
   - PostgreSQL servisinin çalıştığından emin ol
   - Environment değişkenlerini kontrol et

2. **Port çakışması:**
   - `lsof -i :3000` ile port kullanımını kontrol et
   - Gerekirse port değiştir

3. **Memory hatası:**
   - Node.js memory limitini artır: `NODE_OPTIONS="--max-old-space-size=4096"`

## Lisans

Bu proje özel kullanım için geliştirilmiştir.
