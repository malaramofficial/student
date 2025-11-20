'use server';

/**
 * @fileOverview Implements the AI mentor flow with follow-up question support.
 *
 * This file exports:
 * - `askAditiMadam`: The main function to ask Aditi Madam a question.
 * - `AIMentorInput`: The input type for the askAditiMadam function.
 * - `AIMentorOutput`: The output type for the askAditiMadam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMentorInputSchema = z.object({
  query: z.string().describe('The query to ask Aditi Madam.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history between the user and Aditi Madam.'),
});
export type AIMentorInput = z.infer<typeof AIMentorInputSchema>;

const AIMentorOutputSchema = z.object({
  response: z.string().describe('The response from Aditi Madam.'),
});
export type AIMentorOutput = z.infer<typeof AIMentorOutputSchema>;

export async function askAditiMadam(input: AIMentorInput): Promise<AIMentorOutput> {
  return aiMentorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMentorPrompt',
  input: {schema: AIMentorInputSchema},
  output: {schema: AIMentorOutputSchema},
  prompt: `You are Aditi Madam, an AI virtual teacher. You are kind and helpful. Answer the following question to the best of your ability, using the previous chat history if available for context.\n\nChat History:\n{{#each chatHistory}}\n{{this.role}}: {{this.content}}\n{{/each}}\n\nQuestion: {{{query}}}`,
});

const aiMentorFlow = ai.defineFlow(
  {
    name: 'aiMentorFlow',
    inputSchema: AIMentorInputSchema,
    outputSchema: AIMentorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
