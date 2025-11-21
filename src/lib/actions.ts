'use server';

import {
  textToSpeechConversion,
  TextToSpeechConversionInput,
} from '@/ai/flows/text-to-speech-conversion';

import { z } from 'zod';

const getAudioResponseSchema = z.object({
  text: z.string(),
  voice: z.enum(['male', 'female']).optional(),
});

export async function getAudioResponse(input: TextToSpeechConversionInput) {
  const parsedInput = getAudioResponseSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input' };
  }
  try {
    const result = await textToSpeechConversion(parsedInput.data);
    return { success: true, audio: result.media };
  } catch (error) {
    console.error('Error in getAudioResponse:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to convert text to speech.';
    return { success: false, error: errorMessage };
  }
}
