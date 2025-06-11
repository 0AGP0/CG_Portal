import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Header'dan email parametresini al
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      logger.error('Email parametresi eksik');
      return NextResponse.json(
        { success: false, error: 'Email parametresi gerekli' },
        { status: 400 }
      );
    }

    logger.info('Okunmamış mesaj sayısı getiriliyor:', { email });

    // Mesaj veritabanını oku
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    if (!fs.existsSync(filePath)) {
      logger.info('Mesaj veritabanı bulunamadı, 0 dönülüyor');
      return NextResponse.json({ 
        success: true, 
        unreadCount: 0 
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const messages = data.messages || [];

    // Okunmamış mesajları say
    const unreadCount = messages.filter((message: any) => 
      message.receiverEmail.toLowerCase() === email.toLowerCase() && !message.isRead
    ).length;

    logger.info('Okunmamış mesaj sayısı:', { email, unreadCount });

    return NextResponse.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    logger.error('Okunmamış mesaj sayısı getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Okunmamış mesaj sayısı alınamadı' },
      { status: 500 }
    );
  }
} 