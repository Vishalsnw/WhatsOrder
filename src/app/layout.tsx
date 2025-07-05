import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'WhatsOrder',
  description: 'Simple WhatsApp order form for small businesses',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
