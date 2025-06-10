import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUnreadMessagesCount } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    // URL'den email parametresini al
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parametresi gerekli' },
        { status: 400 }
      );
    }

    // Mesaj veritabanını oku
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const messages = data.messages || [];

    // Okunmamış mesajları say
    const unreadCount = messages.filter((message: any) => 
      message.receiverEmail.toLowerCase() === email.toLowerCase() && !message.isRead
    ).length;

    return NextResponse.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Okunmamış mesaj sayısı getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Okunmamış mesaj sayısı alınamadı' },
      { status: 500 }
    );
  }
} 