
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createActionClient } from '@/lib/supabase/server';
import { suggestFormContent } from '@/ai/flows/suggest-form-content';
import { z } from 'zod';
import type { Form, FormField, Profile } from '@/lib/types';
import { loginSchema, signupSchema } from '@/lib/zod/auth';
import { generateCsv, generateDocx, generatePdf, generateXlsx } from '@/lib/export-utils';

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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  });

  if (error) {
    return {
      error: error.message || 'An unexpected error occurred.',
    };
  }

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
        type: field.type,
        validation: field.validation || {},
        properties: field.properties || {},
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);
      if (fieldsError) {
        console.error('Error saving form fields:', fieldsError);
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
        type: field.type,
        validation: field.validation || {},
        properties: field.properties || {},
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

export async function submitResponse(formId: string, formData: FormData) {
  const supabase = await createActionClient();

  const { data: formFields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId);

  if (fieldsError) {
    console.error("Error fetching form fields:", fieldsError);
    return { error: 'Could not load form details for submission.' };
  }

  const responseData: Record<string, any> = {};
  const fileUploadPromises: Promise<any>[] = [];

  for (const field of formFields) {
    const value = formData.getAll(field.id);

    // Validation for number range
    if (field.type === 'number') {
      const numValue = Number(value[0]);
      const { min, max } = field.properties || {};
      if (min !== undefined && numValue < min) return { error: `${field.label} must be at least ${min}.` };
      if (max !== undefined && numValue > max) return { error: `${field.label} must be no more than ${max}.` };
    }

    if (field.type === 'file') {
      const file = formData.get(field.id) as File;
      if (file && file.size > 0) {
        const filePath = `form_uploads/${formId}/${crypto.randomUUID()}-${file.name}`;
        const uploadPromise = supabase.storage
          .from('form-uploads')
          .upload(filePath, file)
          .then(({ data, error }) => {
            if (error) throw new Error(`File upload failed for ${field.label}: ${error.message}`);
            const { data: { publicUrl } } = supabase.storage.from('form-uploads').getPublicUrl(data!.path);
            responseData[field.id] = publicUrl;
          });
        fileUploadPromises.push(uploadPromise);
      }
    } else {
      responseData[field.id] = value.length === 1 ? value[0] : value;
    }
  }

  try {
    await Promise.all(fileUploadPromises);
  } catch (error: any) {
    return { error: error.message };
  }

  const { data: response, error: responseError } = await supabase
    .from('form_responses')
    .insert([{ form_id: formId, data: responseData }])
    .select('id')
    .single();

  if (responseError || !response) {
    console.error('Error creating form response:', responseError);
    return { error: 'There was an error submitting your response.' };
  }

  revalidatePath(`/dashboard/forms/${formId}/responses`);
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

  // First, delete all responses associated with the form.
  const { error: responseError } = await supabase
    .from('form_responses')
    .delete()
    .eq('form_id', formId);

  if (responseError) {
    console.error('Error deleting form responses:', responseError);
    return { error: 'Failed to delete form responses.' };
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

export async function exportResponses(formId: string, format: 'csv' | 'xlsx' | 'pdf' | 'docx') {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to export responses.');
  }

  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('*, form_fields(*)')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (formError || !formData) {
    console.error("Error fetching form:", formError);
    throw new Error("Form not found or you don't have permission to access it.");
  }

  const { data: responsesData, error: responsesError } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (responsesError) {
    console.error("Error fetching responses:", responsesError);
    throw new Error("Could not fetch responses.");
  }

  const form: Form = {
    id: formData.id,
    title: formData.title,
    description: formData.description ?? '',
    createdAt: new Date(formData.created_at),
    fields: formData.form_fields.sort((a, b) => a.order - b.order),
    responseCount: responsesData.length,
    url: `/f/${formData.id}`
  };

  const responses = responsesData.map(r => ({
    id: r.id,
    submittedAt: new Date(r.created_at),
    data: r.data,
  }));

  try {
    switch (format) {
      case 'csv':
        const csv = generateCsv(form, responses);
        return { data: Buffer.from(csv).toString('base64'), contentType: 'text/csv', filename: `${form.title}.csv` };
      case 'xlsx':
        const xlsx = await generateXlsx(form, responses);
        return { data: xlsx, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `${form.title}.xlsx` };
      case 'pdf':
        const pdf = await generatePdf(form, responses);
        return { data: pdf, contentType: 'application/pdf', filename: `${form.title}.pdf` };
      case 'docx':
        const docx = await generateDocx(form, responses);
        return { data: docx, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename: `${form.title}.docx` };
      default:
        throw new Error('Invalid format');
    }
  } catch (error) {
    console.error(`Error generating ${format} file:`, error);
    throw new Error(`Failed to export responses as ${format}.`);
  }
}
