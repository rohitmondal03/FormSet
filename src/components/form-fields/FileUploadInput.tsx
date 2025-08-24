'use client';

import React, { useState } from 'react';
import type { FormField } from '@/lib/types';
import { Label } from '@/components/ui/label'; // Assuming you have a Label component
import { Input } from '@/components/ui/input'; // Assuming you have an Input component

interface FileUploadInputProps {
  field: FormField;
  // Add a prop for handling file changes, perhaps uploading directly or passing to a parent
  onFileChange?: (fieldId: string, file: File | null) => void;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ field, onFileChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (onFileChange) {
      onFileChange(field.id, file);
    }
    // Placeholder for handling file upload logic later
    if (file) {
      console.log('File selected:', file.name);
      // Here you would typically call a server action or API route
      // to handle the actual file upload to Supabase Storage.
      // Example: uploadFileAction(field.id, file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`file-upload-${field.id}`}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={`file-upload-${field.id}`}
        type="file"
        onChange={handleFileChange}
        required={field.required}
        // You might want to add file type validation based on field.validation or field.properties
        // accept=".jpg, .png, .pdf"
      />
      {field.placeholder && (
        <p className="text-sm text-muted-foreground">{field.placeholder}</p>
      )}
       {/* Display selected file name */}
       {selectedFile && (
        <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>
       )}
    </div>
  );
};

export default FileUploadInput;