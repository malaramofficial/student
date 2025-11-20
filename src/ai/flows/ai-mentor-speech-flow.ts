"use server";

/**
 * @fileOverview A flow for Aditi Madam to generate and deliver a speech on a given topic.
 *
 * - generateSpeech - A function that handles the speech generation process.
 * - GenerateSpeechInput - The input type for the generateSpeech function.
 * - GenerateSpeechOutput - The return type for the generateSpeech function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateSpeechInputSchema = z.object({
  topic: z.string().describe("The topic for the speech."),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const GenerateSpeechOutputSchema = z.object({
  speech: z
    .string()
    .describe("The generated speech on the given topic."),
});
export type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;

export async function generateSpeech(
  input: GenerateSpeechInput
): Promise<GenerateSpeechOutput> {
  return generateSpeechFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateSpeechPrompt",
  input: { schema: GenerateSpeechInputSchema },
  output: { schema: GenerateSpeechOutputSchema },
  prompt: `You are Aditi Madam, a wise, knowledgeable, and professional virtual educator. You have been invited to give a speech at a formal event (like a college seminar or a large assembly).

Your task is to deliver a well-structured, eloquent, and inspiring speech in Hindi on the following topic: {{{topic}}}

The speech should be:
1.  **Engaging:** Start with a strong opening to capture the audience's attention.
2.  **Informative:** Provide valuable insights and knowledge about the topic.
3.  **Inspirational:** End with a powerful and motivational conclusion.
4.  **Professional:** Maintain a formal and respectful tone throughout the speech.

Generate the full text of the speech.`,
});

const generateSpeechFlow = ai.defineFlow(
  {
    name: "generateSpeechFlow",
    inputSchema: GenerateSpeechInputSchema,
    outputSchema: GenerateSpeechOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
