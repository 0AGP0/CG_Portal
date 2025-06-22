import { createTables } from '../lib/db';
import { logger } from '../lib/logger';

async function migrate() {
  try {
    logger.info('Veritabanı tabloları oluşturuluyor...');
    await createTables();
    logger.info('Veritabanı tabloları başarıyla oluşturuldu!');
  } catch (error) {
    logger.error('Veritabanı tabloları oluşturulurken hata:', error);
    process.exit(1);
  }
}

migrate(); 