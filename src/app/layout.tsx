import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { MessagesProvider } from '@/context/MessagesContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { DocumentProvider } from '@/context/DocumentContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Campus Global Portal",
    template: "%s | Campus Global Portal"
  },
  description: "Yurt dışı eğitim süreçlerinizi kolayca yönetin. Başvuru takibi, belge yönetimi ve danışman desteği ile eğitim hayalinizi gerçekleştirin.",
  keywords: ["yurt dışı eğitim", "üniversite başvurusu", "eğitim danışmanlığı", "öğrenci portalı", "Campus Global"],
  authors: [{ name: "Campus Global" }],
  creator: "Campus Global",
  publisher: "Campus Global",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'Campus Global Portal',
    description: 'Yurt dışı eğitim süreçlerinizi kolayca yönetin. Başvuru takibi, belge yönetimi ve danışman desteği ile eğitim hayalinizi gerçekleştirin.',
    siteName: 'Campus Global Portal',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Campus Global Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campus Global Portal',
    description: 'Yurt dışı eğitim süreçlerinizi kolayca yönetin. Başvuru takibi, belge yönetimi ve danışman desteği ile eğitim hayalinizi gerçekleştirin.',
    images: ['/og-image.jpg'],
    creator: '@campusglobal',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console doğrulama kodu
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#002757" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DocumentProvider>
            <MessagesProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </MessagesProvider>
          </DocumentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
