import type { Metadata } from 'next';
import SupabaseListener from '@/components/supabase-listener';
import ClientLayout from './client-layout';
import './globals.css';

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
      <body className="font-body antialiased">
        <SupabaseListener serverAccessToken={undefined} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
