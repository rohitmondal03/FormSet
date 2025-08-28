
'use client';

import Link from 'next/link';
import { MoreHorizontal, BarChart, Edit, Trash2, Link2, CopyIcon } from 'lucide-react';
import { deleteForm } from '@/app/actions';
import { copyText } from '@/lib/form-utils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from '@/components/ui/button';

export function FormActions({ formId }: { formId: string }) {
  const { toast } = useToast();

  const copyFormLink = (linkToOpen: string) => {
    copyText(linkToOpen);
    toast({
      title: 'Copied to clipboard!',
      description: 'The form link has been copied to your clipboard.',
    });
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/builder/${formId}`}>
              <Edit className="mr-2 size-4" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/forms/${formId}/responses`}>
              <BarChart className="mr-2 size-4" />
              <span>View Responses</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/f/${formId}`} target="_blank" rel="noopener noreferrer">
              <Link2 className="mr-2 size-4" />
              <span>Open Form</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyFormLink(`${window.location.origin}/f/${formId}`)}>
            <CopyIcon className="mr-2 size-4" />
            <span>Copy Form Link</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="w-full text-destructive focus:bg-destructive"
              onSelect={(e) => e.preventDefault()} // Prevent DropdownMenu from closing
            >
              <Trash2 className="mr-2 size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this form and all of its associated responses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={async () => { await deleteForm(formId) }}>
                <Button type="submit" variant="destructive">
                  Delete Form
                </Button>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </DropdownMenuContent>
      </DropdownMenu>
    </AlertDialog>
  );
}
