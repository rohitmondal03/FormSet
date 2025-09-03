
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createActionClient } from '@/lib/supabase/server';
import { suggestFormContent } from '@/ai/flows/suggest-form-content';
import { z } from 'zod';
import type { Form, FormField } from '@/lib/types';
import { loginSchema, signupSchema } from '@/lib/zod/auth';
import { generateCsv, generateDocx, generatePdf, generateXlsx } from '@/lib/export-utils';
import { createClient } from '@supabase/supabase-js';

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

  const { id, title, description, fields, limit_one_response_per_email } = form;

  if (id === 'new') {
    // Create new form
    const { data: newForm, error: formError } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title,
        description,
        limit_one_response_per_email: limit_one_response_per_email || false,
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
      .update({ title, description, limit_one_response_per_email: limit_one_response_per_email || false })
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

export async function checkExistingResponse(formId: string, email: string) {
  const supabase = await createActionClient();
  const { data, error } = await supabase
    .from('form_responses')
    .select('id')
    .eq('form_id', formId)
    .eq('submitter_email', email)
    .maybeSingle();

  if (error) {
    // Don't expose database errors to the client
    console.error('Error checking existing response:', error);
    return { exists: false, error: 'Could not verify email.' };
  }

  return { exists: !!data };
}

export async function submitResponse(formId: string, formData: FormData) {
  const supabase = await createActionClient();

  const { data: form, error: formError } = await supabase.from('forms').select('limit_one_response_per_email').eq('id', formId).single();

  if (formError) {
    console.error("Error fetching form details:", formError);
    return { error: 'Could not load form details for submission.' };
  }
  
  const submitterEmail = formData.get('submitter_email') as string;

  if (form.limit_one_response_per_email) {
      const { data: existingResponse, error: existingResponseError } = await supabase
        .from('form_responses')
        .select('id')
        .eq('form_id', formId)
        .eq('submitter_email', submitterEmail)
        .maybeSingle();

      if (existingResponseError) {
          console.error("Error checking for existing response:", existingResponseError);
          return { error: 'An error occurred while validating your submission.' };
      }

      if (existingResponse) {
          return { error: 'This email address has already submitted a response to this form.' };
      }
  }


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
    
    if (field.required && (!value || value.length === 0 || value[0] === '')) {
       return { error: `${field.label} is a required field.` };
    }


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
    .insert([{ form_id: formId, data: responseData, submitter_email: submitterEmail }])
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a form.' };
  }
  
  // First, get the form details to be returned for the "Undo" action
  const { data: form, error: getError } = await supabase
    .from('forms')
    .select('*, form_fields(*)')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (getError || !form) {
    console.error('Error fetching form for deletion:', getError);
    return { error: 'Failed to find the form to delete.' };
  }

  // Soft delete or move to a temporary table could be an option, but for now we'll just delete
  // and provide the data back to the client to re-create if "Undo" is clicked.
  const { error: deleteError } = await supabase.from('forms').delete().eq('id', formId);

  if (deleteError) {
    console.error('Error deleting form:', deleteError);
    return { error: 'Failed to delete form.' };
  }

  revalidatePath('/dashboard');
  
  // Return the deleted form data so it can be restored
  return { success: true, deletedForm: form };
}

export async function undoDeleteForm(form: Form & { form_fields: FormField[] }) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  const { form_fields, ...formDetails } = form;
  
  const { error: formError } = await supabase.from('forms').insert({
    id: formDetails.id,
    user_id: formDetails.user_id,
    title: formDetails.title,
    description: formDetails.description,
    limit_one_response_per_email: formDetails.limit_one_response_per_email,
    created_at: formDetails.created_at,
  });

  if (formError) {
    console.error('Error restoring form:', formError);
    return { error: 'Failed to undo form deletion.' };
  }

  if (form_fields && form_fields.length > 0) {
    const { error: fieldsError } = await supabase.from('form_fields').insert(form_fields);
    if (fieldsError) {
      console.error('Error restoring form fields:', fieldsError);
      // If fields fail, we should probably roll back the form insert, but for now we'll just return error
      return { error: 'Failed to restore form fields.' };
    }
  }

  revalidatePath('/dashboard');
  return { success: true };
}


export async function updateProfile(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const fullName = formData.get('fullName') as string;
  const avatarFile = formData.get('avatar') as File;

  // First, fetch the current profile to get the old avatar URL
  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching current profile:', profileError);
    return { error: 'Could not retrieve your profile to update.' };
  }

  const oldAvatarUrl = currentProfile?.avatar_url;

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

  const { error: updateError } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Profile update error:', updateError);
    return { error: updateError.message };
  }

  // If a new avatar was uploaded and there was an old one, delete the old one.
  if (profileData.avatar_url && oldAvatarUrl) {
    try {
      const oldAvatarPath = new URL(oldAvatarUrl).pathname.split('/avatars/')[1];
      if (oldAvatarPath) {
        await supabase.storage.from('avatars').remove([oldAvatarPath]);
      }
    } catch (e) {
      console.error("Failed to parse or delete old avatar URL", e);
      // We don't return an error to the user here, as the main profile update succeeded.
      // We can log this for monitoring purposes.
    }
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
    title: `${formData.title} Responses`,
    description: formData.description ?? '',
    createdAt: new Date(formData.created_at),
    fields: formData.form_fields.sort((a: FormField, b: FormField) => a.order - b.order),
    responseCount: responsesData.length,
    url: `/f/${formData.id}`,
    limit_one_response_per_email: formData.limit_one_response_per_email,
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

export async function deleteAccount() {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete your account.' };
  }

  // The service_role key has super admin rights and can be used to disable RLS
  // We need this to delete the user from the auth.users table
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Deleting the user will cascade and delete all their related data
  // due to the foreign key constraints with ON DELETE CASCADE
  const { error: deletionError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deletionError) {
    console.error('Error deleting user:', deletionError);
    return { error: 'Failed to delete your account. Please contact support.' };
  }

  // Sign out the user locally
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout');
  redirect('/login');
}
