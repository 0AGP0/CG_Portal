import { NextRequest, NextResponse } from 'next/server';
import { markMessageAsRead } from '@/lib/db';
import { logError } from '@/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messageId = parseInt(id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Geçersiz mesaj ID\'si' },
        { status: 400 }
      );
    }

    const updatedMessage = await markMessageAsRead(messageId);
    
    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mesaj okundu olarak işaretlendi',
      data: updatedMessage
    });
    
  } catch (error) {
    logError('Mesaj okundu işaretleme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj işaretlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 