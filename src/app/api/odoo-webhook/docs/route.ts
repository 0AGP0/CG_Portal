import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/utils/security';
import { updateDocumentRecord } from '@/utils/database';
import { logWebhook, logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('X-Hub-Signature') || '';
    
    logWebhook('odoo-webhook-docs', 'success', { 
      email: body.email, 
      document_type: body.document_type 
    });
    
    // Webhook imzasını doğrula
    const isValidSignature = verifyWebhookSignature(
      JSON.stringify(body),
      signature,
      process.env.ODOO_WEBHOOK_SECRET || ''
    );
    
    if (!isValidSignature) {
      logError('Geçersiz doküman webhook imzası', { signature });
      return NextResponse.json({ error: 'Geçersiz imza' }, { status: 401 });
    }
    
    // Gerekli alanların varlığını kontrol et
    if (!body.email || !body.document_type || !body.document_url) {
      logError('Eksik doküman bilgisi', body);
      return NextResponse.json({ 
        error: 'Email, doküman tipi veya URL bilgisi eksik' 
      }, { status: 400 });
    }
    
    // Doküman bilgisini güncelle
    const result = await updateDocumentRecord({
      email: body.email,
      documentType: body.document_type,
      documentUrl: body.document_url,
      documentName: body.document_name || 'Belge',
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    logError('Doküman webhook işleme hatası', error);
    return NextResponse.json({ error: 'İşlem hatası' }, { status: 500 });
  }
} 