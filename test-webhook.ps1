# Odoo webhook test scripti
$url = "http://localhost:3000/api/odoo-webhook?secret=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

$jsonData = @"
{
    "_action": "Send Webhook Notification(#1962)",
    "_id": 123,
    "_model": "res.partner",
    "contact_address": "Kartaltepe, Babacan Port Royal, Malazgirt Cd. No:6 A2 Blok D:3, Küçükçekmece\n\nİstanbul  34295\nTürkiye",
    "id": 123,
    "name": "AKİLE BURCU ŞAT",
    "phone": false,
    "x_studio_almanca_sertifikas": "A2 - ÖSD - 26 Ağustos",
    "x_studio_almanca_seviyesi_1": "Bilmiyorum",
    "x_studio_almanya_bulunma": false,
    "x_studio_anne_ad": "SELMA",
    "x_studio_anne_doum_tarihi": "1981-11-05",
    "x_studio_anne_doum_yeri": "KAYSERİ",
    "x_studio_anne_ikamet_sehrilke": "KAYSERİ/KOCASİNAN",
    "x_studio_anne_soyad": "ŞAT",
    "x_studio_anne_telefon": false,
    "x_studio_baba_ad": "MURAT",
    "x_studio_baba_doum_tarihi": "1973-01-19",
    "x_studio_baba_doum_yeri": "YOZGAT",
    "x_studio_baba_ikamet_ehrilkesi": "KAYSERİ/KOCASİNAN",
    "x_studio_baba_soyad": "ŞAT",
    "x_studio_baba_telefon": false,
    "x_studio_bilgiler_1": false,
    "x_studio_de_blm_tercihi": false,
    "x_studio_dil_kursu_kayt": false,
    "x_studio_dil_renim_durumu": false,
    "x_studio_dil_sertifikas": false,
    "x_studio_doum_tarihi": "1997-05-29",
    "x_studio_doum_yeri": "Kocasinan",
    "x_studio_finansal_kant": "Garantör",
    "x_studio_geerlilik_tarihi": "16.11.2033",
    "x_studio_konsolosluk_1": "İstanbul",
    "x_studio_lise_ad": "ÖZEL GENÇ SULTAN ANADOLU LİSESİ",
    "x_studio_lise_balang_tarihi_1": false,
    "x_studio_lise_biti_tarihi": "12.06.2015",
    "x_studio_lise_ehir": "KAYSERİ",
    "x_studio_lise_tr": "ANADOLU",
    "x_studio_maddi_kant_durumu": false,
    "x_studio_mail_adresi": "burcu.shut@gmail.com",
    "x_studio_medeni_durum_1": "Bekar",
    "x_studio_mezuniyet_durumu": "Üniversite",
    "x_studio_mezuniyet_yl": "09.07.2020",
    "x_studio_niversite_ad": "ERCİYES ÜNİVERSİTESİ",
    "x_studio_niversite_balang_tarihi": "06.09.2017",
    "x_studio_niversite_biti_tarihi": "09.07.2020",
    "x_studio_niversite_blm_ad": "İNGİLİZCE ÖĞRETMENLİĞİ",
    "x_studio_niversite_tercihleri": false,
    "x_studio_pasaport_numaras": "U30684829",
    "x_studio_pasaport_tr": "Umuma Mahsus (Bordo) Pasaport",
    "x_studio_pnr_numaras": "IDTY23PL8MZ",
    "x_studio_selection_field_8en_1iqnrqang": "BİTEN",
    "x_studio_sym_snav_giri": true,
    "x_studio_sym_yerlestirme_sonuc_tarihi": "23.07.2015",
    "x_studio_veren_makam": "MELİKGAZİ",
    "x_studio_verili_tarihi": "16.11.2023",
    "x_studio_vize_bavuru_tarihi_1": "2024-06-21",
    "x_studio_vize_randevu_belgesi": false,
    "x_studio_vize_randevu_tarihi": "2024-07-16",
    "x_studio_ya": 27
}
"@

# Curl kullanarak HTTP POST isteği gönder
Write-Host "Webhook test ediliyor..."
$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $jsonData -Headers $headers
    Write-Host "Başarılı yanıt alındı:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Hata oluştu: $_"
    Write-Host "Durum Kodu: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Yanıt: $($_.Exception.Response)"
} 