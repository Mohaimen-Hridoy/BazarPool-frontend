import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { LanguageProvider } from '@/lib/i18n';
import { Navbar } from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BazarPool — Community-Based Wholesale Group-Buying Platform',
  description:
    'Join local group-buying pools for essential commodities. Unlock bulk wholesale pricing directly from producers with zero middlemen.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>© 2026 BazarPool Platform. Architected by Mohaimen Hridoy.</p>
                <div className="flex items-center gap-6">
                  <span>Concurrency-Safe Pools</span>
                  <span>Double-Entry Ledger</span>
                  <span>QR Pickup Authentication</span>
                </div>
              </div>
            </footer>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
