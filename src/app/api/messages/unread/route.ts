import { NextRequest, NextResponse } from 'next/server';
import { getUnreadMessageCount } from '@/lib/db';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gereklidir' },
        { status: 401 }
      );
    }

    const count = await getUnreadMessageCount(email);

    return NextResponse.json({
      success: true,
      count
    });
    
  } catch (error) {
    logError('Okunmamış mesaj sayısı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Okunmamış mesaj sayısı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 