import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id;
    
    // messages.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Mesajı bul
    const messageIndex = data.messages.findIndex((m: any) => m.id === messageId);
    
    if (messageIndex === -1) {
      logger.error('Mesaj bulunamadı:', messageId);
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }
    
    // Mesajı okundu olarak işaretle
    data.messages[messageIndex].isRead = true;
    
    // Değişiklikleri kaydet
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Mesaj okundu olarak işaretlendi'
    });
    
  } catch (error) {
    logger.error('Mesaj okundu işaretleme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj okundu olarak işaretlenemedi' },
      { status: 500 }
    );
  }
} 