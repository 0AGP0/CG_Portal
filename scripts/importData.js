const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// PostgreSQL bağlantı bilgileri
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cg_portal',
  password: 'postgres',
  port: 5432,
});

// Tarih dönüştürme yardımcı fonksiyonu
function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr === false) return null;
  
  // Eğer zaten Date objesi ise
  if (dateStr instanceof Date) return dateStr;
  
  // Unix timestamp kontrolü
  if (!isNaN(dateStr) && dateStr.toString().length === 10) {
    return new Date(parseInt(dateStr) * 1000);
  }

  try {
    // DD.MM.YYYY veya DD/MM/YYYY formatı
    if (dateStr.includes('.') || dateStr.includes('/')) {
      const [day, month, year] = dateStr.split(/[./]/);
      return new Date(year, month - 1, day);
    }
    
    // ISO format (YYYY-MM-DD)
    return new Date(dateStr);
  } catch (error) {
    console.warn(`Geçersiz tarih formatı: ${dateStr}`);
    return null;
  }
}

// Yıl çıkarma fonksiyonu
function extractYear(dateStr) {
  if (!dateStr) return null;
  if (dateStr === false) return null;
  
  try {
    // DD.MM.YYYY veya DD/MM/YYYY formatı
    if (dateStr.includes('.') || dateStr.includes('/')) {
      const [_, __, year] = dateStr.split(/[./]/);
      return parseInt(year);
    }
    
    // ISO format (YYYY-MM-DD)
    if (dateStr.includes('-')) {
      return parseInt(dateStr.split('-')[0]);
    }
    
    // Sadece yıl
    const year = parseInt(dateStr);
    if (!isNaN(year) && year > 1900 && year < 2100) {
      return year;
    }
    
    return null;
  } catch (error) {
    console.warn(`Geçersiz yıl formatı: ${dateStr}`);
    return null;
  }
}

