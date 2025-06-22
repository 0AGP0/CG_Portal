import { NextRequest, NextResponse } from 'next/server';
import { getStudentByEmail, getAdvisorByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';

// Alert tipi tanımı
interface Alert {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Öğrencinin email bilgisini al
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      logger.error('Kullanıcı email bilgisi bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgisi bulunamadı' }, 
        { status: 401 }
      );
    }
    
    logger.info('Öğrenci profil bilgileri getiriliyor:', { userEmail });

    // Öğrenci verilerini veritabanından getir
    const student = await getStudentByEmail(userEmail);
    
    if (!student) {
      logger.error('Öğrenci bulunamadı:', userEmail);
      return NextResponse.json(
        { success: false, error: 'Öğrenci kaydı bulunamadı' }, 
        { status: 404 }
      );
    }

    // Danışman bilgisini getir
    let advisor = null;
    if (student.advisor_email) {
      advisor = await getAdvisorByEmail(student.advisor_email);
    }
    
    // Aşama durumunu belirle
    let stageStatus = 'İşlemde';
    let stagePercentage = 40;
    let stageMessage = '';
    
    if (student.stage === 'BİTEN') {
      stageStatus = 'Tamamlandı';
      stagePercentage = 100;
      stageMessage = 'Başvuru süreciniz tamamlandı!';
    } else if (student.stage === 'İşlemde') {
      stageStatus = 'Devam Ediyor';
      stagePercentage = 50;
      stageMessage = 'Başvuru süreciniz devam ediyor';
    } else if (student.stage === 'Süreç Başlatıldı') {
      stageStatus = 'Başlangıç';
      stagePercentage = 30;
      stageMessage = 'Süreciniz başlatıldı, dökümanları tamamlayın';
    }
    
    // Bildirim oluştur
    const alerts: Alert[] = [];
    
    // Öğrenci profil bilgilerini formatla ve döndür
    return NextResponse.json({
      success: true,
      student: {
        _id: student.id,
        _model: "res.partner",
        _action: "Send Webhook Notification(#1962)",
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone || false,
        contact_address: student.contact_address || "\n\n  \n",
        x_studio_almanca_sertifikas: student.language_certificate || false,
        x_studio_almanca_seviyesi_1: student.language_level || false,
        x_studio_almanya_bulunma: student.has_been_to_germany || false,
        x_studio_anne_ad: student.mother_name || false,
        x_studio_anne_doum_tarihi: student.mother_birth_date || false,
        x_studio_anne_doum_yeri: student.mother_birth_place || false,
        x_studio_anne_ikamet_sehrilke: student.mother_residence || false,
        x_studio_anne_soyad: student.mother_surname || false,
        x_studio_anne_telefon: student.mother_phone || false,
        x_studio_baba_ad: student.father_name || false,
        x_studio_baba_doum_tarihi: student.father_birth_date || false,
        x_studio_baba_doum_yeri: student.father_birth_place || false,
        x_studio_baba_ikamet_ehrilkesi: student.father_residence || false,
        x_studio_baba_soyad: student.father_surname || false,
        x_studio_baba_telefon: student.father_phone || false,
        x_studio_bilgiler_1: student.contact_address || false,
        x_studio_de_blm_tercihi: student.german_department_preference || false,
        x_studio_dil_renim_durumu: student.language_learning_status || false,
        x_studio_dil_sertifikas: student.language_certificate || false,
        x_studio_doum_tarihi: student.birth_date || false,
        x_studio_doum_yeri: student.birth_place || false,
        x_studio_finansal_kant: student.financial_proof || false,
        x_studio_geerlilik_tarihi: student.passport_expiry_date || false,
        x_studio_konsolosluk_1: student.visa_consulate || "\u0130stanbul",
        x_studio_lise_ad: student.high_school_name || false,
        x_studio_lise_balang_tarihi_1: student.high_school_start_date || false,
        x_studio_lise_biti_tarihi: student.high_school_graduation_date || false,
        x_studio_lise_ehir: student.high_school_city || false,
        x_studio_lise_tr: student.high_school_type || false,
        x_studio_maddi_kant_durumu: student.financial_proof_status || false,
        x_studio_mail_adresi: student.email || false,
        x_studio_medeni_durum_1: student.marital_status || false,
        x_studio_mezuniyet_durumu: student.graduation_status || false,
        x_studio_mezuniyet_yl: student.graduation_year || false,
        x_studio_niversite_ad: student.university_name || false,
        x_studio_niversite_balang_tarihi: student.university_start_date || false,
        x_studio_niversite_biti_tarihi: student.university_end_date || false,
        x_studio_niversite_blm_ad: student.university_department || false,
        x_studio_niversite_tercihleri: student.university_preferences || false,
        x_studio_pasaport_numaras: student.passport_number || false,
        x_studio_pasaport_tr: student.passport_type || "Umuma Mahsus (Bordo) Pasaport",
        x_studio_pnr_numaras: student.pnr_number || false,
        x_studio_selection_field_8en_1iqnrqang: student.language_level || false,
        x_studio_sym_snav_giri: student.exam_entry || false,
        x_studio_sym_yerlestirme_sonuc_tarihi: student.exam_result_date || false,
        x_studio_veren_makam: student.issuing_authority || false,
        x_studio_verili_tarihi: student.passport_issue_date || false,
        x_studio_vize_bavuru_tarihi_1: student.visa_application_date || false,
        x_studio_vize_randevu_belgesi: student.visa_document || false,
        x_studio_vize_randevu_tarihi: student.visa_appointment_date || false,
        x_studio_ya: student.age || 0,
        stage: student.stage || 'new',
        process_started: student.process_started || false,
        advisor_email: student.advisor_email,
        advisor_name: student.advisor_name,
        created_at: student.created_at,
        updated_at: student.updated_at,
        documents: student.documents || []
      }
    });
  } catch (error) {
    logger.error('Öğrenci profil getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Öğrenci bilgileri alınamadı' },
      { status: 500 }
    );
  }
} 