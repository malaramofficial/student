
import { config } from 'dotenv';
config();

import '@/ai/flows/text-to-speech-conversion.ts';
import '@/ai/flows/ai-mentor-initial-prompt.ts';
import '@/ai/flows/ai-mentor-chat-flow.ts';
import '@/ai/flows/explain-topic-flow.ts';
import '@/ai/flows/evaluate-written-exam-flow.ts';
    
