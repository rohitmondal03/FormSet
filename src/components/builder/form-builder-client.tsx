
'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, CopyIcon, BadgeInfo } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, } from '@dnd-kit/sortable';
import type { Form, FormField } from '@/lib/types';
import { fieldTypes } from '@/lib/form-utils';
import { copyText } from '@/lib/form-utils';
import { useToast } from '@/hooks/use-toast';
import { saveForm } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import FieldSettingsPanel from './field-settings-panel';
import { FormFieldWrapper } from './form-field';
import { FieldPalette } from './field-palette';
import { FormCanvas } from './form-canvas';
import { AISuggester } from './ai-suggester';

interface FormBuilderClientProps {
  form: Form & { fields: FormField[] };
}

export function FormBuilderClient({ form }: FormBuilderClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [fields, setFields] = useState<FormField[]>(form.fields.sort((a, b) => a.order - b.order));
  const [limitOneResponsePerEmail, setLimitOneResponsePerEmail] = useState(form.limit_one_response_per_email);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [activeField, setActiveField] = useState<FormField | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      }
    }),
    useSensor(KeyboardSensor)
  )

  const addField = (type: FormField['type'], index: number = fields.length) => {
    if (!form || !form.id) return;

    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      order: index,
      options: [],
      form_id: form.id,
      placeholder: null,
      properties: null,
      validation: null
    };

    if (type === 'radio' || type === 'select' || type === 'checkbox') {
      newField.options = [{ value: 'option-1', label: 'Option 1' }];
    }

    const newFields = [...fields];
    newFields.splice(index, 0, newField);
    // Re-order
    const orderedFields = newFields.map((f, i) => ({ ...f, order: i }));
    setFields(orderedFields);
  };

  const undoRemoveField = (fieldToRestore: FormField) => {
    const newFields = [...fields];
    newFields.splice(fieldToRestore.order, 0, fieldToRestore);
    setFields(newFields.map((f, i) => ({ ...f, order: i })));
  };

  const updateField = (id: string, updatedField: Partial<FormField>) => {
    const newFields = fields.map(f => (f.id === id ? { ...f, ...updatedField } : f));
    setFields(newFields);
    if (selectedField && selectedField.id === id) {
      setSelectedField({ ...selectedField, ...updatedField });
    }
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isPaletteItem = active.data.current?.isPaletteItem;

    if(!form || !form.id) return;

    if (isPaletteItem) {
      const fieldTypeData = fieldTypes.find(f => f.type === active.data.current?.type);
      if (!fieldTypeData) return;
      setActiveField({
        id: `palette-${active.data.current?.type}`,
        type: active.data.current?.type,
        label: fieldTypeData.label,
        required: false,
        order: -1,
        form_id: form.id,
        placeholder: null,
        properties: null,
        validation: null,
        options: null
      });
    } else {
      const field = fields.find(f => f.id === active.id);
      if (field) {
        setActiveField(field);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveField(null);
    if (!over) return;

    const isPaletteItem = active.data.current?.isPaletteItem;

    if (isPaletteItem) {
      const overId = over.id === 'form-canvas-droppable' ? null : over.id;
      const overIndex = overId ? fields.findIndex(f => f.id === overId) : fields.length;
      addField(active.data.current?.type, overIndex);
    } else {
      // Reordering existing fields
      const activeId = active.id;
      const overId = over.id;

      if (activeId !== overId) {
        setFields((items) => {
          const oldIndex = items.findIndex((item) => item.id === activeId);
          const newIndex = items.findIndex((item) => item.id === overId);
          const reorderedItems = arrayMove(items, oldIndex, newIndex);
          return reorderedItems.map((item, index) => ({ ...item, order: index }));
        });
      }
    }
  }


  const handleSave = async () => {
    setIsSaving(true);
    const formToSave: Form & { fields: FormField[] } = {
      ...form,
      title,
      description,
      fields: fields.map((f, index) => ({ ...f, order: index })),
      limit_one_response_per_email: limitOneResponsePerEmail,
    };

    try {
      const { formId } = await saveForm(formToSave);
      toast({
        title: 'Success!',
        description: 'Your form has been saved.',
      });
      if (form.id === 'new' && formId) {
        router.push(`/dashboard/builder/${formId}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: `Error: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = useCallback(async () => {
    if (form.id === 'new') {
      toast({
        title: 'Save your form first',
        description: 'You must save your form before you can share it.',
        variant: 'destructive',
      });
      return;
    }
    const formUrl = `${window.location.origin}/f/${form.id}`;
    await copyText(formUrl);
    toast({
      title: 'Copied to clipboard!',
      description: 'The form link has been copied to your clipboard.',
    });
  }, [form.id, toast]);

  const PreviewButton = () => {
    const isNewForm = form.id === 'new';

    if (isNewForm) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button variant="outline" size="sm" disabled>
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save the form to enable preview.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button variant="secondary" size="sm" asChild>
        <Link href={`/f/${form.id}`} target="_blank">
          <Eye className="mr-2 h-4 w-4" /> Preview
        </Link>
      </Button>
    );
  };

  const SaveButton = () => {
    const noFields = fields.length === 0;
    const button = (
      <Button size="sm" onClick={handleSave} disabled={isSaving || noFields}>
        <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save'}
      </Button>
    )

    if (noFields) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                {button}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add at least one field to save the form.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }


  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="flex flex-col gap-4 h-[calc(100vh-10rem)]">
        <header className="p-4 space-y-4 bg-card rounded-t-lg">
          <div className='flex flex-col gap-2 lg:flex-row items-center justify-between w-full'>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="font-bold border border-zinc-600 w-full"
              placeholder="Form Title"
            />
            <div className="flex items-center gap-2 w-fit">
              {/* <AISuggester fields={fields} setFields={setFields} /> */}
              <PreviewButton />
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <CopyIcon className="mr-2 h-4 w-4" /> Copy Link
              </Button>
              <SaveButton />
            </div>
          </div>
          <div className='w-full mt-2 lg:mt-0'>
            <Textarea id="form-description" value={!description ? undefined : description} onChange={e => setDescription(e.target.value)} className="border border-zinc-600 w-full" placeholder='Enter form description' />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="limit-one-response" checked={limitOneResponsePerEmail || false} onCheckedChange={setLimitOneResponsePerEmail} />
            <Label htmlFor="limit-one-response">Limit to one response per email</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type='button'><BadgeInfo className="h-4 w-4 text-zinc-500" /></button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Limiting to one response per email helps prevent spam and abuse.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        <Separator />
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
          <main className="lg:col-span-3 h-full">
            <div className="bg-card p-4 rounded-lg border border-zinc-600 h-full overflow-y-auto">
              <ScrollArea className="h-full pr-4">
                <FormCanvas
                  fields={fields}
                  setSelectedField={setSelectedField}
                  removeField={removeField}
                />
              </ScrollArea>
            </div>
          </main>
          <aside className="lg:col-span-1 h-full">
            <FieldPalette />
          </aside>
        </div>
      </div>
      <DragOverlay>
        {activeField && (
          <FormFieldWrapper
            field={activeField}
            onSelect={() => { }}
            removeField={() => { }}
          />
        )}
      </DragOverlay>
      {selectedField && (
        <FieldSettingsPanel
          field={selectedField}
          onClose={() => setSelectedField(null)}
          updateField={updateField}
          removeField={removeField}
          onUndo={undoRemoveField}
        />
      )}
    </DndContext>
  );
}
