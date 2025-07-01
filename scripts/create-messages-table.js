const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'cg_portal',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: false
});

async function createMessagesTable() {
  const client = await pool.connect();
  
  try {
    console.log('Messages tablosu oluşturuluyor...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_email VARCHAR(255) NOT NULL,
        receiver_email VARCHAR(255) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        subject VARCHAR(255),
        category VARCHAR(50) DEFAULT 'general',
        reply_to_id INTEGER REFERENCES messages(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        CONSTRAINT valid_sender_role CHECK (sender_role IN ('student', 'advisor'))
      );
    `);
    
    console.log('✅ Messages tablosu başarıyla oluşturuldu!');
    
    // Tablo yapısını kontrol et
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'messages' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Messages tablosu yapısı:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${row.column_default ? `DEFAULT: ${row.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Messages tablosu oluşturulurken hata:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createMessagesTable()
  .then(() => {
    console.log('\n🎉 Script başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script hatası:', error);
    process.exit(1);
  }); 