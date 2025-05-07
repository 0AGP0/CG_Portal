import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/utils/security';
import { updateOrCreateRecord } from '@/utils/database';
import { logWebhook, logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('X-Hub-Signature') || '';
    
    logWebhook('odoo-webhook', 'success', { email: body.email, stage: body.stage });
    
    // Webhook imzasını doğrula
    const isValidSignature = verifyWebhookSignature(
      JSON.stringify(body),
      signature,
      process.env.ODOO_WEBHOOK_SECRET || ''
    );
    
    if (!isValidSignature) {
      logError('Geçersiz webhook imzası', { signature });
      return NextResponse.json({ error: 'Geçersiz imza' }, { status: 401 });
    }
    
    // Gerekli alanların varlığını kontrol et
    if (!body.email) {
      logError('Email bilgisi eksik', body);
      return NextResponse.json({ error: 'Email bilgisi bulunamadı' }, { status: 400 });
    }
    
    // Veriyi depola
    const result = await updateOrCreateRecord({
      email: body.email,
      lead_id: body.lead_id,
      stage: body.stage,
      university: body.university,
      program: body.program,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    logError('Webhook işleme hatası', error);
    return NextResponse.json({ error: 'İşlem hatası' }, { status: 500 });
  }
} 