import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail, getRecordByEmail } from '@/utils/database';

interface RouteParams {
  params: {
    email: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const studentEmail = decodeURIComponent(params.email);
    // Oturum doğrulama işlemi normalde burada yapılır
    // Şu an için basit bir gelen header doğrulaması yapacağız
    const advisorEmail = request.headers.get('x-user-email') || '';
    
    if (!advisorEmail) {
      return NextResponse.json({ error: 'Oturum bilgisi gerekli' }, { status: 401 });
    }
    
    // Danışmanı e-posta ile bul
    const advisor = await getAdvisorByEmail(advisorEmail);
    
    if (!advisor) {
      return NextResponse.json({ error: 'Danışman bulunamadı' }, { status: 404 });
    }
    
    // Öğrencinin bu danışmana ait olup olmadığını kontrol et
    if (!advisor.studentIds.includes(studentEmail)) {
      return NextResponse.json({ error: 'Bu öğrenci sizin danışanınız değil' }, { status: 403 });
    }
    
    // Öğrenci bilgilerini getir
    const student = await getRecordByEmail(studentEmail);
    
    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
    }
    
    // Öğrenci bilgilerini düzenleyerek dön
    return NextResponse.json({
      id: student.lead_id,
      email: student.email,
      name: student.name,
      stage: student.stage,
      
      // Adres ve iletişim bilgileri
      contact_address: student.contact_address,
      phone: student.phone,
      age: student.age,
      
      // Kişisel bilgiler
      birth_date: student.birth_date,
      birth_place: student.birth_place,
      marital_status: student.marital_status,
      
      // Eğitim bilgileri
      high_school_name: student.high_school_name,
      high_school_type: student.high_school_type,
      high_school_city: student.high_school_city,
      high_school_start_date: student.high_school_start_date,
      high_school_graduation_date: student.high_school_graduation_date,
      university_name: student.university_name || student.university,
      university_department: student.university_department || student.program,
      university_start_date: student.university_start_date,
      university_end_date: student.university_end_date,
      graduation_status: student.graduation_status,
      graduation_year: student.graduation_year,
      university_preferences: student.university_preferences,
      german_department_preference: student.german_department_preference,
      
      // Dil bilgileri
      language_level: student.language_level,
      language_certificate: student.language_certificate,
      language_course_registration: student.language_course_registration,
      language_learning_status: student.language_learning_status,
      
      // Vize/Pasaport bilgileri
      passport_number: student.passport_number,
      passport_type: student.passport_type,
      passport_issue_date: student.passport_issue_date,
      passport_expiry_date: student.passport_expiry_date,
      issuing_authority: student.issuing_authority,
      pnr_number: student.pnr_number,
      visa_application_date: student.visa_application_date,
      visa_appointment_date: student.visa_appointment_date,
      visa_document: student.visa_document,
      consulate: student.consulate,
      has_been_to_germany: student.has_been_to_germany,
      
      // Aile bilgileri
      mother_name: student.mother_name,
      mother_surname: student.mother_surname,
      mother_birth_date: student.mother_birth_date,
      mother_birth_place: student.mother_birth_place,
      mother_residence: student.mother_residence,
      mother_phone: student.mother_phone,
      
      father_name: student.father_name,
      father_surname: student.father_surname,
      father_birth_date: student.father_birth_date,
      father_birth_place: student.father_birth_place,
      father_residence: student.father_residence,
      father_phone: student.father_phone,
      
      // Finansal bilgiler
      financial_proof: student.financial_proof,
      financial_proof_status: student.financial_proof_status,
      
      // Sınav bilgileri
      exam_entry: student.exam_entry,
      exam_result_date: student.exam_result_date,
      
      // Dökümanlar
      documents: student.documents || [],
      
      updatedAt: student.updatedAt
    });
  } catch (error) {
    console.error('Öğrenci detayı getirme hatası:', error);
    return NextResponse.json({ error: 'Veri alma hatası' }, { status: 500 });
  }
} 