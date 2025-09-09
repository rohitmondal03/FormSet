
'use client';

import Link from 'next/link';
import { MoreHorizontal, BarChart, Edit, Trash2, Link2, CopyIcon, Undo } from 'lucide-react';
import { deleteForm, undoDeleteForm } from '@/lib/actions';
import { copyText } from '@/lib/form-utils';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField } from '@/lib/types';
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

  const handleDelete = async () => {
    const result = await deleteForm(formId);
    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.success && result.deletedForm) {
      const deletedForm = result.deletedForm;
      toast({
        title: 'Form Deleted',
        description: `The form "${deletedForm.title}" has been deleted.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const undoResult = await undoDeleteForm(deletedForm as Form & { form_fields: FormField[] });
              if (undoResult.success) {
                toast({
                  title: 'Form Restored',
                  description: `The form "${deletedForm.title}" has been restored.`,
                });
              } else {
                toast({
                  title: 'Error',
                  description: undoResult.error,
                  variant: 'destructive',
                });
              }
            }}
          >
            <Undo className="mr-2 h-4 w-4" /> Undo
          </Button>
        ),
      });
    }
  };

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
              className="w-full text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
              onSelect={(e) => e.preventDefault()} // Prevent DropdownMenu from closing
            >
              <Trash2 className="mr-2 size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          
        </DropdownMenuContent>
      </DropdownMenu>
       <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this form and all of its associated responses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete Form
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
    </AlertDialog>
  );
}
