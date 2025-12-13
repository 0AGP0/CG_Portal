import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord, getRecordByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';
import crypto from 'crypto';

// Webhook secret sabit değeri
const WEBHOOK_SECRET = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

// Idempotency protection - aynı webhook'un kısa sürede tekrar işlenmesini önle
// Production'da Redis kullanılmalı, şimdilik in-memory
const processedWebhooks = new Map<string, number>();
const IDEMPOTENCY_WINDOW = 60000; // 60 saniye - aynı webhook 60 saniye içinde tekrar işlenmez

// Eski kayıtları temizle
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of processedWebhooks.entries()) {
    if (now - timestamp > IDEMPOTENCY_WINDOW) {
      processedWebhooks.delete(key);
    }
  }
}, 30000); // Her 30 saniyede bir temizle

export async function POST(request: NextRequest) {
  // Production'da aşırı loglama kapalı - sadece hata durumlarında log
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log('\n=== WEBHOOK İSTEĞİ BAŞLADI ===');
    console.log('Zaman:', new Date().toISOString());
  }

  try {
    // URL'den secret parametresini al
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret') || '';

    // Secret kontrolü
    if (secretParam !== WEBHOOK_SECRET) {
      logError('Geçersiz webhook secret', { url: request.url });
      return NextResponse.json(
        { error: 'Unauthorized - Invalid secret' },
        { status: 401 }
      );
    }

    // Request body'yi al
    const rawBody = await request.text();

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      logError('JSON parse hatası', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Email kontrolü
    const email = body.email || body.x_studio_mail_adresi || null;
    
    // Idempotency kontrolü - aynı webhook'un tekrar işlenmesini önle
    // Webhook'un unique hash'ini oluştur (email + stage + timestamp kombinasyonu)
    const webhookId = body.id || body._id || 
      crypto.createHash('md5')
        .update(`${email}-${body.x_studio_selection_field_8en_1iqnrqang || body.stage || ''}-${rawBody}`)
        .digest('hex');
    
    const now = Date.now();
    const lastProcessed = processedWebhooks.get(webhookId);
    
    if (lastProcessed && (now - lastProcessed) < IDEMPOTENCY_WINDOW) {
      // Bu webhook son 60 saniye içinde işlendi, duplicate olarak reddet
      if (isDevelopment) {
        console.log('⚠️ Duplicate webhook reddedildi:', webhookId);
      }
      return NextResponse.json({
        success: true,
        message: 'Webhook zaten işlendi (duplicate)',
        duplicate: true
      }, { status: 200 });
    }
    
    // Webhook'u işlenmiş olarak işaretle
    processedWebhooks.set(webhookId, now);
    
    if (!email) {
      logError('Email alanı bulunamadı', body);
      return NextResponse.json(
        { error: 'Email field is required' },
        { status: 400 }
      );
    }

    // Öğrenci kontrolü
    const existingStudent = await getRecordByEmail(email);
    
    if (!existingStudent) {
      logError('Öğrenci bulunamadı', { email });
      return NextResponse.json({
        error: 'Student not found',
        message: 'Bu email adresiyle kayıtlı öğrenci bulunamadı',
        email: email
      }, { status: 404 });
    }

    // Durum kontrolü
    const stage = body.x_studio_selection_field_8en_1iqnrqang || body.stage || '';

    // Öğrenci verisini güncelle
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

    if (isDevelopment) {
      console.log('✅ Öğrenci başarıyla güncellendi:', email);
    }

    return NextResponse.json({
      success: true,
      message: 'Öğrenci bilgileri güncellendi',
      student: updatedStudent
    }, { status: 200 });

  } catch (error: any) {
    logError('Webhook işleme hatası', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 