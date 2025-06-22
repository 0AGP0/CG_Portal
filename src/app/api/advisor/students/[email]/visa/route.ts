import { NextRequest, NextResponse } from 'next/server';
import { updateStudentVisa } from '@/utils/database';
import { logError } from '@/utils/logger';

interface RouteParams {
  params: {
    email: string;
  };
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const data = await request.json();
    const studentEmail = decodeURIComponent(context.params.email);

    // Vize bilgilerini güncelle
    const updatedStudent = await updateStudentVisa(studentEmail, {
      passport_number: data.passport_number,
      passport_type: data.passport_type,
      issuing_authority: data.issuing_authority,
      pnr_number: data.pnr_number,
      visa_application_date: data.visa_application_date,
      visa_appointment_date: data.visa_appointment_date,
      consulate: data.consulate,
      has_been_to_germany: data.has_been_to_germany,
      updatedAt: new Date()
    });

    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStudent);
  } catch (error) {
    logError('Vize bilgileri güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Vize bilgileri güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 