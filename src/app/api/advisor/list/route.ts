import { NextRequest, NextResponse } from 'next/server';
import { loadAdvisorsDb, AdvisorRecord } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Tüm danışmanları getir
    const db = await loadAdvisorsDb();
    
    // Hassas bilgileri filtrele
    const advisors = db.advisors.map((advisor: AdvisorRecord) => ({
      id: advisor.id,
      name: advisor.name,
      email: advisor.email,
      studentIds: advisor.studentIds || [],
      updatedAt: advisor.updatedAt
    }));
    
    return NextResponse.json({ 
      success: true, 
      advisors 
    });
    
  } catch (error) {
    logError('Danışman listesi hatası', error);
    return NextResponse.json({ 
      error: 'Danışman listesi alınırken bir hata oluştu' 
    }, { 
      status: 500 
    });
  }
} 