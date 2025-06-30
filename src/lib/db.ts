import { Pool } from 'pg';
import { logger } from '@/utils/logger';

if (!process.env.POSTGRES_PASSWORD) {
  throw new Error('POSTGRES_PASSWORD environment variable is not set');
}

// PostgreSQL bağlantı havuzu
export const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'cg_portal',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Bağlantı testi
pool.on('connect', () => {
  logger.info('Veritabanına bağlantı başarılı');
});

pool.on('error', (err) => {
  logger.error('Veritabanı bağlantı hatası:', err);
});

// Öğrenci işlemleri
export async function getStudentByEmail(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM students WHERE email = $1',
      [email]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Öğrenci getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getAdvisorByEmail(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM advisors WHERE email = $1',
      [email]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Danışman getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getStudentsByAdvisor(advisorEmail: string) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'documentType', d.document_type,
            'documentUrl', d.file_path,
            'documentName', d.file_name,
            'updatedAt', d.upload_date
          )
        ) FILTER (WHERE d.id IS NOT NULL) as documents
      FROM students s
      LEFT JOIN documents d ON s.id = d.student_id
      WHERE s.advisor_email = $1
      GROUP BY s.id, s.email, s.name, s.phone, s.stage, s.process_started, s.created_at, s.updated_at, s.advisor_id, s.advisor_email
      ORDER BY s.updated_at DESC
    `;

    const result = await client.query(query, [advisorEmail]);
    return result.rows;
  } catch (error) {
    logger.error('Danışman öğrencileri getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateStudentProcess(email: string, processStarted: boolean) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE students SET process_started = $1, updated_at = NOW() WHERE email = $2 RETURNING *',
      [processStarted, email]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Öğrenci süreç güncelleme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateStudentStage(email: string, stage: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE students SET stage = $1, updated_at = NOW() WHERE email = $2 RETURNING *',
      [stage, email]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Öğrenci aşama güncelleme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function saveDocument(studentId: string, documentType: string, filePath: string, fileName: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO documents (student_id, document_type, file_path, file_name, upload_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [studentId, documentType, filePath, fileName]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Döküman kaydetme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getDocumentsByStudentId(studentId: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM documents WHERE student_id = $1 ORDER BY upload_date DESC',
      [studentId]
    );
    return result.rows;
  } catch (error) {
    logger.error('Öğrenci dökümanları getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Veri tipleri
export interface CustomerRecord {
  email: string;
  name?: string;
  phone?: string;
  birth_date?: string;
  birth_place?: string;
  marital_status?: string;
  contact_address?: string;
  passport_number?: string;
  passport_type?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  issuing_authority?: string;
  high_school_name?: string;
  high_school_type?: string;
  high_school_city?: string;
  high_school_start_date?: string;
  high_school_graduation_date?: string;
  university_name?: string;
  university_department?: string;
  university_start_date?: string;
  university_end_date?: string;
  graduation_status?: string;
  graduation_year?: string;
  university_preferences?: string[];
  german_department_preference?: string;
  language_level?: string;
  language_certificate?: string;
  language_course_registration?: string;
  language_learning_status?: string;
  visa_consulate?: string;
  visa_application_date?: string;
  visa_appointment_date?: string;
  visa_document?: string;
  financial_proof?: string;
  financial_proof_status?: string;
  exam_entry?: string;
  exam_result_date?: string;
  mother_name?: string;
  mother_surname?: string;
  mother_birth_date?: string;
  mother_birth_place?: string;
  mother_residence?: string;
  mother_phone?: string;
  father_name?: string;
  father_surname?: string;
  father_birth_date?: string;
  father_birth_place?: string;
  father_residence?: string;
  father_phone?: string;
  stage?: string;
  process_started?: boolean;
  process_start_date?: string;
  advisor_email?: string;
  advisor_id?: string;
  advisor_name?: string;
  created_at?: string;
  updated_at?: string;
  documents?: Array<{
    id: string;
    documentType: string;
    documentName: string;
    documentUrl: string;
    uploadDate: string;
    status: string;
  }>;
}

// Tüm öğrencileri getir
export async function getAllStudents() {
  const client = await pool.connect();
  try {
    logger.info('getAllStudents: Veritabanı bağlantısı kuruldu');
    
    const query = `
      SELECT 
        s.*,
        a.name as advisor_name,
        a.email as advisor_email
      FROM students s
      LEFT JOIN advisors a ON s.advisor_id = a.id
      ORDER BY s.created_at DESC
    `;
    
    logger.info('getAllStudents: SQL sorgusu hazırlandı:', query);
    
    const result = await client.query(query);
    logger.info('getAllStudents: Sorgu sonucu:', { 
      rowCount: result.rowCount,
      rows: result.rows 
    });
    
    return result.rows;
  } catch (error) {
    logger.error('getAllStudents hatası:', error);
    throw error;
  } finally {
    client.release();
    logger.info('getAllStudents: Veritabanı bağlantısı kapatıldı');
  }
}

// Öğrenci profilini güncelle
export async function updateStudentProfile(email: string, data: Partial<CustomerRecord>) {
  let client;
  try {
    client = await pool.connect();
    
    // Güncellenebilir alanları belirle
    const updateFields = [
      'name', 'phone', 'birth_date', 'birth_place', 'marital_status',
      'contact_address', 'passport_number', 'passport_type',
      'passport_issue_date', 'passport_expiry_date', 'issuing_authority',
      'high_school_name', 'high_school_type', 'high_school_city',
      'high_school_start_date', 'high_school_graduation_date',
      'university_name', 'university_department', 'university_start_date',
      'university_end_date', 'graduation_status', 'graduation_year',
      'university_preferences', 'german_department_preference',
      'language_level', 'language_certificate', 'language_course_registration',
      'language_learning_status', 'visa_consulate', 'visa_application_date',
      'visa_appointment_date', 'visa_document', 'financial_proof',
      'financial_proof_status', 'exam_entry', 'exam_result_date',
      'mother_name', 'mother_surname', 'mother_birth_date',
      'mother_birth_place', 'mother_residence', 'mother_phone',
      'father_name', 'father_surname', 'father_birth_date',
      'father_birth_place', 'father_residence', 'father_phone'
    ] as const;

    // Güncellenecek alanları ve değerleri hazırla
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of updateFields) {
      const value = data[field as keyof typeof data];
      if (value !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('Güncellenecek alan bulunamadı');
    }

    // updated_at alanını ekle
    updates.push(`updated_at = NOW()`);
    values.push(email);

    const query = `
      UPDATE students 
      SET ${updates.join(', ')}
      WHERE email = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Öğrenci bulunamadı');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Öğrenci profil güncelleme hatası:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Öğrenci belgesi ekle
