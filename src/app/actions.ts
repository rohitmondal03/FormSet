'use server';

import { suggestFormContent } from '@/ai/flows/suggest-form-content';
import { z } from 'zod';

const suggestionSchema = z.object({
  description: z.string().min(10, 'Please provide a more detailed description.'),
});

export async function getSuggestions(prevState: any, formData: FormData) {
  const validatedFields = suggestionSchema.safeParse({
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.description?.[0]
    };
  }

  try {
    const result = await suggestFormContent({ description: validatedFields.data.description });
    if (!result.suggestions || result.suggestions.length === 0) {
        return { error: 'Could not generate suggestions based on the description. Please try again with more details.' };
    }
    return { suggestions: result.suggestions };
  } catch (error) {
    console.error('AI suggestion error:', error);
    return { error: 'An unexpected error occurred while generating suggestions.' };
  }
}
