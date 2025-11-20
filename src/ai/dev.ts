import { config } from 'dotenv';
config();

import '@/ai/flows/ai-mentor-initial-prompt.ts';
import '@/ai/flows/admin-train-ai-mentor.ts';
import '@/ai/flows/text-to-speech-conversion.ts';