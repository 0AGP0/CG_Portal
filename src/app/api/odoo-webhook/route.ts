import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord } from '@/utils/database';
import { logWebhook, logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret') || '';
    
    // Odoo'dan gelen veri formatına uygun olarak email bilgisini çıkartalım
    const email = body.email || body.x_studio_mail_adresi || null;
    
    logWebhook('odoo-webhook', 'success', { 
      email: email, 
      name: body.name, 
      action: body._action 
    });
    
    // URL'deki secret parametresini kontrol et
    if (secretParam !== process.env.ODOO_WEBHOOK_SECRET) {
      logError('Geçersiz webhook secret parametresi', { secretParam });
      return NextResponse.json({ error: 'Geçersiz güvenlik anahtarı' }, { status: 401 });
    }
    
    // Gerekli alanların varlığını kontrol et
    if (!email) {
      logError('Email bilgisi eksik', body);
      return NextResponse.json({ error: 'Email bilgisi bulunamadı' }, { status: 400 });
    }
    
    // Veriyi depola
    const result = await updateOrCreateRecord({
      email: email,
      lead_id: body.id || body._id,
      stage: body.stage || 'yeni',
      university: body.university || body.x_studio_university,
      program: body.program || body.x_studio_program,
      name: body.name,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    logError('Webhook işleme hatası', error);
    return NextResponse.json({ error: 'İşlem hatası' }, { status: 500 });
  }
} 