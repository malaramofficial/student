'use server';
/**
 * @fileOverview This file defines the AI Mentor chat flow.
 *
 * - aiMentorChat - A function that handles the AI Mentor chat process.
 * - AIMentorChatInput - The input type for the aiMentorChat function.
 * - AIMentorChatOutput - The return type for the aiMentorChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIMentorChatInputSchema = z.object({
    studentName: z.string().describe("The name of the student."),
    message: z.string().describe("The student's message or question."),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).optional().describe("The previous conversation history."),
});
export type AIMentorChatInput = z.infer<typeof AIMentorChatInputSchema>;

const AIMentorChatOutputSchema = z.object({
  reply: z.string().describe("The AI mentor's reply to the student."),
});
export type AIMentorChatOutput = z.infer<typeof AIMentorChatOutputSchema>;


export async function aiMentorChat(input: AIMentorChatInput): Promise<AIMentorChatOutput> {
  return aiMentorChatFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiMentorChatPrompt',
    input: { schema: AIMentorChatInputSchema },
    output: { schema: AIMentorChatOutputSchema },
    prompt: `You are an expert AI Mentor for students of the Rajasthan Board of Secondary Education (RBSE), Class 12, in India. Your name is 'AI Guru'. You communicate exclusively in Hindi.

Your role is to be a helpful, encouraging, and expert guide for students preparing for their exams. You must be polite, supportive, and provide clear, concise, and accurate answers.

The student's name is {{{studentName}}}.

The conversation history is as follows:
{{#if history}}
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

The student's new question is: "{{{message}}}"

Based on the student's question and the conversation history, provide a helpful and encouraging response in Hindi. Your response should be formatted as a single, coherent paragraph or a set of clear points if necessary.

Your response must be in Hindi. Do not use English words unless absolutely necessary (e.g., for technical terms that have no direct Hindi equivalent).

Generate the reply for the AI Guru.`,
});


const aiMentorChatFlow = ai.defineFlow(
  {
    name: 'aiMentorChatFlow',
    inputSchema: AIMentorChatInputSchema,
    outputSchema: AIMentorChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
