const https = require('https');

// Test verisi
const testData = {
  x_studio_mail_adresi: "burcu.shut@gmail.com",
  name: "AKİLE BURCU ŞAT",
  x_studio_selection_field_8en_1iqnrqang: "BİTEN"
};

// Webhook URL'i ve secret
const secret = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const hostname = 'rich-mammals-grab.loca.lt';
const path = `/api/odoo-webhook?secret=${secret}`;

// POST verisi
const postData = JSON.stringify(testData);

// İstek seçenekleri
const options = {
  hostname: hostname,
  port: 443,
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('\n=== WEBHOOK TEST İSTEĞİ ===');
console.log('URL:', `https://${hostname}${path}`);
console.log('Veri:', postData);

// İsteği gönder
const req = https.request(options, (res) => {
  console.log('\nDurum Kodu:', res.statusCode);
  console.log('Headers:', res.headers);

  res.setEncoding('utf8');
  let rawData = '';
  
  res.on('data', (chunk) => { rawData += chunk; });
  
  res.on('end', () => {
    try {
      console.log('\nYanıt:', rawData);
    } catch (e) {
      console.error('\nYanıt işleme hatası:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('\nBağlantı hatası:', e.message);
});

// Veriyi gönder
req.write(postData);
req.end();

console.log('\nİstek gönderildi, yanıt bekleniyor...'); 