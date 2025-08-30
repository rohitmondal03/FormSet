import React from 'react'
import { FileUp } from 'lucide-react';
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

interface ProfileDialogProps {
  isProfileOpen: boolean;
  isSaving: boolean;
  formRef: React.RefObject<HTMLFormElement>;
  avatarPreview?: string;
  profileAvatarURL?: string | null;
  avatarFallback?: string;
  fullName?: string;
  email?: string;
  setProfileOpen: (open: boolean) => void;
  handleProfileSave: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileDialog({
  isProfileOpen,
  isSaving,
  formRef,
  avatarPreview,
  profileAvatarURL,
  avatarFallback,
  fullName,
  email,
  setProfileOpen,
  handleProfileSave,
  handleAvatarChange,
}: ProfileDialogProps) {
  return (
    <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleProfileSave} className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Label htmlFor='avatar' className='cursor-pointer'>
              <div className="size-32 p-1 rounded-full border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors relative">
                {avatarPreview || profileAvatarURL ? (
                  <Avatar className="size-fit">
                    <AvatarImage src={avatarPreview || profileAvatarURL || ''} alt={avatarFallback} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className='text-center'>
                    <FileUp className="w-8 h-8 mx-auto" />
                    <span>Upload</span>
                  </div>
                )}
              </div>
            </Label>
            <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={email} readOnly className="bg-muted" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="fullName"
              defaultValue={fullName}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
