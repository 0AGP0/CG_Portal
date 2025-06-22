const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Environment değişkenlerini manuel olarak ayarla
process.env.POSTGRES_USER = 'postgres';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_DATABASE = 'cg_portal';
process.env.POSTGRES_PASSWORD = 'postgres';
process.env.POSTGRES_PORT = '5432';

// PostgreSQL bağlantı havuzu
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'cg_portal',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateMessages() {
  const client = await pool.connect();
  
  try {
    console.log('Mesaj verilerini JSON\'dan veritabanına aktarma başlatılıyor...');
    
    // JSON dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    if (!fs.existsSync(filePath)) {
      console.log('messages.json dosyası bulunamadı, aktarma işlemi atlanıyor.');
      return;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`${data.conversations.length} konuşma bulundu.`);
    
    // Her konuşma için mesajları aktar
    for (const conversation of data.conversations) {
      console.log(`Konuşma aktarılıyor: ${conversation.subject}`);
      
      for (const message of conversation.messages) {
        // Mesajı veritabanına ekle
        const query = `
          INSERT INTO messages (
            sender_email, 
            receiver_email, 
            sender_role, 
            content, 
            subject, 
            category, 
            created_at, 
            is_read
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `;
        
        const values = [
          message.senderEmail.toLowerCase(),
          message.senderRole === 'student' ? conversation.advisorEmail.toLowerCase() : conversation.studentEmail.toLowerCase(),
          message.senderRole,
          message.content,
          conversation.subject,
          'general',
          new Date(message.timestamp),
          message.isRead
        ];
        
        await client.query(query, values);
      }
    }
    
    console.log('Mesaj verileri başarıyla aktarıldı!');
    
    // Aktarılan verileri kontrol et
    const result = await client.query('SELECT COUNT(*) as count FROM messages');
    console.log(`Veritabanında toplam ${result.rows[0].count} mesaj bulunuyor.`);
    
  } catch (error) {
    console.error('Mesaj aktarma hatası:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Scripti çalıştır
migrateMessages()
  .then(() => {
    console.log('Aktarma işlemi tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Aktarma işlemi başarısız:', error);
    process.exit(1);
  }); 