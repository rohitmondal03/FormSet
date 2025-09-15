import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { baseUrl } from '@/lib/utils';
import SupabaseListener from '@/components/supabase-listener';
import ClientLayout from './client-layout';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FormSet',
  description: 'Modern Form Builder Web App',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "FormSet",
    description: "Build forms like never before",
    url: baseUrl,
    siteName: "FormSet",
  },
  twitter: {
    card: "summary_large_image",
    title: "FormSet",
    description: "Build forms like never before",
  },
}


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
        <SpeedInsights />
      </body>
    </html>
  );
}
