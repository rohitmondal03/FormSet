import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, BarChart, Edit, Share2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Form } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { deleteForm } from '../actions';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('forms')
    .select(`id, title, created_at, form_responses(count)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching forms:', error);
    // Handle error appropriately
  }

  const forms: Form[] =
    data?.map(form => ({
      id: form.id,
      title: form.title,
      createdAt: new Date(form.created_at),
      responseCount: form.form_responses[0]?.count ?? 0,
      description: '', // Not fetched here for brevity
      fields: [], // Not fetched here for brevity
      url: `/f/${form.id}`,
    })) ?? [];

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Forms</h1>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.length > 0 ? (
              forms.map(form => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/builder/${form.id}`}
                      className="hover:underline"
                    >
                      {form.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/forms/${form.id}/responses`}>
                      <Badge variant="secondary">{form.responseCount}</Badge>
                    </Link>
                  </TableCell>
                  <TableCell>{format(form.createdAt, 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/builder/${form.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/responses`}>
                            <BarChart className="mr-2 h-4 w-4" />
                            <span>View Responses</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `${window.location.origin}/f/${form.id}`
                            )
                          }
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          <span>Share</span>
                        </DropdownMenuItem>
                        <form action={deleteForm.bind(null, form.id)}>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  You haven't created any forms yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
