
'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { logout, updateProfile } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileDialog } from './user-nav/profile-dialog';
import { SettingDialog } from './user-nav/setting-dialog';


interface UserNavContextType {
  setSettingsOpen: (open: boolean) => void;
}

const UserNavContext = createContext<UserNavContextType | undefined>(undefined);

export const useUserNav = () => {
  const context = useContext(UserNavContext);
  if (!context) {
    throw new Error('useUserNav must be used within a UserNavProvider');
  }
  return context;
};

export const UserNavProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <UserNavContext.Provider value={{ setSettingsOpen }}>
      {children}
      <SettingDialog isSettingsOpen={isSettingsOpen} setSettingsOpen={setSettingsOpen} />
    </UserNavContext.Provider>
  )
}

export function UserNav() {
  const supabase = createClient();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { setSettingsOpen } = useUserNav();
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function getUserAndProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    }
    getUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        getUserAndProfile();
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    toast({ title: 'Uploading...', description: 'Your new profile picture is being uploaded.' });
    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setProfileOpen(false);
      // Re-fetch profile to get new avatar URL
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
        if (profileData) setProfile(profileData);
      }
    }
    setIsSaving(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <Skeleton className="size-9 rounded-full" />;
  }
  
  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative size-8 rounded-full">
            <Avatar className="size-9">
              <AvatarImage src={profile?.avatar_url || ''} alt={user?.email || '@user'} />
              <AvatarFallback>{getInitials(profile?.full_name, user?.email || '')}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => { setProfileOpen(true); setAvatarPreview(undefined); }}>
            <UserIcon className="mr-2 size-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings className="mr-2 size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout}>
            <Button variant={"destructive"} type='submit' className="relative w-full">
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog
        isProfileOpen={isProfileOpen}
        isSaving={isSaving}
        formRef={formRef}
        avatarPreview={avatarPreview}
        profileAvatarURL={profile?.avatar_url}
        avatarFallback={getInitials(profile?.full_name, user?.email || '')}
        fullName={profile?.full_name || undefined}
        email={user?.email}
        setProfileOpen={setProfileOpen}
        handleProfileSave={handleProfileSave}
        handleAvatarChange={handleAvatarChange}
      />
    </>
  );
}

    
