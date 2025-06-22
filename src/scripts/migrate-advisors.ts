import { pool } from '../lib/db';
import { logger } from '../lib/logger';
import fs from 'fs/promises';
import path from 'path';

async function migrateAdvisors() {
  const client = await pool.connect();
  try {
    // JSON dosyasını oku
    const jsonPath = path.join(process.cwd(), 'data', 'advisors.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const { advisors } = JSON.parse(jsonData);

    // Her danışman için
    for (const advisor of advisors) {
      // Önce danışmanı ekle
      const insertAdvisorQuery = `
        INSERT INTO advisors (email, name, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name,
            updated_at = NOW()
        RETURNING id;
      `;
      
      const advisorResult = await client.query(insertAdvisorQuery, [
        advisor.email,
        advisor.name
      ]);
      
      const advisorId = advisorResult.rows[0].id;
      
      // Öğrencilerin advisor_id'lerini güncelle
      if (advisor.studentIds && advisor.studentIds.length > 0) {
        const updateStudentsQuery = `
          UPDATE students
          SET advisor_id = $1,
              advisor_email = $2,
              updated_at = NOW()
          WHERE email = ANY($3);
        `;
        
        await client.query(updateStudentsQuery, [
          advisorId,
          advisor.email,
          advisor.studentIds
        ]);
      }
      
      logger.info(`Danışman başarıyla aktarıldı: ${advisor.email}`);
    }
    
    logger.info('Tüm danışmanlar başarıyla aktarıldı');
  } catch (error) {
    logger.error('Danışman aktarım hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Script'i çalıştır
migrateAdvisors().catch(error => {
  logger.error('Script çalıştırma hatası:', error);
  process.exit(1);
}); 