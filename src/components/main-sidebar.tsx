
'use client';

import Link from 'next/link';
import { Home, Settings, LifeBuoy, FilePlus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { useUserNav } from './user-nav';

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <span className="font-bold text-lg">FormSet</span>
  </div>
);

export function MainSidebar() {
  const { setSettingsOpen } = useUserNav();

  return (
    <Sidebar variant='sidebar'>
      <SidebarHeader className='my-4'>
        <Logo />
      </SidebarHeader>
      <SidebarContent className='px-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard/builder/new">
              <Button className="w-full">
                <FilePlus className="mr-2 size-4" />
                Create Form
              </Button>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <Button className="w-full" variant={"secondary"}>
                <Home className="mr-2 size-4" />
                My Forms
              </Button>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="#">
              <SidebarMenuButton className='w-full justify-start'>
                <LifeBuoy className="mr-2 size-4" />
                Help
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className='w-full justify-start' onClick={() => setSettingsOpen(true)}>
              <Settings className="mr-2 size-4" />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
