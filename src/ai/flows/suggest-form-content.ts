'use server';

/**
 * @fileOverview AI tool to suggest form content based on a description.
 *
 * - suggestFormContent - A function that suggests form content.
 * - SuggestFormContentInput - The input type for the suggestFormContent function.
 * - SuggestFormContentOutput - The return type for the suggestFormContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFormContentInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the type of information the form is meant to collect.'),
});
export type SuggestFormContentInput = z.infer<typeof SuggestFormContentInputSchema>;

const SuggestFormContentOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested questions or prompts for the form.'),
});
export type SuggestFormContentOutput = z.infer<typeof SuggestFormContentOutputSchema>;

export async function suggestFormContent(input: SuggestFormContentInput): Promise<SuggestFormContentOutput> {
  return suggestFormContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFormContentPrompt',
  input: {schema: SuggestFormContentInputSchema},
  output: {schema: SuggestFormContentOutputSchema},
  prompt: `You are a form creation assistant.  Given the description of the form, suggest questions or prompts that would be useful to include in the form. Return the suggestions as a JSON array of strings.

Form description: {{{description}}}`,
});

const suggestFormContentFlow = ai.defineFlow(
  {
    name: 'suggestFormContentFlow',
    inputSchema: SuggestFormContentInputSchema,
    outputSchema: SuggestFormContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
