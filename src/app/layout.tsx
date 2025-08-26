import type { Metadata } from 'next';
import './globals.css';
import SupabaseListener from '@/components/supabase-listener';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'FormSet',
  description: 'Modern Form Builder Web App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SupabaseListener serverAccessToken={undefined} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
