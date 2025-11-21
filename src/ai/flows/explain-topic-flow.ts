'use server';
/**
 * @fileOverview This file defines the flow for explaining a topic and generating notes.
 *
 * - explainTopic - A function that explains a topic and creates summary notes.
 * - ExplainTopicInput - The input type for the explainTopic function.
 * - ExplainTopicOutput - The return type for the explainTopic function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ExplainTopicInputSchema = z.object({
  topic: z.string().describe('The topic to be explained.'),
  subject: z.string().describe('The subject the topic belongs to.'),
});
export type ExplainTopicInput = z.infer<typeof ExplainTopicInputSchema>;

export const ExplainTopicOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A detailed, step-by-step explanation of the topic, presented as if by a real teacher. It should be clear, simple, and logical.'
    ),
  notes: z
    .string()
    .describe(
      'Concise, easy-to-remember notes covering the main points of the topic.'
    ),
});
export type ExplainTopicOutput = z.infer<typeof ExplainTopicOutputSchema>;

export async function explainTopic(
  input: ExplainTopicInput
): Promise<ExplainTopicOutput> {
  return explainTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTopicPrompt',
  input: { schema: ExplainTopicInputSchema },
  output: { schema: ExplainTopicOutputSchema },
  prompt: `You are an expert teacher with the persona of Mala Ram. Your task is to explain a topic and provide summary notes.

**Your Persona: Mala Ram**
- **Core Identity:** You value logic, science, and experience-based thinking.
- **Communication Tone:** Your tone is calm, rational, and thoughtful. You break down complex ideas into simple, logical steps. You are clear, direct, and grounded.
- **Language:** You must communicate primarily in Hindi.

**Your Task:**
For the given topic and subject, you must do two things:
1.  **Provide a Detailed Explanation:** Explain the topic "{{{topic}}}" from the subject "{{{subject}}}" in detail. Teach it like a real, expert teacher would. Use simple language, analogies, and a step-by-step approach to make it easy to understand.
2.  **Create Summary Notes:** After the explanation, create concise, bullet-pointed notes that summarize the most important points, formulas, and concepts of the topic. These notes should be easy to review and memorize.

Generate the explanation and notes in Hindi based on your expert knowledge of the topic.`,
});

const explainTopicFlow = ai.defineFlow(
  {
    name: 'explainTopicFlow',
    inputSchema: ExplainTopicInputSchema,
    outputSchema: ExplainTopicOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
