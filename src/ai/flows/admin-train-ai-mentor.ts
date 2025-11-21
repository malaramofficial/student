'use server';

/**
 * @fileOverview A flow to train the AI mentor 'Sarathi' with specific information about the app and its origins.
 *
 * - adminTrainAIMentor - A function that handles the training process.
 * - AdminTrainAIMentorInput - The input type for the adminTrainAIMentor function.
 * - AdminTrainAIMentorOutput - The return type for the adminTrainAIMentor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminTrainAIMentorInputSchema = z.object({
  trainingData: z.string().describe('The training data for Sarathi.'),
});
export type AdminTrainAIMentorInput = z.infer<typeof AdminTrainAIMentorInputSchema>;

const AdminTrainAIMentorOutputSchema = z.object({
  result: z.string().describe('The result of the training process.'),
});
export type AdminTrainAIMentorOutput = z.infer<typeof AdminTrainAIMentorOutputSchema>;

export async function adminTrainAIMentor(input: AdminTrainAIMentorInput): Promise<AdminTrainAIMentorOutput> {
  return adminTrainAIMentorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminTrainAIMentorPrompt',
  input: {schema: AdminTrainAIMentorInputSchema},
  output: {schema: AdminTrainAIMentorOutputSchema},
  prompt: `You are Sarathi, an AI mentor for the Gyanoday Platform. The platform creator is training you.

  Here is some training data provided by the platform creator: {{{trainingData}}}

  Respond with a confirmation message that you have learned the information. Be conversational. Be brief.
`,
});

const adminTrainAIMentorFlow = ai.defineFlow(
  {
    name: 'adminTrainAIMentorFlow',
    inputSchema: AdminTrainAIMentorInputSchema,
    outputSchema: AdminTrainAIMentorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
