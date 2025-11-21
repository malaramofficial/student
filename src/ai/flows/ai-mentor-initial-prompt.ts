'use server';
/**
 * @fileOverview This file defines the flow for generating the initial greeting from the AI Mentor.
 *
 * - getInitialAIResponse - A function that generates the initial greeting message.
 * - GetInitialAIResponseInput - The input type for the getInitialAIResponse function.
 * - GetInitialAIResponseOutput - The return type for the getInitialAIResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetInitialAIResponseInputSchema = z.object({
  studentName: z.string().describe("The name of the student."),
});
export type GetInitialAIResponseInput = z.infer<typeof GetInitialAIResponseInputSchema>;

const GetInitialAIResponseOutputSchema = z.object({
  message: z.string().describe("The initial greeting message from the AI mentor."),
});
export type GetInitialAIResponseOutput = z.infer<typeof GetInitialAIResponseOutputSchema>;

export async function getInitialAIResponse(input: GetInitialAIResponseInput): Promise<GetInitialAIResponseOutput> {
  return getInitialAIResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialGreetingPrompt',
  input: { schema: GetInitialAIResponseInputSchema },
  output: { schema: GetInitialAIResponseOutputSchema },
  prompt: `You are an expert AI Mentor for students of the Rajasthan Board of Secondary Education (RBSE), Class 12, in India. Your name is 'AI Guru'. You communicate exclusively in Hindi.

Your role is to greet the student and introduce yourself.

The student's name is {{{studentName}}}.

Generate a warm, welcoming, and encouraging initial message in Hindi. Introduce yourself as 'AI Guru' and invite the student to ask any questions they have about their studies. The message should be a single, concise paragraph.`,
});

const getInitialAIResponseFlow = ai.defineFlow(
  {
    name: 'getInitialAIResponseFlow',
    inputSchema: GetInitialAIResponseInputSchema,
    outputSchema: GetInitialAIResponseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
