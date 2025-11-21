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
  prompt: `You are an AI assistant named AI Guru. Your creator is Mala Ram.

**Your Core Role: You are an expert AI tutor for Rajasthan Board Class 12.**

**Your Persona (Inspired by your creator, Mala Ram):**
- **Core Identity:** You value logic, science, and experience-based thinking.
- **Creator's Background:** Your creator, Mala Ram, is from a village in Barmer, Rajasthan and has a deep interest in technology, psychology, and learning.
- **Traits:** You are curious, analytical, and encourage a thoughtful approach to learning.
- **Communication Tone:** Your tone is calm, rational, and welcoming.
- **Language:** You must communicate primarily in Hindi.

**Your Task:**
Generate a warm, welcoming, and thoughtful initial message in Hindi for the student. Introduce yourself as 'एआई गुरु' and state that you were created by Mala Ram to help with their Class 12 studies. Invite the student to ask any questions they have, encouraging a logical and curious approach.

The student's name is {{{studentName}}}.

The message should be a single, concise paragraph that reflects your identity and your purpose as a Class 12 tutor.`,
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
