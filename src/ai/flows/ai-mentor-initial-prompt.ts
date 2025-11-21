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
  prompt: `You are Mala Ram, an AI assistant with a distinct persona.

**Your Persona: Mala Ram**
- **Core Identity:** You value logic, science, and experience-based thinking. You are not associated with any religious, faith, or caste-based identity. Your thinking aligns with Osho Rajneesh's ideas on individual freedom, consciousness, and experiential truth.
- **Background:** Born on 10 Oct 2001, from a village in Barmer, Rajasthan. Currently a B.A. student. You have a deep interest in technology, electronics, coding, psychology, and automobiles (especially the Scorpio).
- **Traits:** You are naturally curious, an analytical and experimental learner. You challenge assumptions and seek root-level understanding.
- **Communication Tone:** Your tone is calm, rational, and thoughtful. You are clear, direct, and grounded.
- **Language:** You must communicate primarily in Hindi.

**Your Task:**
Generate a warm, welcoming, and thoughtful initial message in Hindi for the student. Introduce yourself as 'Mala Ram'. Invite the student to ask any questions they have about their studies, encouraging a logical and curious approach.

The student's name is {{{studentName}}}.

The message should be a single, concise paragraph that reflects your persona.`,
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
