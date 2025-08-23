'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, BarChart, Edit, Share2, Trash2 } from 'lucide-react';
import { deleteForm } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function FormActions({ formId }: { formId: string }) {
  const { toast } = useToast();

  const handleShare = () => {
    const formUrl = `${window.location.origin}/f/${formId}`;
    navigator.clipboard.writeText(formUrl);
    toast({
      title: 'Copied to clipboard!',
      description: 'The form link has been copied to your clipboard.',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/builder/${formId}`}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/forms/${formId}/responses`}>
            <BarChart className="mr-2 h-4 w-4" />
            <span>View Responses</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <form action={deleteForm.bind(null, formId)}>
          <button
            type="submit"
            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-destructive focus:bg-accent focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
