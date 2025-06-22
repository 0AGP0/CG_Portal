// LocalTunnel URL'si ile webhook testi
// node test-external-webhook.js
const https = require('https');

// LocalTunnel URL'nizi buraya girin
const LOCALTUNNEL_URL = 'https://mighty-points-pull.loca.lt';
const WEBHOOK_URL = `${LOCALTUNNEL_URL}/api/odoo-webhook?secret=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;

// Odoo'dan gelen örnek webhook payload'ı
const testData = {
  "_action": "Send Webhook Notification(#1962)",
  "_id": 123,
  "_model": "res.partner",
  "contact_address": "Kartaltepe, Babacan Port Royal, Malazgirt Cd. No:6 A2 Blok D:3, Küçükçekmece\n\nİstanbul  34295\nTürkiye",
  "id": 123,
  "name": "AKİLE BURCU ŞAT",
  "phone": false,
  "x_studio_mail_adresi": "burcu.shut@gmail.com",
  "x_studio_selection_field_8en_1iqnrqang": "BİTEN"
};

const postData = JSON.stringify(testData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`Webhook testi başlıyor: ${WEBHOOK_URL}`);
console.log(`Gönderilen veri: ${postData.substring(0, 100)}...`);

// HTTPS isteğini oluştur
const req = https.request(WEBHOOK_URL, options, (res) => {
  console.log(`\nSTATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\nWebhook yanıtı:');
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      if (jsonResponse.success) {
        console.log('\n✅ Webhook başarıyla işlendi!');
        console.log('📝 Bu URL\'yi Odoo webhook ayarlarına ekleyin:');
        console.log(`${WEBHOOK_URL}`);
      } else {
        console.log('\n❌ Webhook işlenirken hata oluştu!');
      }
    } catch (e) {
      console.log('Raw response:', responseData);
      console.log('\n❌ Geçersiz JSON yanıtı!');
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ İstek hatası: ${e.message}`);
  console.log('LocalTunnel\'ın çalıştığından ve Next.js sunucunuzun aktif olduğundan emin olun.');
});

// Veriyi gönder
req.write(postData);
req.end();

console.log('\nWebhook isteği gönderildi, yanıt bekleniyor...'); 