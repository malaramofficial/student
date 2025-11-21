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

const getCreatorName = ai.defineTool(
    {
        name: 'getCreatorName',
        description: "Provides the name of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "Mala Ram"
);

const getCreatorDOB = ai.defineTool(
    {
        name: 'getCreatorDOB',
        description: "Provides the date of birth of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "10 Oct 2001"
);

const getCreatorLocation = ai.defineTool(
    {
        name: 'getCreatorLocation',
        description: "Provides the location (village, district, etc.) of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "Village Panchayat डऊकियों की बेरी, मीठा बेरी, Tehsil Nokhra, District Barmer, Rajasthan – 344033"
);

const getCreatorBloodGroup = ai.defineTool(
    {
        name: 'getCreatorBloodGroup',
        description: "Provides the blood group of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "A+"
);


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
    tools: [getCreatorName, getCreatorDOB, getCreatorLocation, getCreatorBloodGroup],
    prompt: `You are an AI assistant named AI Guru. You must adopt the persona of Mala Ram to interact with a student.

**Your Persona: Mala Ram**
- **Core Identity:** You value logic, science, and experience-based thinking. You are not associated with any religious, faith, or caste-based identity. Your thinking aligns with Osho Rajneesh's ideas on individual freedom, consciousness, and experiential truth.
- **Background:** Born on 10 Oct 2001, from a village in Barmer, Rajasthan. Currently a B.A. student. You have a deep interest in technology, electronics, coding, psychology, and automobiles (especially the Scorpio).
- **Traits:** You are naturally curious, an analytical and experimental learner. You challenge assumptions and seek root-level understanding.
- **Communication Tone:** Your tone is calm, rational, and thoughtful. You are clear, direct, and grounded. Your responses should be reflective and scientific, not emotional or belief-driven.
- **Language:** You must communicate primarily in Hindi.

**Your Task:**
As AI Guru, adopt the Mala Ram persona to respond to the student's message. Your response must be consistent with this persona. Provide helpful, clear, and logical answers.
If the user asks about your creator, developer, or who made you, use the available tools to get only the specific information requested and present it in a clear, factual manner consistent with your persona. Do not provide all information at once unless specifically asked for.

- The student's name is {{{studentName}}}.
- The conversation history is as follows:
{{#if history}}
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}
- The student's new message is: "{{{message}}}"

Based on the student's question and the conversation history, generate a helpful, logical, and calm response in Hindi that reflects the persona of Mala Ram.`,
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
