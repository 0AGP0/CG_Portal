import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord, getRecordByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

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
    const email = body.email || body.x_studio_mail_adresi || null;
    console.log('\nEmail Kontrolü:', email);
    
    if (!email) {
      console.error('❌ Email alanı bulunamadı');
      return NextResponse.json(
        { error: 'Email field is required' },
        { status: 400 }
      );
    }
    console.log('✅ Email doğrulandı');

    // Öğrenci kontrolü
    console.log('\nÖğrenci kontrolü yapılıyor...');
    const existingStudent = await getRecordByEmail(email);
    
    if (!existingStudent) {
      console.error('❌ Bu email adresiyle kayıtlı öğrenci bulunamadı:', email);
      return NextResponse.json({
        error: 'Student not found',
        message: 'Bu email adresiyle kayıtlı öğrenci bulunamadı',
        email: email
      }, { status: 404 });
    }
    console.log('✅ Öğrenci bulundu:', existingStudent.name);

    // Durum kontrolü
    const stage = body.x_studio_selection_field_8en_1iqnrqang || body.stage || '';
    console.log('\nDurum Kontrolü:', stage);

    // Öğrenci verisini güncelle
    console.log('\nÖğrenci güncelleniyor...');
    const updatedStudent = await updateOrCreateRecord({
      email: email,
      name: body.name || existingStudent.name, // Mevcut ismi koru
      phone: body.phone || existingStudent.phone, // Mevcut telefonu koru
      stage: stage,
      processStarted: body.process_started || existingStudent.processStarted,
      updatedAt: new Date().toISOString(),
      // Diğer alanlar - sadece gelen verileri güncelle, mevcut verileri koru
      language_level: body.x_studio_almanca_seviyesi_1 || existingStudent.language_level || '',
      language_certificate: body.x_studio_almanca_sertifikas || existingStudent.language_certificate || '',
      birth_date: body.x_studio_doum_tarihi || existingStudent.birth_date || '',
      birth_place: body.x_studio_doum_yeri || existingStudent.birth_place || '',
      marital_status: body.x_studio_medeni_durum_1 || existingStudent.marital_status || '',
      financial_proof: body.x_studio_finansal_kant || existingStudent.financial_proof || '',
      exam_entry: body.x_studio_sym_snav_giri || existingStudent.exam_entry || false,
      exam_result_date: body.x_studio_sym_yerlestirme_sonuc_tarihi || existingStudent.exam_result_date || '',
      // Aile bilgileri - sadece gelen verileri güncelle, mevcut verileri koru
      mother_name: body.x_studio_anne_ad || existingStudent.mother_name || '',
      mother_surname: body.x_studio_anne_soyad || existingStudent.mother_surname || '',
      mother_birth_date: body.x_studio_anne_doum_tarihi || existingStudent.mother_birth_date || '',
      mother_birth_place: body.x_studio_anne_doum_yeri || existingStudent.mother_birth_place || '',
      mother_residence: body.x_studio_anne_ikamet_sehrilke || existingStudent.mother_residence || '',
      father_name: body.x_studio_baba_ad || existingStudent.father_name || '',
      father_surname: body.x_studio_baba_soyad || existingStudent.father_surname || '',
      father_birth_date: body.x_studio_baba_doum_tarihi || existingStudent.father_birth_date || '',
      father_birth_place: body.x_studio_baba_doum_yeri || existingStudent.father_birth_place || '',
      father_residence: body.x_studio_baba_ikamet_ehrilkesi || existingStudent.father_residence || ''
    });

    console.log('\n✅ Öğrenci başarıyla güncellendi:', JSON.stringify(updatedStudent, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Öğrenci bilgileri güncellendi',
      student: updatedStudent
    }, { status: 200 });

  } catch (error: any) {
    console.error('\n❌ Webhook işleme hatası:', error);
    logError('Webhook error', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    console.log('\n=== WEBHOOK İSTEĞİ TAMAMLANDI ===\n');
  }
} 