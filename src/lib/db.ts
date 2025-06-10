import { Pool } from 'pg';
import { logger } from '@/utils/logger';

if (!process.env.POSTGRES_PASSWORD) {
  throw new Error('POSTGRES_PASSWORD environment variable is not set');
}

// PostgreSQL bağlantı havuzu
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'campus_global',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Bağlantı havuzu olaylarını dinle
pool.on('connect', () => {
  logger.info('PostgreSQL veritabanına bağlandı');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL bağlantı hatası:', err);
});

// Bağlantıyı test et
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('PostgreSQL bağlantı testi başarılı');
    return true;
  } catch (error) {
    logger.error('PostgreSQL bağlantı testi başarısız:', error);
    return false;
  }
}

// Başlangıçta bağlantıyı test et
testConnection();

// Öğrenci kaydını e-posta ile getir
export async function getStudentByEmail(email: string) {
  let client;
  try {
    logger.info('Öğrenci verisi getiriliyor:', { email });
    
    client = await pool.connect();
    
    // Önce öğrenci bilgilerini çek
    const studentQuery = `
      SELECT 
        id,
        email,
        name,
        phone,
        birth_date,
        birth_place,
        marital_status,
        stage,
        advisor_id,
        advisor_name,
        advisor_email,
        contact_address,
        passport_number,
        passport_type,
        passport_issue_date,
        passport_expiry_date,
        issuing_authority,
        high_school_name,
        high_school_type,
        high_school_city,
        high_school_start_date,
        high_school_graduation_date,
        university_name,
        university_department,
        university_start_date,
        university_end_date,
        graduation_status,
        graduation_year,
        university_preferences,
        german_department_preference,
        language_level,
        language_certificate,
        language_course_registration,
        language_learning_status,
        visa_consulate,
        visa_application_date,
        visa_appointment_date,
        visa_document,
        financial_proof,
        financial_proof_status,
        exam_entry,
        exam_result_date,
        process_started,
        process_start_date,
        created_at,
        updated_at,
        mother_name,
        mother_surname,
        mother_birth_date,
        mother_birth_place,
        mother_residence,
        mother_phone,
        father_name,
        father_surname,
        father_birth_date,
        father_birth_place,
        father_residence,
        father_phone
      FROM students 
      WHERE email = $1
    `;

    const studentResult = await client.query(studentQuery, [email]);
    
    if (studentResult.rows.length === 0) {
      logger.warn('Öğrenci bulunamadı:', { email });
      return null;
    }

    // Sonra dökümanları çek
    const documentsQuery = `
      SELECT 
        id,
        file_name as "name",
        document_type as "type",
        status,
        upload_date as "uploadedAt",
        file_path as "url",
        notes
      FROM documents 
      WHERE student_id = $1
    `;

    const documentsResult = await client.query(documentsQuery, [studentResult.rows[0].id]);
    
    // Öğrenci verisini ve dökümanları birleştir
    const student = {
      ...studentResult.rows[0],
      documents: documentsResult.rows || []
    };

    logger.info('Öğrenci verisi başarıyla getirildi');
    return student;
  } catch (error) {
    logger.error('Öğrenci verisi getirme hatası:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Danışmanın öğrencilerini getir
export async function getStudentsByAdvisor(advisorEmail: string) {
  try {
    const query = `
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'documentType', d.document_type,
            'documentUrl', d.document_url,
            'documentName', d.document_name,
            'updatedAt', d.updated_at
          )
        ) FILTER (WHERE d.id IS NOT NULL) as documents
      FROM students s
      LEFT JOIN documents d ON s.email = d.student_email
      WHERE s.advisor_email = $1
      GROUP BY s.email
      ORDER BY s.updated_at DESC
    `;

    const result = await pool.query(query, [advisorEmail]);
    return result.rows;
  } catch (error) {
    logger.error('Danışman öğrencileri getirme hatası:', error);
    throw error;
  }
}

// Danışman bilgilerini getir
export async function getAdvisorByEmail(email: string) {
  try {
    const query = `
      SELECT 
        a.*,
        json_agg(s.email) FILTER (WHERE s.email IS NOT NULL) as student_emails
      FROM advisors a
      LEFT JOIN students s ON a.email = s.advisor_email
      WHERE a.email = $1
      GROUP BY a.email
    `;

    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const advisor = result.rows[0];
    advisor.studentIds = advisor.student_emails || [];
    delete advisor.student_emails;
    
    return advisor;
  } catch (error) {
    logger.error('Danışman verisi getirme hatası:', error);
    throw error;
  }
}

export default pool; 