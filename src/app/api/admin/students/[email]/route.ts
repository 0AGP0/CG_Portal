import { NextRequest, NextResponse } from 'next/server';
import { getStudentByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    
    logger.info('Admin öğrenci detayları isteği alındı:', { email });

    // Öğrenci verilerini veritabanından getir
    const student = await getStudentByEmail(email);
    
    if (!student) {
      logger.error('Öğrenci bulunamadı:', email);
      return NextResponse.json(
        { success: false, error: 'Öğrenci kaydı bulunamadı' }, 
        { status: 404 }
      );
    }

    // Öğrenci verilerini formatla
    const formattedStudent = {
      id: student.id,
      email: student.email,
      name: student.name,
      phone: student.phone,
      stage: student.stage,
      processStarted: student.process_started,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      advisorId: student.advisor_id,
      advisorName: student.advisor_name,
      advisorEmail: student.advisor_email,
      salesId: student.sales_id,
      salesName: student.sales_name,
      salesEmail: student.sales_email,
      leadId: student.lead_id,
      contactAddress: student.contact_address,
      age: student.age,
      birthDate: student.birth_date,
      birthPlace: student.birth_place,
      maritalStatus: student.marital_status,
      passportNumber: student.passport_number,
      passportType: student.passport_type,
      passportIssueDate: student.passport_issue_date,
      passportExpiryDate: student.passport_expiry_date,
      issuingAuthority: student.issuing_authority,
      pnrNumber: student.pnr_number,
      visaApplicationDate: student.visa_application_date,
      visaAppointmentDate: student.visa_appointment_date,
      visaDocument: student.visa_document,
      visaConsulate: student.visa_consulate,
      hasBeenToGermany: student.has_been_to_germany,
      highSchoolName: student.high_school_name,
      highSchoolType: student.high_school_type,
      highSchoolCity: student.high_school_city,
      highSchoolStartDate: student.high_school_start_date,
      highSchoolGraduationDate: student.high_school_graduation_date,
      universityName: student.university_name,
      universityDepartment: student.university_department,
      universityStartDate: student.university_start_date,
      universityEndDate: student.university_end_date,
      graduationStatus: student.graduation_status,
      graduationYear: student.graduation_year,
      universityPreferences: student.university_preferences,
      germanDepartmentPreference: student.german_department_preference,
      languageLevel: student.language_level,
      languageCertificate: student.language_certificate,
      languageCourseRegistration: student.language_course_registration,
      languageLearningStatus: student.language_learning_status,
      financialProof: student.financial_proof,
      financialProofStatus: student.financial_proof_status,
      examEntry: student.exam_entry,
      examResultDate: student.exam_result_date,
      motherName: student.mother_name,
      motherSurname: student.mother_surname,
      motherBirthDate: student.mother_birth_date,
      motherBirthPlace: student.mother_birth_place,
      motherResidence: student.mother_residence,
      motherPhone: student.mother_phone,
      fatherName: student.father_name,
      fatherSurname: student.father_surname,
      fatherBirthDate: student.father_birth_date,
      fatherBirthPlace: student.father_birth_place,
      fatherResidence: student.father_residence,
      fatherPhone: student.father_phone,
      documents: student.documents || []
    };

    logger.info('Admin öğrenci detayları başarıyla getirildi:', { email });

    return NextResponse.json({
      success: true,
      student: formattedStudent
    });
  } catch (error) {
    logger.error('Admin öğrenci detayları hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Öğrenci detayları alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const body = await request.json();
    
    logger.info('Admin öğrenci güncelleme isteği alındı:', { email });

    // Öğrenci verilerini güncelle
    const { updateStudentProfile } = await import('@/lib/db');
    const updatedStudent = await updateStudentProfile(email, body);

    logger.info('Admin öğrenci başarıyla güncellendi:', { email });

    return NextResponse.json({
      success: true,
      student: updatedStudent
    });
  } catch (error) {
    logger.error('Admin öğrenci güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Öğrenci güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 