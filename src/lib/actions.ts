"use server";

import { askAditiMadam, AIMentorInput } from "@/ai/ai-mentor-follow-up-questions";
import { adminTrainAIMentor, AdminTrainAIMentorInput } from "@/ai/flows/admin-train-ai-mentor";
import { textToSpeechConversion, TextToSpeechConversionInput } from "@/ai/flows/text-to-speech-conversion";
import { generateSpeech, GenerateSpeechInput } from "@/ai/flows/ai-mentor-speech-flow";
import { getWordOfTheDay as getWordOfTheDayFlow } from "@/ai/flows/word-of-the-day";
import { z } from "zod";

const getAIResponseSchema = z.object({
  question: z.string(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export async function getAIResponse(input: { question: string; chatHistory?: { role: 'user' | 'assistant'; content: string }[] }) {
  const parsedInput = getAIResponseSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Invalid input" };
  }

  const flowInput: AIMentorInput = {
    query: parsedInput.data.question,
    chatHistory: parsedInput.data.chatHistory,
  };
  try {
    const result = await askAditiMadam(flowInput);
    return { success: true, answer: result.response };
  } catch (error) {
    console.error("Error in getAIResponse:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get response from AI.";
    return { success: false, error: errorMessage };
  }
}

const getAudioResponseSchema = z.object({
  text: z.string(),
});

export async function getAudioResponse(input: TextToSpeechConversionInput) {
  const parsedInput = getAudioResponseSchema.safeParse(input);
   if (!parsedInput.success) {
    return { success: false, error: "Invalid input" };
  }
  try {
    const result = await textToSpeechConversion(parsedInput.data);
    return { success: true, audio: result.media };
  } catch (error) {
    console.error("Error in getAudioResponse:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to convert text to speech.";
    return { success: false, error: errorMessage };
  }
}

const trainAISchema = z.object({
  trainingData: z.string(),
});

export async function trainAI(input: AdminTrainAIMentorInput) {
    const parsedInput = trainAISchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, error: "Invalid input" };
    }
  try {
    const result = await adminTrainAIMentor(parsedInput.data);
    return { success: true, result: result.result };
  } catch (error) {
    console.error("Error in trainAI:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to train AI.";
    return { success: false, error: errorMessage };
  }
}

const generateSpeechSchema = z.object({
  topic: z.string(),
});

export async function generateSpeechAction(input: GenerateSpeechInput) {
  const parsedInput = generateSpeechSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Invalid input" };
  }
  try {
    const result = await generateSpeech(parsedInput.data);
    return { success: true, speech: result.speech };
  } catch (error) {
    console.error("Error in generateSpeechAction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate speech.";
    return { success: false, error: errorMessage };
  }
}

export async function getWordOfTheDay() {
  try {
    const result = await getWordOfTheDayFlow();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getWordOfTheDay:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get word of the day.";
    return { success: false, error: errorMessage };
  }
}
