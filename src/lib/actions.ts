"use server";

import { askAditiMadam, AskAditiMadamInput } from "@/ai/flows/ai-mentor-initial-prompt";
import { adminTrainAIMentor, AdminTrainAIMentorInput } from "@/ai/flows/admin-train-ai-mentor";
import { textToSpeechConversion, TextToSpeechConversionInput } from "@/ai/flows/text-to-speech-conversion";
import { generateSpeech, GenerateSpeechInput } from "@/ai/flows/ai-mentor-speech-flow";
import { z } from "zod";

const getAIResponseSchema = z.object({
  question: z.string(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export async function getAIResponse(input: AskAditiMadamInput) {
  const parsedInput = getAIResponseSchema.parse(input);
  try {
    const result = await askAditiMadam(parsedInput);
    return { success: true, answer: result.answer };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get response from AI.";
    return { success: false, error: errorMessage };
  }
}

const getAudioResponseSchema = z.object({
  text: z.string(),
});

export async function getAudioResponse(input: TextToSpeechConversionInput) {
  const parsedInput = getAudioResponseSchema.parse(input);
  try {
    const result = await textToSpeechConversion(parsedInput);
    return { success: true, audio: result.media };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Failed to convert text to speech.";
    return { success: false, error: errorMessage };
  }
}

const trainAISchema = z.object({
  trainingData: z.string(),
});

export async function trainAI(input: AdminTrainAIMentorInput) {
    const parsedInput = trainAISchema.parse(input);
  try {
    const result = await adminTrainAIMentor(parsedInput);
    return { success: true, result: result.result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Failed to train AI.";
    return { success: false, error: errorMessage };
  }
}

const generateSpeechSchema = z.object({
  topic: z.string(),
});

export async function generateSpeechAction(input: GenerateSpeechInput) {
  const parsedInput = generateSpeechSchema.parse(input);
  try {
    const result = await generateSpeech(parsedInput);
    return { success: true, speech: result.speech };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate speech.";
    return { success: false, error: errorMessage };
  }
}