export async function addStudentDocument(email: string, document: {
  documentType: string;
  documentName: string;
  documentUrl: string;
}) {
  let client;
  try {
    client = await pool.connect();
    
    const query = `
      INSERT INTO documents (
        student_email,
        document_type,
        file_name,
        file_path,
        upload_date,
        status
      ) VALUES ($1, $2, $3, $4, NOW(), 'pending')
      RETURNING *
    `;

    const values = [
      email,
      document.documentType,
      document.documentName,
      document.documentUrl
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Belge ekleme hatası:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Öğrenci belgesini güncelle
export async function updateStudentDocument(documentId: string, status: string) {
  let client;
  try {
    client = await pool.connect();
    
    const query = `
      UPDATE documents 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(query, [status, documentId]);
    
    if (result.rows.length === 0) {
      throw new Error('Belge bulunamadı');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Belge güncelleme hatası:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Öğrenci sürecini başlat
export async function startStudentProcess(email: string, advisorEmail: string) {
  let client;
  try {
    client = await pool.connect();
    
    const query = `
      UPDATE students 
      SET 
        process_started = true,
        process_start_date = NOW(),
        stage = 'Süreç Başlatıldı',
        advisor_email = $1,
        updated_at = NOW()
      WHERE email = $2
      RETURNING *
    `;

    const result = await client.query(query, [advisorEmail, email]);
    
    if (result.rows.length === 0) {
      throw new Error('Öğrenci bulunamadı');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Öğrenci süreç başlatma hatası:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Yeni öğrenci oluştur
export async function createStudent(data: Partial<CustomerRecord>) {
  let client;
  try {
    client = await pool.connect();
    
    const query = `
      INSERT INTO students (
        email,
        name,
        phone,
        stage,
        process_started,
        created_at,
        updated_at,
        advisor_id,
        advisor_name,
        advisor_email
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.email,
      data.name,
      data.phone || '',
      data.stage || 'new',
      data.process_started || false,
      data.advisor_id || null,
      data.advisor_name || null,
      data.advisor_email || null
    ];

    const result = await client.query(query, values);
    logger.info('Yeni öğrenci oluşturuldu:', { email: data.email });
    return result.rows[0];
  } catch (error) {
    logger.error('Öğrenci oluşturma hatası:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Veritabanı tablolarını oluştur
export async function createTables() {
  let client;
  try {
    client = await pool.connect();
    
    // Öğrenciler tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        stage VARCHAR(100) DEFAULT 'new',
        process_started BOOLEAN DEFAULT FALSE,
        process_start_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        advisor_id INTEGER REFERENCES advisors(id),
        advisor_name VARCHAR(255),
        advisor_email VARCHAR(255),
        sales_id VARCHAR(255),
        sales_name VARCHAR(255),
        sales_email VARCHAR(255),
        lead_id VARCHAR(255),
        contact_address TEXT,
        age INTEGER,
        birth_date DATE,
        birth_place VARCHAR(255),
        marital_status VARCHAR(50),
        passport_number VARCHAR(50),
        passport_type VARCHAR(100),
        passport_issue_date DATE,
        passport_expiry_date DATE,
        issuing_authority VARCHAR(255),
        pnr_number VARCHAR(50),
        visa_application_date DATE,
        visa_appointment_date DATE,
        visa_document VARCHAR(255),
        visa_consulate VARCHAR(255),
        has_been_to_germany BOOLEAN DEFAULT FALSE,
        high_school_name VARCHAR(255),
        high_school_type VARCHAR(100),
        high_school_city VARCHAR(255),
        high_school_start_date DATE,
        high_school_graduation_date DATE,
        university_name VARCHAR(255),
        university_department VARCHAR(255),
        university_start_date DATE,
        university_end_date DATE,
        graduation_status VARCHAR(50),
        graduation_year INTEGER,
        university_preferences TEXT[],
        german_department_preference VARCHAR(255),
        language_level VARCHAR(50),
        language_certificate VARCHAR(255),
        language_course_registration VARCHAR(255),
        language_learning_status VARCHAR(50),
        financial_proof VARCHAR(255),
        financial_proof_status VARCHAR(50),
        exam_entry BOOLEAN DEFAULT FALSE,
        exam_result_date DATE,
        mother_name VARCHAR(255),
        mother_surname VARCHAR(255),
        mother_birth_date DATE,
        mother_birth_place VARCHAR(255),
        mother_residence VARCHAR(255),
        mother_phone VARCHAR(50),
        father_name VARCHAR(255),
        father_surname VARCHAR(255),
        father_birth_date DATE,
        father_birth_place VARCHAR(255),
        father_residence VARCHAR(255),
        father_phone VARCHAR(50),
        webhook_updated BOOLEAN DEFAULT FALSE,
        webhook_update_timestamp TIMESTAMP WITH TIME ZONE
      );
    `);

    // Danışmanlar tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS advisors (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Mesajlar tablosu
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

    logger.info('Veritabanı tabloları başarıyla oluşturuldu');
  } catch (error) {
    logger.error('Veritabanı tabloları oluşturma hatası:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Uygulama başladığında tabloları oluştur
createTables().catch(error => {
  logger.error('Tablolar oluşturulurken hata:', error);
  process.exit(1);
});

export default pool; 

// Mesaj işlemleri
export async function createMessage(data: {
  senderEmail: string;
  receiverEmail: string;
  senderRole: 'student' | 'advisor';
  content: string;
  subject?: string;
  category?: string;
  replyToId?: number;
}) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO messages (sender_email, receiver_email, sender_role, content, subject, category, reply_to_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        data.senderEmail.toLowerCase(),
        data.receiverEmail.toLowerCase(),
        data.senderRole,
        data.content,
        data.subject || null,
        data.category || 'general',
        data.replyToId || null
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Mesaj oluşturma hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getMessagesByUser(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM messages 
       WHERE sender_email = $1 OR receiver_email = $1 
       ORDER BY created_at DESC`,
      [email.toLowerCase()]
    );
    return result.rows;
  } catch (error) {
    logger.error('Kullanıcı mesajları getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getConversationsByUser(email: string) {
  const client = await pool.connect();
  try {
    // Kullanıcının katıldığı tüm konuşmaları getir
    const result = await client.query(
      `SELECT DISTINCT 
         CASE 
           WHEN sender_email = $1 THEN receiver_email 
           ELSE sender_email 
         END as other_participant,
         MIN(created_at) as first_message,
         MAX(created_at) as last_message,
         COUNT(*) as message_count,
         SUM(CASE WHEN is_read = false AND receiver_email = $1 THEN 1 ELSE 0 END) as unread_count
       FROM messages 
       WHERE sender_email = $1 OR receiver_email = $1 
       GROUP BY other_participant
       ORDER BY last_message DESC`,
      [email.toLowerCase()]
    );
    return result.rows;
  } catch (error) {
    logger.error('Kullanıcı konuşmaları getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getMessagesBetweenUsers(user1: string, user2: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM messages 
       WHERE (sender_email = $1 AND receiver_email = $2) 
          OR (sender_email = $2 AND receiver_email = $1) 
       ORDER BY created_at ASC`,
      [user1.toLowerCase(), user2.toLowerCase()]
    );
    return result.rows;
  } catch (error) {
    logger.error('İki kullanıcı arası mesajlar getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function markMessageAsRead(messageId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE messages SET is_read = true WHERE id = $1 RETURNING *',
      [messageId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Mesaj okundu işaretleme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getUnreadMessageCount(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_email = $1 AND is_read = false',
      [email.toLowerCase()]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    logger.error('Okunmamış mesaj sayısı getirme hatası:', error);
    throw error;
  } finally {
    client.release();
  }
} 