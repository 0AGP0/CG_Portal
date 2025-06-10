import { NextResponse } from 'next/server';
import { getStudentByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function GET(
  request: Request,
  context: { params: { email: string } }
) {
  try {
    // Öğrenci e-postasını al
    const studentEmail = decodeURIComponent(context.params.email);
    if (!studentEmail) {
      logger.warn('Eksik öğrenci e-postası');
      return NextResponse.json(
        { error: 'Öğrenci e-postası gerekli' },
        { status: 400 }
      );
    }

    logger.info('Öğrenci detayları getiriliyor:', { studentEmail });

    // Öğrenci verilerini getir
    const student = await getStudentByEmail(studentEmail);
    
    if (!student) {
      logger.warn('Öğrenci bulunamadı:', { studentEmail });
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' },
        { status: 404 }
      );
    }

    // Gelen veriyi logla
    logger.info('Ham öğrenci verisi:', student);

    // Öğrenci verisini formatla
    const formattedStudent = {
      personal: {
        email: student.email,
        name: student.name,
        phone: student.phone,
        birthDate: student.birth_date,
        birthPlace: student.birth_place,
        maritalStatus: student.marital_status,
        contactAddress: student.contact_address
      },
      mother: {
        name: student.mother_name,
        surname: student.mother_surname,
        birthDate: student.mother_birth_date,
        birthPlace: student.mother_birth_place,
        residence: student.mother_residence,
        phone: student.mother_phone
      },
      father: {
        name: student.father_name,
        surname: student.father_surname,
        birthDate: student.father_birth_date,
        birthPlace: student.father_birth_place,
        residence: student.father_residence,
        phone: student.father_phone
      },
      passport: {
        number: student.passport_number,
        type: student.passport_type,
        issueDate: student.passport_issue_date,
        expiryDate: student.passport_expiry_date,
        issuingAuthority: student.issuing_authority
      },
      education: {
        highSchool: {
          name: student.high_school_name,
          type: student.high_school_type,
          city: student.high_school_city,
          startDate: student.high_school_start_date,
          graduationDate: student.high_school_graduation_date
        },
        university: {
          name: student.university_name,
          department: student.university_department,
          startDate: student.university_start_date,
          endDate: student.university_end_date,
          graduationStatus: student.graduation_status,
          graduationYear: student.graduation_year,
          preferences: student.university_preferences,
          germanDepartmentPreference: student.german_department_preference
        }
      },
      language: {
        level: student.language_level,
        certificate: student.language_certificate,
        courseRegistration: student.language_course_registration,
        learningStatus: student.language_learning_status
      },
      visa: {
        consulate: student.visa_consulate,
        applicationDate: student.visa_application_date,
        appointmentDate: student.visa_appointment_date,
        document: student.visa_document
      },
      process: {
        stage: student.stage,
        status: student.process_started,
        startDate: student.process_start_date,
        advisor: {
          id: student.advisor_id,
          name: student.advisor_name,
          email: student.advisor_email
        },
        financialProof: {
          status: student.financial_proof_status,
          document: student.financial_proof
        },
        exam: {
          entry: student.exam_entry,
          resultDate: student.exam_result_date
        },
        documents: student.documents || [],
        createdAt: student.created_at,
        updatedAt: student.updated_at
      }
    };

    // Formatlanmış veriyi logla
    logger.info('Formatlanmış öğrenci verisi:', formattedStudent);

    return NextResponse.json(formattedStudent);

  } catch (error) {
    logger.error('Öğrenci detayları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci detayları alınamadı' },
      { status: 500 }
    );
  }
} 