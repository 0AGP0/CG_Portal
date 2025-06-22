import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rol bazlı erişim yolları
const ROLE_PATHS = {
  admin: ['/admin'],
  advisor: ['/advisor'],
  student: ['/dashboard', '/applications', '/documents', '/messages', '/profile', '/settings', '/education', '/visa', '/process', '/notifications']
};

// API endpoint'leri
const API_PATHS = {
  auth: ['/api/auth/student', '/api/auth/advisor', '/api/auth/admin'],
  student: ['/api/student', '/api/messages/unread'],
  advisor: ['/api/advisor'],
  admin: ['/api/admin']
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API istekleri için CORS ayarları
  if (pathname.startsWith('/api/')) {
    // OPTIONS isteklerini hemen yanıtla
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Auth endpoint'leri için token kontrolü yapma
    if (API_PATHS.auth.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Diğer API istekleri için token kontrolü
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // API yanıtlarına CORS başlıkları ekle
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // Sayfa istekleri için yönlendirme kontrolü
  const userCookie = request.cookies.get('user')?.value;
  if (!userCookie) {
    // Giriş yapmamış kullanıcıları login sayfasına yönlendir
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const user = JSON.parse(userCookie);
    const userRole = user.role;

    // Kullanıcının rolüne göre erişim kontrolü
    const allowedPaths = ROLE_PATHS[userRole as keyof typeof ROLE_PATHS] || [];
    const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowedPath) {
      // Yetkisiz erişim durumunda kullanıcıyı kendi dashboard'una yönlendir
      const redirectPath = userRole === 'admin' ? '/admin' : 
                          userRole === 'advisor' ? '/advisor/dashboard' : 
                          '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Cookie geçersizse login sayfasına yönlendir
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Middleware'in hangi yollarda çalışacağını belirt
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/advisor/:path*',
    '/admin/:path*',
    '/login'
  ]
}; 