import type { Metadata } from 'next';
import { Montserrat } from "next/font/google";
import SupabaseListener from '@/components/supabase-listener';
import ClientLayout from './client-layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'FormSet',
  description: 'Modern Form Builder Web App',
  creator: 'Rohit Mondal',
};

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '300', '700'],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`boldonse antialiased`}>
        <SupabaseListener serverAccessToken={undefined} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
