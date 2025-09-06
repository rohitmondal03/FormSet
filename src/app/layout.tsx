import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import SupabaseListener from '@/components/supabase-listener';
import ClientLayout from './client-layout';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FormSet',
  description: 'Modern Form Builder Web App',
  creator: 'Rohit Mondal',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${montserrat.className} antialiased`}>
        <SupabaseListener serverAccessToken={undefined} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
