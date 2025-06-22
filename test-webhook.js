// Webhook test scripti - NodeJS ile çalıştırılır: node test-webhook.js
const fetch = require('node-fetch');

// Test verisi
const testData = {
  email: "burcu.shut@gmail.com",
  name: "Burcu Shut",
  phone: "+90 555 123 4567",
  stage: "BİTEN",
  process_started: true,
  language_level: "B1",
  language_certificate: "TestDaF",
  birth_date: "1997-05-29",
  birth_place: "Kocasinan",
  marital_status: "Bekar",
  financial_proof: "Garantör",
  exam_entry: true,
  exam_result_date: "2024-03-15",
  mother_name: "SELMA",
  mother_surname: "ŞAT",
  mother_birth_date: "1981-11-05",
  mother_birth_place: "KAYSERİ",
  mother_residence: "KAYSERİ/KOCASİNAN",
  father_name: "MURAT",
  father_surname: "ŞAT",
  father_birth_date: "1973-01-19",
  father_birth_place: "YOZGAT",
  father_residence: "KAYSERİ/KOCASİNAN"
};

// Webhook URL'i - localtunnel URL'inizi buraya yazın
const webhookUrl = 'https://campus-global.loca.lt/api/odoo-webhook';

// Webhook isteği gönder
async function sendWebhook() {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'your-webhook-secret'
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('Webhook yanıtı:', data);
  } catch (error) {
    console.error('Webhook hatası:', error);
  }
}

// Test fonksiyonunu çalıştır
sendWebhook(); 