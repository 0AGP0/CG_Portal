# 🚨 ACİL GÜVENLİK TEMİZLİĞİ

## Tespit Edilen Zararlı Process'ler

Sunucuda şu zararlı process'ler çalışıyor:
- `busybox wget` ve `curl` ile zararlı script indirme
- `http://51.81.104.115/nuts/x86` - Zararlı binary indirme
- `http://51.81.104.115/nuts/bolts` - Zararlı script indirme

## ACİL YAPILACAKLAR

### 1. Zararlı Process'leri Durdur
```bash
# Process ID'leri bul
ps aux | grep -i "wget\|curl\|51.81.104.115\|nuts"

# Process'leri öldür (PID'leri yukarıdaki komuttan al)
kill -9 2443 2444

# Veya tüm zararlı process'leri toplu öldür
pkill -f "51.81.104.115"
pkill -f "nuts"
pkill -f "busybox wget"
```

### 2. Zararlı Dosyaları Sil
```bash
# /dev dizininde zararlı dosyalar
rm -f /dev/x86
rm -f /dev/bolts
rm -f /dev/nuts

# /tmp dizininde kontrol
ls -la /tmp/ | grep -i "x86\|bolts\|nuts"
rm -f /tmp/x86 /tmp/bolts /tmp/nuts

# Tüm sistemde arama
find / -name "x86" -type f 2>/dev/null
find / -name "bolts" -type f 2>/dev/null
find / -name "nuts" -type f 2>/dev/null
```

### 3. Cron Job'ları Kontrol Et
```bash
# Tüm kullanıcıların cron job'larını kontrol et
crontab -l
crontab -l -u root

# Zararlı cron job'ları sil
crontab -e
# Veya
crontab -r  # DİKKAT: Tüm cron job'ları siler!
```

### 4. Network Bağlantılarını Kontrol Et
```bash
# 51.81.104.115 IP'sine bağlantı var mı
netstat -an | grep 51.81.104.115

# Aktif bağlantıları kontrol et
netstat -an | grep ESTABLISHED | wc -l

# Şüpheli bağlantıları göster
netstat -anp | grep ESTABLISHED
```

### 5. Sistem Servislerini Kontrol Et
```bash
# Sistem servislerini listele
systemctl list-units --type=service --state=running

# Şüpheli servisleri kontrol et
systemctl status | grep -i "nuts\|x86\|bolts"
```

### 6. PM2 Process'lerini Kontrol Et
```bash
# PM2 process'lerini listele
pm2 list

# PM2 log'larını kontrol et
pm2 logs cg-portal --lines 100 | grep -i "wget\|curl\|51.81.104.115"
```

### 7. Firewall Kuralları Ekle
```bash
# 51.81.104.115 IP'sini engelle
iptables -A INPUT -s 51.81.104.115 -j DROP
iptables -A OUTPUT -d 51.81.104.115 -j DROP

# 194.69.203.32 IP'sini de engelle (önceki exploit)
iptables -A INPUT -s 194.69.203.32 -j DROP
iptables -A OUTPUT -d 194.69.203.32 -j DROP

# Kuralları kaydet
iptables-save > /etc/iptables/rules.v4
```

### 8. Sistem Güncellemeleri
```bash
# Sistem güncellemelerini kontrol et
apt update
apt upgrade -y

# Güvenlik yamalarını uygula
apt-get install unattended-upgrades
```

## ÖNLEMİCİ TEDBİRLER

1. **Webhook Güvenliği**: ✅ Eklendi (zararlı içerik kontrolü)
2. **Rate Limiting**: ✅ Eklendi
3. **Firewall**: Yukarıdaki komutlarla zararlı IP'leri engelle
4. **Monitoring**: Sürekli process ve network izleme

## KONTROL KOMUTLARI

```bash
# Her 5 dakikada bir kontrol et
watch -n 300 'ps aux | grep -i "wget\|curl\|51.81.104.115"'

# Log'ları izle
tail -f /var/log/syslog | grep -i "wget\|curl\|51.81.104.115"
```

## ⚠️ ÖNEMLİ

- Bu zararlı process'ler muhtemelen bir miner veya botnet script'i
- Sunucu kaynaklarını (CPU/RAM) tüketiyor olabilir
- Ağ trafiğini artırıyor olabilir
- Hemen durdurulmalı ve temizlenmeli
