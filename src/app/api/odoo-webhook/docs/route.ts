import { NextRequest, NextResponse } from 'next/server';
import { updateDocumentRecord } from '@/utils/database';
import { logWebhook, logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret') || '';
    
    // Odoo'dan gelen veri formatına uygun olarak email bilgisini çıkartalım
    const email = body.email || body.x_studio_mail_adresi || null;
    const documentType = body.document_type || body.x_studio_document_type;
    const documentUrl = body.document_url || body.x_studio_document_url;
    const documentName = body.document_name || body.x_studio_document_name || 'Belge';
    
    logWebhook('odoo-webhook-docs', 'success', { 
      email: email, 
      document_type: documentType 
    });
    
    // URL'deki secret parametresini kontrol et
    if (secretParam !== process.env.ODOO_WEBHOOK_SECRET) {
      logError('Geçersiz doküman webhook secret parametresi', { secretParam });
      return NextResponse.json({ error: 'Geçersiz güvenlik anahtarı' }, { status: 401 });
    }
    
    // Gerekli alanların varlığını kontrol et
    if (!email || !documentType || !documentUrl) {
      logError('Eksik doküman bilgisi', body);
      return NextResponse.json({ 
        error: 'Email, doküman tipi veya URL bilgisi eksik' 
      }, { status: 400 });
    }
    
    // Doküman bilgisini güncelle
    const result = await updateDocumentRecord({
      email: email,
      documentType: documentType,
      documentUrl: documentUrl,
      documentName: documentName,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    logError('Doküman webhook işleme hatası', error);
    return NextResponse.json({ error: 'İşlem hatası' }, { status: 500 });
  }
} 