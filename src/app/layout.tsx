import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { MessagesProvider } from '@/context/MessagesContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { DocumentProvider } from '@/context/DocumentContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Global Portal",
  description: "Üniversite süreçlerinizi takip edin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
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
