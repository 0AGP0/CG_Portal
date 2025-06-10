import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail, getRecordByEmail, updateDocumentRecord } from '@/utils/database';

// Route parametreleri için tip tanımı
type RouteContext = {
  params: {
    email: string;
  };
};

// GET handler
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const studentEmail = decodeURIComponent(context.params.email);
    const advisorEmail = request.headers.get('x-user-email') || '';
    
    if (!advisorEmail) {
      return NextResponse.json({ error: 'Oturum bilgisi gerekli' }, { status: 401 });
    }
    
    const advisor = await getAdvisorByEmail(advisorEmail);
    
    if (!advisor) {
      return NextResponse.json({ error: 'Danışman bulunamadı' }, { status: 404 });
    }
    
    if (!advisor.studentIds.includes(studentEmail)) {
      return NextResponse.json({ error: 'Bu öğrenci sizin danışanınız değil' }, { status: 403 });
    }
    
    const student = await getRecordByEmail(studentEmail);
    
    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      documents: student.documents || []
    });
  } catch (error) {
    console.error('Belge listeleme hatası:', error);
    return NextResponse.json({ error: 'Veri alma hatası' }, { status: 500 });
  }
}

// POST handler
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const studentEmail = decodeURIComponent(context.params.email);
    const advisorEmail = request.headers.get('x-user-email') || '';
    
    if (!advisorEmail) {
      return NextResponse.json({ error: 'Oturum bilgisi gerekli' }, { status: 401 });
    }
    
    const advisor = await getAdvisorByEmail(advisorEmail);
    
    if (!advisor) {
      return NextResponse.json({ error: 'Danışman bulunamadı' }, { status: 404 });
    }
    
    if (!advisor.studentIds.includes(studentEmail)) {
      return NextResponse.json({ error: 'Bu öğrenci sizin danışanınız değil' }, { status: 403 });
    }
    
    const student = await getRecordByEmail(studentEmail);
    
    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
    }
    
    const body = await request.json();
    
    if (!body.documentType || !body.documentUrl || !body.documentName) {
      return NextResponse.json({ 
        error: 'Belge tipi, URL ve adı zorunludur' 
      }, { status: 400 });
    }
    
    const result = await updateDocumentRecord({
      email: studentEmail,
      documentType: body.documentType,
      documentUrl: body.documentUrl,
      documentName: body.documentName,
      uploadedBy: advisor.id,
      uploadedByRole: 'advisor',
      updatedAt: new Date().toISOString()
    });
    
    if (!result) {
      return NextResponse.json({ error: 'Belge eklenemedi' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Belge başarıyla eklendi',
      document: {
        documentType: body.documentType,
        documentUrl: body.documentUrl,
        documentName: body.documentName,
        uploadedBy: advisor.id,
        uploadedByRole: 'advisor',
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Belge yükleme hatası:', error);
    return NextResponse.json({ error: 'İşlem hatası' }, { status: 500 });
  }
} 