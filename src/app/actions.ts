
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createActionClient } from '@/lib/supabase/server';
import { suggestFormContent } from '@/ai/flows/suggest-form-content';
import { z } from 'zod';
import type { Form, Profile } from '@/lib/types';
import { loginSchema, signupSchema } from '@/lib/zod/auth';

const suggestionSchema = z.object({
  description: z.string().min(10, 'Please provide a more detailed description.'),
});

export async function getSuggestions(prevState: any, formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to create a form.' };
  }

  const validatedFields = suggestionSchema.safeParse({
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.description?.[0],
    };
  }

  try {
    const result = await suggestFormContent({
      description: validatedFields.data.description,
    });
    if (!result.suggestions || result.suggestions.length === 0) {
      return {
        error:
          'Could not generate suggestions based on the description. Please try again with more details.',
      };
    }
    return { suggestions: result.suggestions };
  } catch (error) {
    console.error('AI suggestion error:', error);
    return { error: 'An unexpected error occurred while generating suggestions.' };
  }
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createActionClient();
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().formErrors.map((error) => error).join(', '),
    };
  }

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        full_name: validatedFields.data.full_name,
      },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    return {
      error: error.message || 'An unexpected error occurred.',
    };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function login(prevState: any, formData: FormData) {
  const supabase = await createActionClient();

  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      error: 'Invalid email or password.',
    };
  }

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    return {
      error: error.message || 'Invalid login credentials.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createActionClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function saveForm(form: Form) {
  const supabase = await createActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to save a form.');
  }

  const { id, title, description, fields } = form;

  if (id === 'new') {
    // Create new form
    const { data: newForm, error: formError } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title,
        description,
      })
      .select('id')
      .single();

    if (formError || !newForm) {
      console.error('Error creating form:', formError);
      throw new Error('Could not create form.');
    }

    const formId = newForm.id;
    if (fields.length > 0) {
      const fieldsToInsert = fields.map(field => ({
        ...field,
        form_id: formId,
        type: field.type, // Ensure type is included
 validation: field.validation || {}, // Include validation
 properties: field.properties || {}, // Include properties
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);
      if (fieldsError) {
        console.error('Error saving form fields:', fieldsError);
        // Optional: delete the form if fields fail to save
        await supabase.from('forms').delete().eq('id', formId);
        throw new Error('Could not save form fields.');
      }
    }
    revalidatePath('/dashboard');
    return { formId };
  } else {
    // Update existing form
    const { error: formError } = await supabase
      .from('forms')
      .update({ title, description })
      .eq('id', id)
      .eq('user_id', user.id);

    if (formError) {
      console.error('Error updating form:', formError);
      throw new Error('Could not update form.');
    }

    // This is a simplified update. A more robust solution would diff fields.
    // For now, we delete all existing fields and re-insert them.
    const { error: deleteError } = await supabase
      .from('form_fields')
      .delete()
      .eq('form_id', id);

    if (deleteError) {
      console.error('Error deleting old fields:', deleteError);
      throw new Error('Could not update form fields.');
    }

    if (fields.length > 0) {
      const fieldsToInsert = fields.map(field => ({
        ...field,
        form_id: id,
 type: field.type, // Ensure type is included
 validation: field.validation || {}, // Include validation
 properties: field.properties || {}, // Include properties
      }));

      const { error: insertError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (insertError) {
        console.error('Error inserting new fields:', insertError);
        throw new Error('Could not update form fields.');
      }
    }
    revalidatePath(`/dashboard/builder/${id}`);
    revalidatePath('/dashboard');
    return { formId: id };
  }
}

// This function is no longer used as responses are stored in form_answers
export async function submitResponse(formId: string, formData: FormData) {
  const supabase = await createActionClient();

 // Insert into form_responses first to get the response_id
  const { data: response, error: responseError } = await supabase
 .from('form_responses')
 .insert([{ form_id: formId }])
 .select('id')
 .single();

  if (responseError || !response) {
 console.error('Error creating form response:', responseError);
 return { error: 'There was an error submitting your response.' };
  }

  const responseId = response.id;
  const answersToInsert = [];

 // Iterate over form data and prepare answers for insertion
 // You'll need to retrieve field IDs based on form data keys (field names)
 // For simplicity, this example assumes form data keys are field IDs.

  const { error } = await supabase
    .from('form_responses')
    .insert([{ form_id: formId, data: response }]);

  if (error) {
    console.error('Error submitting response:', error);
    return { error: 'There was an error submitting your response.' };
  }

  return { success: true };
}

export async function deleteForm(formId: string) {
  const supabase = await createActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to delete a form.');
  }

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting form:', error);
    return { error: 'Failed to delete form.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateProfile(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const fullName = formData.get('fullName') as string;
  const avatarFile = formData.get('avatar') as File;
  
  const profileData: { full_name: string; avatar_url?: string } = {
    full_name: fullName,
  };

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return { error: 'Failed to upload avatar.' };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    profileData.avatar_url = publicUrl;
  }

  const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', user.id);

  if (error) {
    console.error('Profile update error:', error);
    return { error: error.message };
  }
  
  revalidatePath('/', 'layout');
  return { success: true };
}
