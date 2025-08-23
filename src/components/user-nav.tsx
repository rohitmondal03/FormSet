
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { logout, updateProfile } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/lib/types';

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function getUserAndProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
        }
      }
      setLoading(false);
    }
    getUserAndProfile();
  }, [supabase]);

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const handleProfileSave = async () => {
    const { error } = await updateProfile({ full_name: fullName });
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setProfileOpen(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || user?.user_metadata.avatar_url} alt={user?.email || '@user'} />
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
          <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout}>
            <Button variant={"destructive"} type='submit' className="relative w-full">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" value={user?.email} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleProfileSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
             <DialogDescription>
              Settings page is under construction.
            </DialogDescription>
          </DialogHeader>
           <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
