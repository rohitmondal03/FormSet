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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Boldonse&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SupabaseListener serverAccessToken={undefined} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
