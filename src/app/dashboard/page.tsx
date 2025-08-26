import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Form } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FormActions } from '@/components/form-actions';

export default async function DashboardPage() {
  const supabase = await createClient();
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
  }

  const forms: Form[] =
    data?.map(form => ({
      id: form.id,
      title: form.title,
      createdAt: new Date(form.created_at),
      responseCount: form.form_responses[0]?.count ?? 0,
      description: '', 
      fields: [], 
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
                    <FormActions formId={form.id} />
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
