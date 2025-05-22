// Odoo veri çekme API test scripti
// node test-odoo-pull.js
const http = require('http');
const fs = require('fs');

const pullUrl = 'http://localhost:3000/api/odoo-pull?secret=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&email=burcu.shut@gmail.com';

// HTTP GET isteği gönder
http.get(pullUrl, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:');
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      // Başarılı yanıt alındıysa, customers.json dosyasının güncel durumunu kontrol et
      if (jsonResponse.success && jsonResponse.student) {
        try {
          const customersFile = './data/customers.json';
          const customers = JSON.parse(fs.readFileSync(customersFile, 'utf8'));
          
          // burcu.shut@gmail.com öğrencisini bul
          const student = customers.customers.find(s => s.email === 'burcu.shut@gmail.com');
          
          if (student) {
            console.log('\nMevcut öğrenci verisi:');
            console.log(JSON.stringify(student, null, 2));
          }
        } catch (error) {
          console.error('Müşteri verisi okuma hatası:', error);
        }
      }
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
}).on('error', (e) => {
  console.error(`İstek hatası: ${e.message}`);
});

console.log('Odoo veri çekme isteği gönderildi...'); 