// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WhatsOrder',
  description: 'Simple WhatsApp order form for small businesses',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
