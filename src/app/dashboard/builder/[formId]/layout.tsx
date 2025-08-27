import { Metadata } from 'next';
import React from 'react'
import { createClient } from "@/lib/supabase/server"

interface FormBuilderLayoutProps {
  children: React.ReactNode;
}

interface MetadataProps {
  params: Promise<{ formId: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { formId } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('forms')
    .select('title')
    .eq('id', formId)
    .single();

  if (error) {
    return {
      title: 'New Form Builder',
    }
  }

  return {
    title: data?.title || 'Form Builder',
  };
}

function FormBuilderLayout({ children }: FormBuilderLayoutProps) {
  return (
    <>{children}</>
  )
}

export default FormBuilderLayout;