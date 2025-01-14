import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Notes PWA',
  description: 'A Progressive Web App for taking notes',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full flex-col bg-gray-50">
        <Header />
        <main className="mx-auto flex-1 w-full max-w-md px-4 pt-20 pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
