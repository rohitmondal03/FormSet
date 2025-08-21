'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { suggestFormContent } from '@/ai/flows/suggest-form-content'
import { z } from 'zod'

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

const authSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function signup(formData: FormData) {
  const supabase = createClient()
  const validatedFields = authSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase.auth.signUp(validatedFields.data);

  if (error) {
    return redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function login(formData: FormData) {
    const supabase = createClient()
  
    const { error } = await supabase.auth.signInWithPassword({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      })
  
    if (error) {
      return redirect('/error')
    }
  
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}