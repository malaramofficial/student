import { config } from 'dotenv';
config();

import '@/ai/ai-mentor-follow-up-questions';
import '@/ai/flows/admin-train-ai-mentor.ts';
import '@/ai/flows/text-to-speech-conversion.ts';
import '@/ai/flows/ai-mentor-speech-flow.ts';
import '@/ai/flows/word-of-the-day.ts';
