import SupabaseListener from '@/components/supabase-listener';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'FormFlow',
  description: 'Modern Form Builder Web App',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <SupabaseListener serverAccessToken={session?.access_token} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}