import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Öğrencinin email bilgisini al
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgisi bulunamadı' }, 
        { status: 401 }
      );
    }
    
    // Öğrenciyi bul
    const student = await getRecordByEmail(userEmail);
    
    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci kaydı bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Aşama durumunu belirle
    let stageStatus = 'İşlemde';
    let stagePercentage = 40; // Varsayılan ilerleme yüzdesi
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
    const alerts = [];
    
    if (student.webhook_updated) {
      // Sistem güncellemesi olduysa, bildirimi ekle
      const updateDate = student.webhook_update_timestamp ? new Date(student.webhook_update_timestamp).toLocaleDateString('tr-TR') : 'yakın zamanda';
      alerts.push({
        id: 1,
        type: 'success',
        message: `Bilgileriniz ${updateDate} tarihinde güncellendi. Durumunuz: ${student.stage}`
      });
    } else {
      // Varsayılan uyarı
      alerts.push({
        id: 1, 
        type: 'warning', 
        message: 'Profilinizi tamamlamanız gerekiyor.'
      });
    }
    
    // Öğrenci profil bilgilerini formatla ve döndür
    return NextResponse.json(
      { 
        success: true, 
        student: {
          name: student.name || userEmail.split('@')[0],
          email: student.email,
          studentId: student.lead_id || 'Henüz Oluşturulmadı',
          university: student.university || 'Henüz Belirlenmedi',
          program: student.program || 'Henüz Belirlenmedi',
          processStarted: student.processStarted || false,
          counselor: student.advisorName || 'Henüz Atanmadı',
          counselorEmail: student.advisorEmail || null,
          salesPerson: student.salesName || 'Henüz Atanmadı',
          salesEmail: student.salesEmail || null,
          salesPersonEmail: student.salesEmail || null,
          lastLogin: new Date().toLocaleDateString('tr-TR'),
          
          // Kişisel bilgiler
          phone: student.phone,
          birth_date: student.birth_date || student.x_studio_doum_tarihi,
          birth_place: student.birth_place || student.x_studio_doum_yeri,
          age: student.age || student.x_studio_ya,
          contact_address: student.contact_address,
          marital_status: student.marital_status || student.x_studio_medeni_durum_1,
          pnr_number: student.pnr_number || student.x_studio_pnr_numaras,
          
          // Durum bilgileri
          systemDetails: {
            stage: student.stage || 'Yeni',
            stageStatus: stageStatus,
            stagePercentage: stagePercentage,
            lastUpdated: student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('tr-TR') : null,
            isUpdated: student.webhook_updated || false,
            lastUpdateTime: student.webhook_update_timestamp ? new Date(student.webhook_update_timestamp).toLocaleDateString('tr-TR') : null
          },
          
          // Pasaport bilgileri
          passport: {
            number: student.passport_number || student.x_studio_pasaport_numaras || null,
            type: student.passport_type || student.x_studio_pasaport_tr || null,
            issueDate: student.passport_issue_date || student.x_studio_verili_tarihi || null,
            expiryDate: student.passport_expiry_date || student.x_studio_geerlilik_tarihi || null,
            issuingAuthority: student.issuing_authority || student.x_studio_veren_makam || null
          },
          
          // Vize bilgileri
          visa: {
            applicationDate: student.visa_application_date || student.x_studio_vize_bavuru_tarihi_1 || null,
            appointmentDate: student.visa_appointment_date || student.x_studio_vize_randevu_tarihi || null,
            consulate: student.consulate || student.x_studio_konsolosluk_1 || null
          },
          
          // Lise bilgileri
          high_school_name: student.high_school_name || student.x_studio_lise_ad || null,
          high_school_type: student.high_school_type || student.x_studio_lise_tr || null,
          high_school_city: student.high_school_city || student.x_studio_lise_ehir || null,
          high_school_start_date: student.high_school_start_date || student.x_studio_lise_balang_tarihi_1 || null,
          high_school_graduation_date: student.high_school_graduation_date || student.x_studio_lise_biti_tarihi || null,
          
          // Üniversite bilgileri
          university_name: student.university_name || student.x_studio_niversite_ad || student.university || null,
          university_department: student.university_department || student.x_studio_niversite_blm_ad || student.program || null,
          university_start_date: student.university_start_date || student.x_studio_niversite_balang_tarihi || null,
          university_end_date: student.university_end_date || student.x_studio_niversite_biti_tarihi || null,
          graduation_status: student.graduation_status || student.x_studio_mezuniyet_durumu || null,
          graduation_year: student.graduation_year || student.x_studio_mezuniyet_yl || null,
          
          // Dil bilgileri
          language_level: student.language_level || student.x_studio_almanca_seviyesi_1 || null,
          language_certificate: student.language_certificate || student.x_studio_almanca_sertifikas || null,
          language_course_registration: student.language_course_registration || student.x_studio_dil_kursu_kayt || null,
          language_learning_status: student.language_learning_status || student.x_studio_dil_renim_durumu || null,
          
          // Uyarılar
          alerts: alerts
        }
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logError('Öğrenci profil bilgisi hatası', error);
    return NextResponse.json(
      { error: 'Profil bilgisi alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 