
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FileSearch } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Form, FormResponse as FormResponseType } from '@/lib/types';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PDFViewer } from './pdf-viewer';
import { ScrollArea } from './ui/scroll-area';

interface ResponseTableProps {
  form: Form | null;
  responses: FormResponseType[];
}

export function ResponseTable({ form, responses }: ResponseTableProps) {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'pdf' | 'image' | 'docx' | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const headers = ['Submitted At', ...form?.fields?.map((f) => f.label) || []];

  const refineText = (text: string) => {
    return text.trim().replace(/\s+/g, ' ').replaceAll("-", " ").toUpperCase();
  }

  const handleViewFile = (url: string, type: 'pdf' | 'image' | 'docx') => {
    setSelectedFileUrl(url);
    setSelectedFileType(type);
    setIsFileDialogOpen(true);
  };

  const renderCell = (data: any) => {
    if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('https:'))) {
      const lower = data.toLowerCase();
      if (lower.endsWith('.pdf')) {
        return (
          <Button variant="outline" size="sm" onClick={() => handleViewFile(data, 'pdf')}>
            <FileSearch className='mr-2 size-4' />
            View PDF
          </Button>
        );
      }
      if (lower.endsWith('.docx')) {
        return (
          <Button variant="outline" size="sm" onClick={() => handleViewFile(data, 'docx')}>
            <FileSearch className='mr-2 size-4' />
            View DOCX
          </Button>
        );
      }
      if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        return (
          <Button variant="outline" size="sm" onClick={() => handleViewFile(data, 'image')}>
            <FileSearch className='mr-2 size-4' />
            View Image
          </Button>
        );
      }
      return (
        <Button asChild variant="link" className='p-0 h-auto'>
          <Link href={data} target='_blank' rel='noopener noreferrer'>
            View File
          </Link>
        </Button>
      )
    }
    if (Array.isArray(data)) {
      return (
        <div className="grid grid-rows-2 gap-1">
          {data.map((item, index) => (
            <Badge key={index} variant="secondary">
              {refineText(String(item))}
            </Badge>
          ))}
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
      <ScrollArea className="w-full">
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
                      <TableCell>{format(new Date(response.created_at), 'MMM d, yyyy, h:mm a')}</TableCell>
                      {form?.fields?.map((field) => (
                        <TableCell key={field.id}>
                          {response.data && (response.data as any)[field.id] ? renderCell((response.data as any)[field.id]) : '-'}
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
      </ScrollArea>

      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedFileType === 'pdf' && 'PDF Document Viewer'}
              {selectedFileType === 'image' && 'Image Viewer'}
              {selectedFileType === 'docx' && 'DOCX Document'}
            </DialogTitle>
          </DialogHeader>
          {selectedFileUrl && selectedFileType === 'pdf' && (
            <div className='overflow-y-scroll size-full'>
              <PDFViewer filePath={selectedFileUrl} />
            </div>
          )}
          {selectedFileUrl && selectedFileType === 'image' && (
            <div className="flex justify-center">
              <Image src={selectedFileUrl} alt="Selected" className="max-h-[80vh] max-w-full object-contain" width={1200} height={1200} />
            </div>
          )}
          {selectedFileUrl && selectedFileType === 'docx' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted-foreground">DOCX preview is not supported. You can download and view the file using Microsoft Word or Google Docs.</p>
              <a href={selectedFileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <FileSearch className='mr-2 size-4' />
                  Download DOCX
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
