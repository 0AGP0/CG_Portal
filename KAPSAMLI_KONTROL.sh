#!/bin/bash
# Kapsamlı sunucu ve proje kontrolü
# Tüm şüpheli aktiviteleri tespit eder

echo "=========================================="
echo "KAPSAMLI SUNUCU VE PROJE KONTROLÜ"
echo "=========================================="
echo "Tarih: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Şüpheli IP'ler
SUSPICIOUS_IPS=("51.81.104.115" "194.69.203.32")

# Şüpheli dosya/dizin isimleri
SUSPICIOUS_NAMES=("system3d" ".est1" ".b4nd1d0" "pACEd" "50oN" "jdCIjbm" "nuts" "systemhelper")

# Şüpheli process isimleri
SUSPICIOUS_PROCESSES=("system3d" ".est1" ".b4nd1d0" "pACEd" "50oN" "jdCIjbm" "nuts" "systemhelper" "51.81.104.115" "194.69.203.32")

FOUND_ISSUES=0

# 1. TÜM PROCESS'LERİ KONTROL ET
echo "=== 1. PROCESS KONTROLÜ ==="
echo "Tüm çalışan process'ler:"
ps aux | head -20
echo ""

echo "Şüpheli process'ler aranıyor..."
for proc in "${SUSPICIOUS_PROCESSES[@]}"; do
    FOUND=$(ps aux | grep -i "$proc" | grep -v grep)
    if [ ! -z "$FOUND" ]; then
        echo -e "${RED}⚠️  ŞÜPHELİ PROCESS: $proc${NC}"
        echo "$FOUND"
        FOUND_ISSUES=1
    fi
done

if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Şüpheli process bulunamadı${NC}"
fi
echo ""

# 2. SYSTEMHELPER KONTROLÜ
echo "=== 2. SYSTEMHELPER KONTROLÜ ==="
if [ -f "/usr/local/bin/systemhelper" ]; then
    echo -e "${RED}⚠️  SYSTEMHELPER DOSYASI BULUNDU!${NC}"
    echo "Dosya bilgileri:"
    ls -lah /usr/local/bin/systemhelper
    echo ""
    echo "Dosya içeriği (ilk 50 satır):"
    head -50 /usr/local/bin/systemhelper 2>/dev/null || file /usr/local/bin/systemhelper
    FOUND_ISSUES=1
else
    echo -e "${GREEN}✅ systemhelper dosyası bulunamadı${NC}"
fi
echo ""

# 3. NETWORK BAĞLANTILARI
echo "=== 3. NETWORK BAĞLANTILARI ==="
echo "Aktif network bağlantıları:"
netstat -anp 2>/dev/null | head -30 || ss -anp 2>/dev/null | head -30
echo ""

echo "Şüpheli IP'lere bağlantılar:"
for ip in "${SUSPICIOUS_IPS[@]}"; do
    CONN=$(netstat -anp 2>/dev/null | grep "$ip" || ss -anp 2>/dev/null | grep "$ip")
    if [ ! -z "$CONN" ]; then
        echo -e "${RED}⚠️  ŞÜPHELİ IP BAĞLANTISI: $ip${NC}"
        echo "$CONN"
        FOUND_ISSUES=1
    fi
done

if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Şüpheli network bağlantısı bulunamadı${NC}"
fi
echo ""

# 4. CRON JOB KONTROLÜ
echo "=== 4. CRON JOB KONTROLÜ ==="
echo "Root cron job'ları:"
crontab -l 2>/dev/null || echo "Cron job yok"
echo ""

echo "Tüm kullanıcıların cron job'ları:"
for user in $(cut -f1 -d: /etc/passwd); do
    CRON=$(crontab -u "$user" -l 2>/dev/null)
    if [ ! -z "$CRON" ]; then
        echo "Kullanıcı: $user"
        echo "$CRON"
        for proc in "${SUSPICIOUS_PROCESSES[@]}"; do
            if echo "$CRON" | grep -qi "$proc"; then
                echo -e "${RED}⚠️  ŞÜPHELİ CRON JOB BULUNDU!${NC}"
                FOUND_ISSUES=1
            fi
        done
    fi
done
echo ""

# 5. SİSTEM SERVİSLERİ
echo "=== 5. SİSTEM SERVİSLERİ ==="
echo "Tüm systemd servisleri:"
systemctl list-units --type=service --all 2>/dev/null | head -30
echo ""

for name in "${SUSPICIOUS_NAMES[@]}"; do
    SERVICE=$(systemctl list-units --type=service --all 2>/dev/null | grep -i "$name")
    if [ ! -z "$SERVICE" ]; then
        echo -e "${RED}⚠️  ŞÜPHELİ SERVİS: $name${NC}"
        echo "$SERVICE"
        FOUND_ISSUES=1
    fi
done
echo ""

# 6. /tmp DİZİNİ KONTROLÜ
echo "=== 6. /tmp DİZİNİ KONTROLÜ ==="
echo "/tmp içeriği:"
ls -lah /tmp | head -30
echo ""

echo "Şüpheli dosya/dizinler aranıyor..."
for name in "${SUSPICIOUS_NAMES[@]}"; do
    FOUND=$(find /tmp -maxdepth 3 -iname "*$name*" 2>/dev/null)
    if [ ! -z "$FOUND" ]; then
        echo -e "${RED}⚠️  ŞÜPHELİ DOSYA/DİZİN: $name${NC}"
        echo "$FOUND"
        for file in $FOUND; do
            if [ -f "$file" ]; then
                echo "  Dosya: $file"
                echo "  Boyut: $(du -sh "$file" 2>/dev/null | cut -f1)"
                echo "  İzinler: $(ls -lah "$file" 2>/dev/null | awk '{print $1, $3, $4}')"
                echo "  Tip: $(file "$file" 2>/dev/null | cut -d: -f2)"
            fi
        done
        FOUND_ISSUES=1
    fi