async function importData() {
  try {
    const jsonData = await fs.readFile(
      path.join(__dirname, '../data/customers.json'),
      'utf8'
    );
    const { customers } = JSON.parse(jsonData);
    
    console.log(`Toplam ${customers.length} kayıt aktarılacak...`);
    let successCount = 0;
    let errorCount = 0;
    let updateCount = 0;

    for (const customer of customers) {
      try {
        // Hata ayıklama için kayıt detaylarını göster
        if (customer.email === 'burcu.shut@gmail.com') {
          console.log('Hata alınan kayıt detayları:');
          console.log(JSON.stringify(customer, null, 2));
          
          // Tarih alanlarını kontrol et
          const dateFields = [
            'passport_issue_date',
            'passport_expiry_date',
            'visa_application_date',
            'visa_appointment_date',
            'high_school_start_date',
            'high_school_graduation_date',
            'university_start_date',
            'university_end_date',
            'birth_date',
            'mother_birth_date',
            'father_birth_date',
            'exam_result_date'
          ];

          console.log('\nTarih alanları kontrolü:');
          for (const field of dateFields) {
            if (customer[field]) {
              console.log(`${field}: ${customer[field]} (${typeof customer[field]})`);
              const parsedDate = parseDate(customer[field]);
              console.log(`Dönüştürülmüş: ${parsedDate}`);
            }
          }
        }

        const query = `
          INSERT INTO students (
            email, name, phone, stage, process_started, created_at, updated_at,
            process_start_date, advisor_id, advisor_name, advisor_email,
            sales_id, sales_name, sales_email, lead_id, contact_address,
            age, passport_number, passport_type, passport_issue_date,
            passport_expiry_date, issuing_authority, pnr_number,
            visa_application_date, visa_appointment_date, visa_document,
            consulate, has_been_to_germany, high_school_name, high_school_type,
            high_school_city, high_school_start_date, high_school_graduation_date,
            university_name, university_department, university_start_date,
            university_end_date, graduation_status, graduation_year,
            university_preferences, german_department_preference, language_level,
            language_certificate, language_course_registration, language_learning_status,
            birth_date, birth_place, marital_status, financial_proof,
            financial_proof_status, exam_entry, exam_result_date, mother_name,
            mother_surname, mother_birth_date, mother_birth_place, mother_residence,
            mother_phone, father_name, father_surname, father_birth_date,
            father_birth_place, father_residence, father_phone, webhook_updated,
            webhook_update_timestamp, visa_consulate
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
            $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58,
            $59, $60, $61, $62, $63, $64, $65, $66, $67)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            stage = EXCLUDED.stage,
            process_started = EXCLUDED.process_started,
            created_at = EXCLUDED.created_at,
            updated_at = CURRENT_TIMESTAMP,
            process_start_date = EXCLUDED.process_start_date,
            advisor_id = EXCLUDED.advisor_id,
            advisor_name = EXCLUDED.advisor_name,
            advisor_email = EXCLUDED.advisor_email,
            sales_id = EXCLUDED.sales_id,
            sales_name = EXCLUDED.sales_name,
            sales_email = EXCLUDED.sales_email,
            lead_id = EXCLUDED.lead_id,
            contact_address = EXCLUDED.contact_address,
            age = EXCLUDED.age,
            passport_number = EXCLUDED.passport_number,
            passport_type = EXCLUDED.passport_type,
            passport_issue_date = EXCLUDED.passport_issue_date,
            passport_expiry_date = EXCLUDED.passport_expiry_date,
            issuing_authority = EXCLUDED.issuing_authority,
            pnr_number = EXCLUDED.pnr_number,
            visa_application_date = EXCLUDED.visa_application_date,
            visa_appointment_date = EXCLUDED.visa_appointment_date,
            visa_document = EXCLUDED.visa_document,
            consulate = EXCLUDED.consulate,
            has_been_to_germany = EXCLUDED.has_been_to_germany,
            high_school_name = EXCLUDED.high_school_name,
            high_school_type = EXCLUDED.high_school_type,
            high_school_city = EXCLUDED.high_school_city,
            high_school_start_date = EXCLUDED.high_school_start_date,
            high_school_graduation_date = EXCLUDED.high_school_graduation_date,
            university_name = EXCLUDED.university_name,
            university_department = EXCLUDED.university_department,
            university_start_date = EXCLUDED.university_start_date,
            university_end_date = EXCLUDED.university_end_date,
            graduation_status = EXCLUDED.graduation_status,
            graduation_year = EXCLUDED.graduation_year,
            university_preferences = EXCLUDED.university_preferences,
            german_department_preference = EXCLUDED.german_department_preference,
            language_level = EXCLUDED.language_level,
            language_certificate = EXCLUDED.language_certificate,
            language_course_registration = EXCLUDED.language_course_registration,
            language_learning_status = EXCLUDED.language_learning_status,
            birth_date = EXCLUDED.birth_date,
            birth_place = EXCLUDED.birth_place,
            marital_status = EXCLUDED.marital_status,
            financial_proof = EXCLUDED.financial_proof,
            financial_proof_status = EXCLUDED.financial_proof_status,
            exam_entry = EXCLUDED.exam_entry,
            exam_result_date = EXCLUDED.exam_result_date,
            mother_name = EXCLUDED.mother_name,
            mother_surname = EXCLUDED.mother_surname,
            mother_birth_date = EXCLUDED.mother_birth_date,
            mother_birth_place = EXCLUDED.mother_birth_place,
            mother_residence = EXCLUDED.mother_residence,
            mother_phone = EXCLUDED.mother_phone,
            father_name = EXCLUDED.father_name,
            father_surname = EXCLUDED.father_surname,
            father_birth_date = EXCLUDED.father_birth_date,
            father_birth_place = EXCLUDED.father_birth_place,
            father_residence = EXCLUDED.father_residence,
            father_phone = EXCLUDED.father_phone,
            webhook_updated = EXCLUDED.webhook_updated,
            webhook_update_timestamp = EXCLUDED.webhook_update_timestamp,
            visa_consulate = EXCLUDED.visa_consulate
          RETURNING *;`;

        const values = [
          customer.email || null,
          customer.name || null,
          customer.phone || null,
          customer.stage || null,
          customer.processStarted || false,
          customer.createdAt ? new Date(customer.createdAt) : null,
          customer.updatedAt ? new Date(customer.updatedAt) : null,
          customer.processStartDate ? new Date(customer.processStartDate) : null,
          customer.advisorId || null,
          customer.advisorName || null,
          customer.advisorEmail || null,
          customer.salesId || null,
          customer.salesName || null,
          customer.salesEmail || null,
          customer.lead_id || null,
          customer.contact_address || null,
          customer.age || null,
          customer.passport_number || null,
          customer.passport_type || null,
          parseDate(customer.passport_issue_date),
          parseDate(customer.passport_expiry_date),
          customer.issuing_authority || null,
          customer.pnr_number || null,
          parseDate(customer.visa_application_date),
          parseDate(customer.visa_appointment_date),
          customer.visa_document || false,
          customer.consulate || null,
          customer.has_been_to_germany || false,
          customer.high_school_name || null,
          customer.high_school_type || null,
          customer.high_school_city || null,
          parseDate(customer.high_school_start_date),
          parseDate(customer.high_school_graduation_date),
          customer.university_name || null,
          customer.university_department || null,
          parseDate(customer.university_start_date),
          parseDate(customer.university_end_date),
          customer.graduation_status || null,
          extractYear(customer.graduation_year),
          customer.university_preferences || null,
          customer.german_department_preference || null,
          customer.language_level || null,
          customer.language_certificate || null,
          customer.language_course_registration || false,
          customer.language_learning_status || false,
          parseDate(customer.birth_date),
          customer.birth_place || null,
          customer.marital_status || null,
          customer.financial_proof || null,
          customer.financial_proof_status || false,
          customer.exam_entry || false,
          parseDate(customer.exam_result_date),
          customer.mother_name || null,
          customer.mother_surname || null,
          parseDate(customer.mother_birth_date),
          customer.mother_birth_place || null,
          customer.mother_residence || null,
          customer.mother_phone || null,
          customer.father_name || null,
          customer.father_surname || null,
          parseDate(customer.father_birth_date),
          customer.father_birth_place || null,
          customer.father_residence || null,
          customer.father_phone || null,
          customer.webhook_updated || false,
          customer.webhook_update_timestamp ? new Date(customer.webhook_update_timestamp) : null,
          customer.visa_consulate || null
        ];

        if (customer.email === 'burcu.shut@gmail.com') {
          console.log('\nSQL değerleri:');
          console.log(values);
        }

        const result = await pool.query(query, values);
        if (result.rows[0].updated_at !== result.rows[0].created_at) {
          updateCount++;
        } else {
          successCount++;
        }
        
        if ((successCount + updateCount) % 10 === 0) {
          console.log(`${successCount} yeni kayıt, ${updateCount} güncelleme yapıldı...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Hata (${customer.email}):`, error.message);
        if (customer.email === 'burcu.shut@gmail.com') {
          console.error('Tam hata:', error);
        }
      }
    }

    console.log('\nAktarım tamamlandı!');
    console.log(`Yeni kayıt: ${successCount}`);
    console.log(`Güncellenen: ${updateCount}`);
    console.log(`Hatalı: ${errorCount}`);
    console.log(`Toplam: ${customers.length}`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await pool.end();
  }
}

importData(); 