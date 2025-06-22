// Veritabanı fonksiyonları testi
// node test-db.js
const fs = require('fs');
const path = require('path');

// Veritabanı fonksiyonlarını simüle edelim 
async function getRecordByEmail(email) {
  try {
    // JSON dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Email alanına göre müşteri ara
    const customer = data.customers.find(c => 
      c.email.toLowerCase() === email.toLowerCase()
    );
    
    return customer || null;
  } catch (error) {
    console.error('Veri okuma hatası:', error);
    return null;
  }
}

async function updateOrCreateRecord(data) {
  if (!data.email) {
    throw new Error('Email alanı zorunludur');
  }
  
  console.log('updateOrCreateRecord başlatıldı:', data.email);
  
  try {
    // JSON dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const existingIndex = db.customers.findIndex(c => 
      c.email.toLowerCase() === data.email.toLowerCase()
    );
    
    console.log('Mevcut kayıt durumu:', existingIndex >= 0 ? 'Mevcut kayıt bulundu' : 'Yeni kayıt oluşturulacak');
    
    if (existingIndex >= 0) {
      // Mevcut kaydı güncelle
      const updatedRecord = {
        ...db.customers[existingIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      db.customers[existingIndex] = updatedRecord;
      
      // Değişiklikleri kaydet
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
      console.log('Kayıt güncelleme sonucu: Başarılı');
      
      return updatedRecord;
    } else {
      // Yeni kayıt oluştur
      const newRecord = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: data.documents || []
      };
      
      db.customers.push(newRecord);
      
      // Değişiklikleri kaydet
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
      console.log('Yeni kayıt oluşturma sonucu: Başarılı');
      
      return newRecord;
    }
  } catch (error) {
    console.error('updateOrCreateRecord hatası:', error);
    throw error;
  }
}

// Odoo'dan gelen webhook verisi
const webhookData = {
  "_action": "Send Webhook Notification(#1962)",
  "_id": 123,
  "_model": "res.partner",
  "id": 123,
  "name": "AKİLE BURCU ŞAT",
  "x_studio_mail_adresi": "burcu.shut@gmail.com",
  "x_studio_selection_field_8en_1iqnrqang": "BİTEN"
};

// Test prosedürünü başlat
async function runTest() {
  console.log('Webhook testi başlatılıyor...');
  
  try {
    const email = webhookData.email || webhookData.x_studio_mail_adresi;
    
    // Önce öğrenci kaydını kontrol et
    const existingStudent = await getRecordByEmail(email);
    
    if (!existingStudent) {
      console.error('Eşleşen öğrenci bulunamadı:', email);
      return;
    }
    
    console.log('Eşleşen öğrenci bulundu:', existingStudent.name);
    
    // Webhook verilerini hazırla
    const customerData = {
      email: email,
      lead_id: webhookData.id || webhookData._id,
      name: webhookData.name,
      stage: webhookData.x_studio_selection_field_8en_1iqnrqang || existingStudent.stage || 'yeni',
      webhook_updated: true,
      webhook_update_timestamp: new Date().toISOString()
    };
    
    // Veriyi güncelle
    const result = await updateOrCreateRecord(customerData);
    
    console.log('Güncelleme sonucu:', result);
    console.log('Test başarıyla tamamlandı!');
  } catch (error) {
    console.error('Test hatası:', error);
  }
}

// Testi çalıştır
runTest(); 