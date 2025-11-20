'use server';

/**
 * @fileOverview A Genkit flow to generate a "Word of the Day" in Hindi.
 *
 * This file exports:
 * - `getWordOfTheDay`: The main function to get the word of the day.
 * - `WordOfTheDayOutput`: The output type for the getWordOfTheDay function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {AIMentorOutput} from "@/ai/ai-mentor-follow-up-questions";

const WordOfTheDayOutputSchema = z.object({
  word: z.string().describe('The Hindi word of the day.'),
  meaning: z.string().describe('The meaning of the word in simple Hindi.'),
  example: z.string().describe('An example sentence using the word.'),
});
export type WordOfTheDayOutput = z.infer<typeof WordOfTheDayOutputSchema>;


export async function getWordOfTheDay(): Promise<WordOfTheDayOutput> {
    return wordOfTheDayFlow();
}

const prompt = ai.definePrompt({
  name: 'wordOfTheDayPrompt',
  output: { schema: WordOfTheDayOutputSchema },
  prompt: `You are a Hindi language expert. Your task is to provide a "Word of the Day".
  
  The word should be interesting and suitable for students.
  
  Provide the following:
  1. The word in Hindi.
  2. Its meaning in simple Hindi.
  3. An example sentence demonstrating its usage.
  
  Please provide a new and unique word each time. Do not repeat words.`,
});


const wordOfTheDayFlow = ai.defineFlow(
  {
    name: 'wordOfTheDayFlow',
    outputSchema: WordOfTheDayOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
