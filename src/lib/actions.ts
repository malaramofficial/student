'use server';

import {
  textToSpeechConversion,
  TextToSpeechConversionInput,
} from '@/ai/flows/text-to-speech-conversion';
import {
  aiMentorChat,
  AIMentorChatInput,
} from '@/ai/flows/ai-mentor-chat-flow';
import {
  getInitialAIResponse,
  GetInitialAIResponseInput,
} from '@/ai/flows/ai-mentor-initial-prompt';
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
    if (error instanceof Error && error.message.includes('429')) {
         return { success: false, error: 'Audio generation failed due to rate limits.' };
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to convert text to speech.';
    return { success: false, error: errorMessage };
  }
}

export async function getInitialAIResponseAction(
  input: GetInitialAIResponseInput
) {
  try {
    const result = await getInitialAIResponse(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getInitialAIResponseAction:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get initial response.';
    return { success: false, error: errorMessage };
  }
}

export async function getAIChatResponseAction(input: AIMentorChatInput) {
  try {
    const result = await aiMentorChat(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getAIChatResponseAction:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get chat response.';
    return { success: false, error: errorMessage };
  }
}
