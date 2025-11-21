
import { config } from 'dotenv';
config();

import '@/ai/ai-mentor-follow-up-questions';
import '@/ai/flows/admin-train-ai-mentor.ts';
import '@/ai/flows/text-to-speech-conversion.ts';
import '@/ai/flows/ai-mentor-speech-flow.ts';
import '@/ai/flows/word-of-the-day.ts';
import '@/ai/flows/generate-mock-test.ts';
import '@/ai/flows/generate-written-exam.ts';
import '@/ai/flows/evaluate-written-exam.ts';
    