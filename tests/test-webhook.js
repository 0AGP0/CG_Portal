const fetch = require('node-fetch');

// Test verisi - Odoo formatında
const testData = {
  x_studio_mail_adresi: "burcu.shut@gmail.com",
  name: "AKİLE BURCU ŞAT",
  phone: "+90 555 123 4567",
  x_studio_selection_field_8en_1iqnrqang: "BİTEN",
  process_started: true,
  x_studio_almanca_seviyesi_1: "B1",
  x_studio_almanca_sertifikas: "TestDaF",
  x_studio_doum_tarihi: "1997-05-29",
  x_studio_doum_yeri: "Kocasinan",
  x_studio_medeni_durum_1: "Bekar",
  x_studio_finansal_kant: "Garantör",
  x_studio_sym_snav_giri: true,
  x_studio_sym_yerlestirme_sonuc_tarihi: "2024-03-15",
  x_studio_anne_ad: "SELMA",
  x_studio_anne_soyad: "ŞAT",
  x_studio_anne_doum_tarihi: "1981-11-05",
  x_studio_anne_doum_yeri: "KAYSERİ",
  x_studio_anne_ikamet_sehrilke: "KAYSERİ/KOCASİNAN",
  x_studio_baba_ad: "MURAT",
  x_studio_baba_soyad: "ŞAT",
  x_studio_baba_doum_tarihi: "1973-01-19",
  x_studio_baba_doum_yeri: "YOZGAT",
  x_studio_baba_ikamet_ehrilkesi: "KAYSERİ/KOCASİNAN"
};

// Webhook URL'i ve secret
const secret = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const webhookUrl = `https://thin-trees-raise.loca.lt/api/odoo-webhook?secret=${secret}`;

// Webhook isteği gönder
async function sendWebhook() {
  try {
    console.log('Webhook isteği gönderiliyor...');
    console.log('URL:', webhookUrl);
    console.log('Veri:', JSON.stringify(testData, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('\nWebhook yanıtı:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('\nWebhook hatası:', error);
  }
}

// Test fonksiyonunu çalıştır
sendWebhook(); 