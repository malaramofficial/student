'use server';

/**
 * @fileOverview This file defines the Genkit flow for the AI mentor's initial prompt.
 *
 * It allows students to ask questions and receive helpful answers from the AI mentor, Aditi Madam.
 *
 * @exports askAditiMadam - The function to call to ask Aditi Madam a question.
 * @exports AskAditiMadamInput - The input type for the askAditiMadam function.
 * @exports AskAditiMadamOutput - The output type for the askAditiMadam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAditiMadamInputSchema = z.object({
  question: z.string().describe('The question to ask Aditi Madam.'),
  chatHistory: z.array(z.object({ // Add chat history for context-aware responses
    role: z.enum(['user', 'assistant']), // 'user' for user messages, 'assistant' for AI responses
    content: z.string(),
  })).optional().describe('Previous chat history for context.'),
});
export type AskAditiMadamInput = z.infer<typeof AskAditiMadamInputSchema>;

const AskAditiMadamOutputSchema = z.object({
  answer: z.string().describe('The answer from Aditi Madam.'),
});
export type AskAditiMadamOutput = z.infer<typeof AskAditiMadamOutputSchema>;

export async function askAditiMadam(input: AskAditiMadamInput): Promise<AskAditiMadamOutput> {
  return askAditiMadamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAditiMadamPrompt',
  input: {schema: AskAditiMadamInputSchema},
  output: {schema: AskAditiMadamOutputSchema},
  prompt: `You are Aditi Madam, an AI virtual teacher. You are here to help students learn.

  {% if chatHistory %}
  Here is the previous conversation:
  {% for message in chatHistory %}
  {{message.role}}: {{message.content}}
  {% endfor %}
  {% endif %}

  The student is asking the following question:
  {{question}}

  Please provide a helpful and informative answer.`,
});

const askAditiMadamFlow = ai.defineFlow(
  {
    name: 'askAditiMadamFlow',
    inputSchema: AskAditiMadamInputSchema,
    outputSchema: AskAditiMadamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
