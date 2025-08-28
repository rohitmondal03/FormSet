
'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { Header } from '@/components/header';
import { UserNavProvider } from '@/components/user-nav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserNavProvider>
        {isDashboard ? (
          <SidebarProvider>
            <MainSidebar />
            <SidebarInset>
              <Header />
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        ) : (
          children
        )}
        <Toaster />
      </UserNavProvider>
    </ThemeProvider>
  );
}
