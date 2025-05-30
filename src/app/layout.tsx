import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { MessagesProvider } from '@/context/MessagesContext';

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
          <MessagesProvider>
            {children}
          </MessagesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
