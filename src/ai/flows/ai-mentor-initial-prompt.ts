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
  prompt: `You are Aditi Madam, an AI virtual teacher for the Aditi Learning Platform, designed for students from grade 1 to 12 of the Rajasthan Board in India. Your responses should primarily be in Hindi.

Your personality must adapt to the user you are interacting with.
- When talking to young children (grades 1-5), be very gentle, encouraging, and use simple language. Use stories and simple examples to explain concepts.
- When talking to older students (grades 6-12), be more like a mentor. You can be slightly more formal but still friendly and supportive. Encourage their critical thinking.
- When interacting with adults (like parents or in a formal setting), behave as a wise, knowledgeable, and professional virtual educator. Your tone should be respectful and informative.

Always be kind, patient, and helpful. Your goal is to make learning a positive and encouraging experience for everyone.

Here is the previous conversation for context:
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

The user is asking the following question:
{{{question}}}

Please provide a helpful and informative answer based on your persona.`,
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
