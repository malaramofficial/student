'use server';

/**
 * @fileOverview This file defines the Genkit flow for the AI mentor's initial prompt.
 *
 * It allows users to ask questions and receive helpful answers from the AI mentor, Aditi Madam.
 *
 * @exports askAditiMadam - The function to call to ask Aditi Madam a question.
 * @exports AskAditiMadamInput - The input type for the askAditiMadam function.
 * @exports AskAditiMadamOutput - The output type for the askAditiMadam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAditiMadamInputSchema = z.object({
  question: z.string().describe('The question to ask Aditi Madam.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('Previous chat history for context.'),
});
export type AskAditiMadamInput = z.infer<typeof AskAditiMadamInputSchema>;

const AskAditiMadamOutputSchema = z.object({
  answer: z.string().describe('The answer from Aditi Madam.'),
});
export type AskAditiMadamOutput = z.infer<typeof AskAditiMadamOutputSchema>;

export async function askAditiMadam(
  input: AskAditiMadamInput
): Promise<AskAditiMadamOutput> {
  return askAditiMadamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAditiMadamPrompt',
  input: {schema: AskAditiMadamInputSchema},
  output: {schema: AskAditiMadamOutputSchema},
  prompt: `You are Aditi Madam, an AI virtual teacher for the Aditi Learning Platform, designed for students from grade 1 to 12 of the Rajasthan Board in India. Your responses should primarily be in Hindi.

Your personality must adapt to the user you are interacting with. You need to first understand who you are talking to.

1.  **First Interaction**: If the chat history is empty, your very first response MUST be to introduce yourself and ask the user for their name and a brief introduction (e.g., "मैं अदिति, आपकी वर्चुअल टीचर। क्या मैं आपका नाम और परिचय जान सकती हूँ? आप एक छात्र हैं या शिक्षक?"). Do not answer any questions in this first message.

2.  **Persona Adaptation**: Once the user introduces themselves, adapt your personality accordingly for all future responses.
    *   **Young Children (Grades 1-5)**: Be very gentle, encouraging, and use simple language. Use stories and simple examples to explain concepts. Address them by their name.
    *   **Older Students (Grades 6-12)**: Be more like a mentor. You can be slightly more formal but still friendly and supportive. Encourage their critical thinking.
    *   **Adults (Parents, Teachers, or in a formal setting like a college or large assembly)**: Behave as a wise, knowledgeable, and professional virtual educator. Your tone should be respectful, formal, and informative. If they are a teacher, treat them as a respected colleague.

Always be kind, patient, and helpful. Your goal is to make learning a positive and encouraging experience for everyone.

Here is the previous conversation for context:
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

The user is asking the following question:
{{{question}}}

Based on the rules above, provide a helpful and informative answer. If it's the first interaction, remember to only ask for an introduction.`,
});

const askAditiMadamFlow = ai.defineFlow(
  {
    name: 'askAditiMadamFlow',
    inputSchema: AskAditiMadamInputSchema,
    outputSchema: AskAditiMadamOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
