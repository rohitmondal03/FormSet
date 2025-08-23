'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, Plus, Sparkles } from 'lucide-react';
import { getSuggestions } from '@/app/actions';
import { useFormState, useFormStatus } from 'react-dom';
import type { FormField } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useActionState } from 'react';

interface AISuggesterProps {
  fields: FormField[];
  setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Suggestions</>}
    </Button>
  )
}

export function AISuggester({ fields, setFields }: AISuggesterProps) {
  const [state, formAction] = useActionState(getSuggestions, { suggestions: [], error: undefined });

  const addSuggestion = (suggestion: string) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: 'text', // default to text, user can change it
      label: suggestion,
      required: true,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bot className="mr-2 h-4 w-4" /> AI Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI Form Content Suggester</DialogTitle>
          <DialogDescription>
            Describe what kind of information you want to collect, and we'll suggest some questions.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Form Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g., A survey to get feedback on our new mobile app from beta testers."
              required
              rows={3}
            />
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
        {state.suggestions && state.suggestions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Suggestions</h4>
            <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
              {state.suggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <p className="text-sm">{s}</p>
                  <Button variant="ghost" size="icon" onClick={() => addSuggestion(s)}>
                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </div>
              ))}
            </div>
            <DialogFooter className='mt-4'>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