done
echo ""

# 7. PROJE DİZİNİ KONTROLÜ
echo "=== 7. PROJE DİZİNİ KONTROLÜ ==="
PROJECT_DIR="/var/www/CG_Portal"
if [ -d "$PROJECT_DIR" ]; then
    echo "Proje dizini: $PROJECT_DIR"
    echo "Dizin içeriği:"
    ls -lah "$PROJECT_DIR" | head -20
    echo ""
    
    echo "Şüpheli dosyalar aranıyor..."
    for name in "${SUSPICIOUS_NAMES[@]}"; do
        FOUND=$(find "$PROJECT_DIR" -maxdepth 5 -iname "*$name*" 2>/dev/null)
        if [ ! -z "$FOUND" ]; then
            echo -e "${RED}⚠️  PROJE İÇİNDE ŞÜPHELİ DOSYA: $name${NC}"
            echo "$FOUND"
            FOUND_ISSUES=1
        fi
    done
    
    echo ""
    echo "node_modules kontrolü:"
    if [ -d "$PROJECT_DIR/node_modules" ]; then
        echo "node_modules boyutu: $(du -sh "$PROJECT_DIR/node_modules" 2>/dev/null | cut -f1)"
        echo "Şüpheli modüller aranıyor..."
        for name in "${SUSPICIOUS_NAMES[@]}"; do
            FOUND=$(find "$PROJECT_DIR/node_modules" -maxdepth 3 -iname "*$name*" 2>/dev/null | head -5)
            if [ ! -z "$FOUND" ]; then
                echo -e "${RED}⚠️  NODE_MODULES İÇİNDE ŞÜPHELİ: $name${NC}"
                echo "$FOUND"
                FOUND_ISSUES=1
            fi
        done
    fi
else
    echo -e "${YELLOW}⚠️  Proje dizini bulunamadı: $PROJECT_DIR${NC}"
fi
echo ""

# 8. ROOT DİZİNİ KONTROLÜ
echo "=== 8. ROOT DİZİNİ KONTROLÜ ==="
echo "/root içeriği:"
ls -lah /root | head -20
echo ""

echo "Şüpheli dosyalar aranıyor..."
for name in "${SUSPICIOUS_NAMES[@]}"; do
    FOUND=$(find /root -maxdepth 3 -iname "*$name*" 2>/dev/null)
    if [ ! -z "$FOUND" ]; then
        echo -e "${RED}⚠️  ROOT DİZİNİNDE ŞÜPHELİ: $name${NC}"
        echo "$FOUND"
        FOUND_ISSUES=1
    fi
done
echo ""

# 9. GİZLİ DİZİNLER KONTROLÜ
echo "=== 9. GİZLİ DİZİNLER KONTROLÜ ==="
echo "/tmp altındaki gizli dizinler:"
find /tmp -maxdepth 2 -type d -name ".*" 2>/dev/null | grep -vE "^/tmp$|^/tmp/\.$|^/tmp/\.\.$"
echo ""

echo "/var/www altındaki gizli dizinler:"
find /var/www -maxdepth 3 -type d -name ".*" 2>/dev/null | head -10
echo ""

# 10. PM2 KONTROLÜ
echo "=== 10. PM2 KONTROLÜ ==="
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 durumu:"
    pm2 status
    echo ""
    echo "PM2 process'leri:"
    pm2 list
    echo ""
    echo "PM2 logları (son 20 satır):"
    pm2 logs --lines 20 --nostream 2>/dev/null || echo "Log okunamadı"
else
    echo -e "${YELLOW}⚠️  PM2 kurulu değil${NC}"
fi
echo ""

# 11. SON ÇALIŞTIRILAN KOMUTLAR
echo "=== 11. SON ÇALIŞTIRILAN KOMUTLAR ==="
echo "Bash history (son 30 komut):"
tail -30 ~/.bash_history 2>/dev/null || echo "History bulunamadı"
echo ""

# 12. SİSTEM KAYNAKLARI
echo "=== 12. SİSTEM KAYNAKLARI ==="
echo "CPU kullanımı:"
top -bn1 | head -5
echo ""
echo "Bellek kullanımı:"
free -h
echo ""
echo "Disk kullanımı:"
df -h | head -10
echo ""

# 13. AÇIK PORTLAR
echo "=== 13. AÇIK PORTLAR ==="
echo "Dinleyen portlar:"
netstat -tlnp 2>/dev/null | head -20 || ss -tlnp 2>/dev/null | head -20
echo ""

# ÖZET
echo "=========================================="
echo "KONTROL ÖZETİ"
echo "=========================================="
if [ $FOUND_ISSUES -eq 1 ]; then
    echo -e "${RED}⚠️  ŞÜPHELİ AKTİVİTELER TESPİT EDİLDİ!${NC}"
    echo ""
    echo "Öneriler:"
    echo "1. CLEAN_MALWARE.sh scriptini çalıştırın"
    echo "2. Şüpheli dosyaları manuel olarak kontrol edin"
    echo "3. systemhelper dosyasını inceleyin"
    echo "4. Sunucuyu yeniden başlatmayı düşünün"
else
    echo -e "${GREEN}✅ ŞÜPHELİ AKTİVİTE TESPİT EDİLMEDİ${NC}"
    echo ""
    echo "Not: Bu kontrol temel güvenlik kontrollerini içerir."
    echo "Eğer Hostinger hala zararlı yazılım tespit ediyorsa,"
    echo "proje kodunda veya çalışma zamanında bir sorun olabilir."
fi
echo ""
