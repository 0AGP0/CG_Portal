import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';

// Webhook secret sabit değeri
const WEBHOOK_SECRET = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export async function POST(request: NextRequest) {
  console.log('\n=== WEBHOOK İSTEĞİ BAŞLADI ===');
  console.log('Zaman:', new Date().toISOString());
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  
  // Tüm headers'ları logla
  const headers = Object.fromEntries(request.headers.entries());
  console.log('Headers:', JSON.stringify(headers, null, 2));

  try {
    // URL'den secret parametresini al
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret') || '';
    console.log('\nSecret Kontrolü:');
    console.log('- Alınan:', secretParam.substring(0, 10) + '...');
    console.log('- Beklenen:', WEBHOOK_SECRET.substring(0, 10) + '...');

    // Secret kontrolü
    if (secretParam !== WEBHOOK_SECRET) {
      console.error('❌ Geçersiz webhook secret');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid secret' },
        { status: 401 }
      );
    }
    console.log('✅ Secret doğrulandı');

    // Request body'yi al
    const rawBody = await request.text();
    console.log('\nHam Veri:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('\nİşlenmiş Veri:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.error('❌ JSON parse hatası:', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Email kontrolü
    const email = body.x_studio_mail_adresi || body.email || null;
    console.log('\nEmail Kontrolü:', email);
    
    if (!email) {
      console.error('❌ Email alanı bulunamadı');
      return NextResponse.json(
        { error: 'Email field is required' },
        { status: 400 }
      );
    }
    console.log('✅ Email doğrulandı');

    // Veritabanı bağlantısı
    const client = await pool.connect();
    
    try {
      // Öğrenci kontrolü - doğrudan veritabanı sorgusu
      console.log('\nÖğrenci kontrolü yapılıyor...');
      const checkQuery = 'SELECT * FROM students WHERE email = $1';
      const checkResult = await client.query(checkQuery, [email]);
      
      if (checkResult.rows.length === 0) {
        console.error('❌ Bu email adresiyle kayıtlı öğrenci bulunamadı:', email);
        return NextResponse.json({
          error: 'Student not found',
          message: 'Bu email adresiyle kayıtlı öğrenci bulunamadı',
          email: email
        }, { status: 404 });
      }
      
      const existingStudent = checkResult.rows[0];
      console.log('✅ Öğrenci bulundu:', existingStudent.name);

      // Durum kontrolü
      const stage = body.x_studio_selection_field_8en_1iqnrqang || body.stage || '';
      console.log('\nDurum Kontrolü:', stage);

      // Öğrenci verisini güncelle
      console.log('\nÖğrenci güncelleniyor...');
      
      const updateQuery = `
        UPDATE students SET
          name = $1,
          phone = $2,
          contact_address = $3,
          stage = $4,
          process_started = $5,
          updated_at = NOW(),
          
          -- Kişisel Bilgiler
          birth_date = $6,
          birth_place = $7,
          age = $8,
          marital_status = $9,
          financial_proof = $10,
          
          -- Pasaport Bilgileri
          passport_number = $11,
          passport_type = $12,
          passport_issue_date = $13,
          passport_expiry_date = $14,
          issuing_authority = $15,
          pnr_number = $16,
          
          -- Aile Bilgileri
          mother_name = $17,
          mother_surname = $18,
          mother_birth_date = $19,
          mother_birth_place = $20,
          mother_residence = $21,
          mother_phone = $22,
          
          father_name = $23,
          father_surname = $24,
          father_birth_date = $25,
          father_birth_place = $26,
          father_residence = $27,
          father_phone = $28,
          
          -- Eğitim Bilgileri
          high_school_name = $29,
          high_school_type = $30,
          high_school_city = $31,
          high_school_graduation_date = $32,
          high_school_start_date = $33,
          
          university_name = $34,
          university_department = $35,
          university_start_date = $36,
          university_end_date = $37,
          graduation_status = $38,
          graduation_year = $39,
          
          -- Dil Bilgileri
          language_level = $40,
          language_certificate = $41,
          language_learning_status = $42,
          
          -- Sınav ve Vize Bilgileri
          exam_entry = $43,
          exam_result_date = $44,
          visa_appointment_date = $45,
          visa_application_date = $46,
          visa_consulate = $47,
          visa_document = $48,
          
          -- Diğer Bilgiler
          has_been_to_germany = $49,
          german_department_preference = $50,
          university_preferences = $51,
          financial_proof_status = $52,
          additional_info = $53
          
        WHERE email = $54
        RETURNING *
      `;
      
      const updateValues = [
        body.name || existingStudent.name,
        body.phone || existingStudent.phone,
        body.contact_address || existingStudent.contact_address,
        stage,
        true,
        
        // Kişisel Bilgiler
        body.x_studio_doum_tarihi || existingStudent.birth_date,
        body.x_studio_doum_yeri || existingStudent.birth_place,
        body.x_studio_ya || existingStudent.age,
        body.x_studio_medeni_durum_1 || existingStudent.marital_status,
        body.x_studio_finansal_kant || existingStudent.financial_proof,
        
        // Pasaport Bilgileri
        body.x_studio_pasaport_numaras || existingStudent.passport_number,
        body.x_studio_pasaport_tr || existingStudent.passport_type,
        body.x_studio_verili_tarihi || existingStudent.passport_issue_date,
        body.x_studio_geerlilik_tarihi || existingStudent.passport_expiry_date,
        body.x_studio_veren_makam || existingStudent.issuing_authority,
        body.x_studio_pnr_numaras || existingStudent.pnr_number,
        
        // Aile Bilgileri
        body.x_studio_anne_ad || existingStudent.mother_name,
        body.x_studio_anne_soyad || existingStudent.mother_surname,
        body.x_studio_anne_doum_tarihi || existingStudent.mother_birth_date,
        body.x_studio_anne_doum_yeri || existingStudent.mother_birth_place,
        body.x_studio_anne_ikamet_sehrilke || existingStudent.mother_residence,
        body.x_studio_anne_telefon || existingStudent.mother_phone,
        
        body.x_studio_baba_ad || existingStudent.father_name,
        body.x_studio_baba_soyad || existingStudent.father_surname,
        body.x_studio_baba_doum_tarihi || existingStudent.father_birth_date,
        body.x_studio_baba_doum_yeri || existingStudent.father_birth_place,
        body.x_studio_baba_ikamet_ehrilkesi || existingStudent.father_residence,
        body.x_studio_baba_telefon || existingStudent.father_phone,
        
        // Eğitim Bilgileri
        body.x_studio_lise_ad || existingStudent.high_school_name,
        body.x_studio_lise_tr || existingStudent.high_school_type,
        body.x_studio_lise_ehir || existingStudent.high_school_city,
        body.x_studio_lise_biti_tarihi || existingStudent.high_school_graduation_date,
        body.x_studio_lise_balang_tarihi_1 || existingStudent.high_school_start_date,
        
        body.x_studio_niversite_ad || existingStudent.university_name,
        body.x_studio_niversite_blm_ad || existingStudent.university_department,
        body.x_studio_niversite_balang_tarihi || existingStudent.university_start_date,
        body.x_studio_niversite_biti_tarihi || existingStudent.university_end_date,
        body.x_studio_mezuniyet_durumu || existingStudent.graduation_status,
        body.x_studio_mezuniyet_yl || existingStudent.graduation_year,
        
        // Dil Bilgileri
        body.x_studio_almanca_seviyesi_1 || existingStudent.language_level,
        body.x_studio_almanca_sertifikas || existingStudent.language_certificate,
        body.x_studio_dil_renim_durumu || existingStudent.language_learning_status,
        
        // Sınav ve Vize Bilgileri
        body.x_studio_sym_snav_giri || existingStudent.exam_entry,
        body.x_studio_sym_yerlestirme_sonuc_tarihi || existingStudent.exam_result_date,
        body.x_studio_vize_randevu_tarihi || existingStudent.visa_appointment_date,
        body.x_studio_vize_bavuru_tarihi_1 || existingStudent.visa_application_date,
        body.x_studio_konsolosluk_1 || existingStudent.visa_consulate,
        body.x_studio_vize_randevu_belgesi || existingStudent.visa_document,
        
        // Diğer Bilgiler
        body.x_studio_almanya_bulunma || existingStudent.has_been_to_germany,
        body.x_studio_de_blm_tercihi || existingStudent.german_department_preference,
        body.x_studio_niversite_tercihleri || existingStudent.university_preferences,
        body.x_studio_maddi_kant_durumu || existingStudent.financial_proof_status,
        body.x_studio_bilgiler_1 || existingStudent.additional_info,
        
        email
      ];
      
      const updateResult = await client.query(updateQuery, updateValues);
      const updatedStudent = updateResult.rows[0];

      console.log('\n✅ Öğrenci başarıyla güncellendi:', JSON.stringify(updatedStudent, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Öğrenci bilgileri güncellendi',
        student: updatedStudent
      }, { status: 200 });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('\n❌ Webhook işleme hatası:', error);
    logger.error('Webhook error', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    console.log('\n=== WEBHOOK İSTEĞİ TAMAMLANDI ===\n');
  }
} 