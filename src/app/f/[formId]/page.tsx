import { PublicForm } from "@/components/public-form/public-form";

interface PublicFormPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const formId = (await params).formId;

  return (
    <>
      <PublicForm formId={formId} />
    </>
  );
}