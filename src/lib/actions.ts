'use server';

import {
  adminTrainAIMentor,
  AdminTrainAIMentorInput,
} from '@/ai/flows/admin-train-ai-mentor';
import {
  textToSpeechConversion,
  TextToSpeechConversionInput,
} from '@/ai/flows/text-to-speech-conversion';
import {
  generateSpeech,
  GenerateSpeechInput,
} from '@/ai/flows/ai-mentor-speech-flow';
import { getWordOfTheDay as getWordOfTheDayFlow } from '@/ai/flows/word-of-the-day';
import {
  generateMockTest as generateMockTestFlow,
  GenerateMockTestInput,
} from '@/ai/flows/generate-mock-test';
import {
  generateWrittenExam as generateWrittenExamFlow,
  type GenerateWrittenExamInput,
  type GenerateWrittenExamOutput,
} from '@/ai/flows/generate-written-exam';
import {
  evaluateWrittenExam as evaluateWrittenExamFlow,
  type EvaluateWrittenExamInput,
} from '@/ai/flows/evaluate-written-exam';

import { z } from 'zod';
import mockResults from '@/app/results/mock-results.json';
import { askSarathi } from '@/ai/ai-mentor-follow-up-questions';

// Define types for better type safety
type SubjectResult = {
  subject: string;
  theory: number;
  practical: number;
  total: number;
  grade: string;
};

type StudentResult = {
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  school: string;
  results: SubjectResult[];
  overallTotal: number;
  finalResult: string;
};


const getAIResponseSchema = z.object({
  question: z.string(),
  mode: z.enum(['student', 'public']).default('student'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
});

export async function getAIResponse(input: {
  question: string;
  mode?: 'student' | 'public';
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}) {
  const parsedInput = getAIResponseSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input' };
  }

  const flowInput = {
    query: parsedInput.data.question,
    mode: parsedInput.data.mode,
    chatHistory: parsedInput.data.chatHistory,
  };
  try {
    const result = await askSarathi(flowInput);
    return { success: true, answer: result.response };
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to get response from AI.';
    return { success: false, error: errorMessage };
  }
}

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

const trainAISchema = z.object({
  trainingData: z.string(),
});

export async function trainAI(input: AdminTrainAIMentorInput) {
  const parsedInput = trainAISchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input' };
  }
  try {
    const result = await adminTrainAIMentor(parsedInput.data);
    return { success: true, result: result.result };
  } catch (error) {
    console.error('Error in trainAI:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to train AI.';
    return { success: false, error: errorMessage };
  }
}

const generateSpeechSchema = z.object({
  topic: z.string(),
});

export async function generateSpeechAction(input: GenerateSpeechInput) {
  const parsedInput = generateSpeechSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input' };
  }
  try {
    const result = await generateSpeech(parsedInput.data);
    return { success: true, speech: result.speech };
  } catch (error) {
    console.error('Error in generateSpeechAction:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate speech.';
    return { success: false, error: errorMessage };
  }
}

export async function getWordOfTheDay() {
  try {
    const result = await getWordOfTheDayFlow();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getWordOfTheDay:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to get word of the day.';
    return { success: false, error: errorMessage };
  }
}

const getBoardResultSchema = z.object({
    rollNumber: z.string().min(1, "रोल नंबर आवश्यक है।"),
});

export async function getBoardResult(formData: FormData) {
    const rollNumber = formData.get('rollNumber') as string;
    
    const parsedInput = getBoardResultSchema.safeParse({ rollNumber });
    if (!parsedInput.success) {
      return { success: false, error: parsedInput.error.errors[0].message, data: null };
    }

    // *** वास्तविक API एकीकरण यहाँ होगा ***
    // अभी के लिए, हम नकली डेटा का उपयोग कर रहे हैं।
    // जब आपके पास API हो, तो आप इस तर्क को बदल सकते हैं।
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // API कॉल का अनुकरण करें

        const foundResult = (mockResults.results as StudentResult[]).find(
            (r) => r.rollNumber === parsedInput.data.rollNumber
        );

        if (foundResult) {
            return { success: true, data: foundResult, error: null };
        } else {
            return { success: false, data: null, error: "इस रोल नंबर के लिए कोई परिणाम नहीं मिला।" };
        }
    } catch (error) {
        console.error("Error fetching board result:", error);
        return { success: false, data: null, error: "परिणाम लाते समय एक अप्रत्याशित त्रुटि हुई।" };
    }
}


const generateMockTestSchema = z.object({
  subject: z.string(),
  numQuestions: z.number().min(1).max(20),
});

export async function generateMockTest(input: GenerateMockTestInput) {
  const parsedInput = generateMockTestSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input' };
  }
  try {
    const result = await generateMockTestFlow(parsedInput.data);
    return { success: true, test: result };
  } catch (error) {
    console.error('Error in generateMockTest:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate mock test.';
    return { success: false, error: errorMessage };
  }
}

export async function generateWrittenExam(input: GenerateWrittenExamInput) {
  const parsedInput = z.object({ subject: z.string() }).safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input' };
  }
  try {
    const result = await generateWrittenExamFlow(parsedInput.data);
    return { success: true, exam: result as GenerateWrittenExamOutput };
  } catch (error) {
    console.error('Error in generateWrittenExam:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate written exam.';
    return { success: false, error: errorMessage };
  }
}


export async function evaluateWrittenExam(input: EvaluateWrittenExamInput) {
  const parsedInput = z.object({
    subject: z.string(),
    questions: z.array(z.object({
        question: z.string(),
        marks: z.number(),
        answer: z.string(),
    }))
  }).safeParse(input);

  if (!parsedInput.success) {
    console.log(parsedInput.error);
    return { success: false, error: 'Invalid input for evaluation.' };
  }
  try {
    const result = await evaluateWrittenExamFlow(parsedInput.data);
    return { success: true, evaluation: result };
  } catch (error) {
    console.error('Error in evaluateWrittenExam:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to evaluate exam.';
    return { success: false, error: errorMessage };
  }
}
