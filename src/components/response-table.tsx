
'use client';

import { useState } from 'react';
import { ExternalLink, FileSearch } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Form, FormResponse } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ResponseTableProps {
  form: Form | null;
  responses: FormResponse[];
}

export function ResponseTable({ form, responses }: ResponseTableProps) {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const headers = ['Submitted At', ...form?.fields.map((f) => f.label) || []];

  const refineText = (text: string) => {
    return text.trim().replace(/\s+/g, ' ').replaceAll("-", " ").toUpperCase();
  }

  const handleViewFile = (url: string) => {
    setSelectedFileUrl(url);
    setIsFileDialogOpen(true);
  };

  const renderCell = (data: any) => {
    if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('https:'))) {
      if (data.toLowerCase().endsWith('.pdf')) {
        return (
          <Button variant="outline" size="sm" onClick={() => handleViewFile(data)}>
            <FileSearch className='mr-2 h-4 w-4' />
            View PDF
          </Button>
        );
      }
      return (
        <Button asChild variant="link" className='p-0 h-auto'>
          <Link href={data} target='_blank' rel='noopener noreferrer'>
            View File <ExternalLink className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      )
    }
    if (Array.isArray(data)) {
      return (
        <div className="grid grid-rows-2 gap-1">
          {data.map((item, index) =>
            <Badge key={index} variant="secondary">
              {refineText(String(item))}
            </Badge>)}
        </div>
      );
    }
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data);
    }
    return refineText(String(data));
  };

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.length > 0 ? (
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>{format(new Date(response.submittedAt), 'MMM d, yyyy, h:mm a')}</TableCell>
                  {form?.fields.map((field) => (
                    <TableCell key={field.id}>
                      {response.data[field.id] ? renderCell(response.data[field.id]) : '-'}
                    </TableCell>
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

      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>PDF Document Viewer</DialogTitle>
          </DialogHeader>
          <div className="h-full w-full">
            {selectedFileUrl && (
              <iframe
                src={selectedFileUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
