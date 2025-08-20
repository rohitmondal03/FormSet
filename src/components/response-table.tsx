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
  import type { Form, FormResponse } from '@/lib/types';
  
  interface ResponseTableProps {
    form: Form;
    responses: FormResponse[];
  }
  
  export function ResponseTable({ form, responses }: ResponseTableProps) {
    const headers = ['Submitted At', ...form.fields.map((f) => f.label)];
  
    const renderCell = (data: any) => {
      if (Array.isArray(data)) {
        return (
          <div className="flex flex-wrap gap-1">
            {data.map((item, index) => <Badge key={index} variant="secondary">{String(item)}</Badge>)}
          </div>
        );
      }
      if (typeof data === 'object' && data !== null) {
        return JSON.stringify(data);
      }
      return String(data);
    };
  
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.length > 0 ? (
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>{format(response.submittedAt, 'MMM d, yyyy, h:mm a')}</TableCell>
                  {form.fields.map((field) => (
                    <TableCell key={field.id}>{renderCell(response.data[field.id])}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-24 text-center">
                  No responses yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
  