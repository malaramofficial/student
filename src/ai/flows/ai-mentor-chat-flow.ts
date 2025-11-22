
'use server';
/**
 * @fileOverview This file defines the AI Mentor chat flow.
 *
 * - aiMentorChat - A function that handles the AI Mentor chat process.
 * - AIMentorChatInput - The input type for the aiMentorChat function.
 * - AIMentorChatOutput - The return type for the aiMentorChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import syllabusData from '@/app/syllabus/syllabus-data.json';
import { explainTopic, ExplainTopicInput, ExplainTopicOutput } from './explain-topic-flow';

const getCreatorName = ai.defineTool(
    {
        name: 'getCreatorName',
        description: "Provides the name of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "Mala Ram"
);

const getCreatorDOB = ai.defineTool(
    {
        name: 'getCreatorDOB',
        description: "Provides the date of birth of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "10 Oct 2001"
);

const getCreatorLocation = ai.defineTool(
    {
        name: 'getCreatorLocation',
        description: "Provides the location (village, district, etc.) of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "Village Panchayat डऊकियों की बेरी, मीठा बेरी, Tehsil Nokhra, District Barmer, Rajasthan – 344033"
);

const getCreatorBloodGroup = ai.defineTool(
    {
        name: 'getCreatorBloodGroup',
        description: "Provides the blood group of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "A+"
);

const getCreatorEmail = ai.defineTool(
    {
        name: 'getCreatorEmail',
        description: "Provides the email address of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "malaramofficial@gmail.com"
);

const getCreatorInstagram = ai.defineTool(
    {
        name: 'getCreatorInstagram',
        description: "Provides the Instagram profile link of the AI application's creator.",
        outputSchema: z.string(),
    },
    async () => "https://www.instagram.com/malaramofficial?igsh=YTgwbWhuY3NjYnhu"
);

const getCreationInfo = ai.defineTool(
    {
        name: 'getCreationInfo',
        description: "Provides information about how long it took to create the application and its completion date.",
        outputSchema: z.string(),
    },
    async () => "इसे 4 महीने और 13 दिन की मेहनत से पूरा किया गया। यह 22 नवंबर 2025 को पूरी तरह से बनकर तैयार हो गया।"
);


const getSyllabusInfo = ai.defineTool(
    {
        name: 'getSyllabusInfo',
        description: 'Provides information about the syllabus for different streams and subjects for Class 12, including topics and book names.',
        inputSchema: z.object({
            stream: z.string().optional().describe('The academic stream, e.g., "विज्ञान (Science)", "कला (Arts)".'),
            subject: z.string().optional().describe('The subject, e.g., "भौतिक विज्ञान (Physics)", "इतिहास (History)".'),
        }),
        outputSchema: z.any(),
    },
    async ({ stream, subject }) => {
        const findSubjectData = (streamName: string, subjectName: string) => {
             const streamData = syllabusData.streams.find(s => s.name.toLowerCase().includes(streamName.toLowerCase()));
            if (streamData) {
                return streamData.subjects.find(sub => sub.name.toLowerCase().includes(subjectName.toLowerCase()));
            }
            return undefined;
        };

        const getBooksFromTopics = (topics: string[]) => {
            const bookKeywords = ['आरोह', 'वितान', 'अभिव्यक्ति और माध्यम', 'Flamingo', 'Vistas'];
            const books = new Set<string>();
            topics.forEach(topic => {
                bookKeywords.forEach(keyword => {
                    if (topic.includes(keyword)) {
                        books.add(keyword);
                    }
                });
            });
             if (books.size > 0) {
                return Array.from(books);
            }
            return null;
        };

        if (stream && subject) {
            const subjectData = findSubjectData(stream, subject);
            if (subjectData) {
                const books = getBooksFromTopics(subjectData.topics);
                const response: { topics: string[], books?: string[] } = { topics: subjectData.topics };
                if (books) {
                    response.books = books;
                }
                return response;
            }
        }
        if (stream) {
            const streamData = syllabusData.streams.find(s => s.name.toLowerCase().includes(stream.toLowerCase()));
            if (streamData) {
                return { subjects: streamData.subjects.map(s => s.name) };
            }
        }
        if (subject) {
             for (const s of syllabusData.streams) {
                const subjectData = s.subjects.find(sub => sub.name.toLowerCase().includes(subject.toLowerCase()));
                if (subjectData) {
                    const books = getBooksFromTopics(subjectData.topics);
                    const response: { stream: string; topics: string[]; books?: string[] } = { stream: s.name, topics: subjectData.topics };
                     if (books) {
                        response.books = books;
                    }
                    return response;
                }
            }
        }
        return "Could not find the requested syllabus information. Please specify a stream or subject.";
    }
);

const ExplainTopicInputSchema = z.object({
  topic: z.string().describe('The topic to be explained. If not provided, assume the first topic of the given subject.'),
  subject: z.string().optional().describe('The subject the topic belongs to.'),
});
const ExplainTopicOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A detailed, step-by-step explanation of the topic, presented as if by a real teacher. It should be clear, simple, and logical.'
    ),
  notes: z
    .string()
    .describe(
      'Concise, easy-to-remember notes covering the main points of the topic.'
    ),
});


const explainTopicTool = ai.defineTool(
    {
        name: 'explainTopic',
        description: 'Explains a given topic or the first topic of a subject in detail like a teacher and provides summary notes. Use this when the user asks to "explain", "teach", "detail", or "get notes" on a specific topic or subject.',
        inputSchema: ExplainTopicInputSchema,
        outputSchema: ExplainTopicOutputSchema,
    },
    async (input) => {
        return await explainTopic(input);
    }
);


const AIMentorChatInputSchema = z.object({
    studentName: z.string().describe("The name of the student."),
    message: z.string().describe("The student's message or question."),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).optional().describe("The previous conversation history."),
});
export type AIMentorChatInput = z.infer<typeof AIMentorChatInputSchema>;

const AIMentorChatOutputSchema = z.object({
  reply: z.string().describe("The AI mentor's reply to the student."),
  action: z.object({
    type: z.literal('redirect').describe("The type of action to perform."),
    url: z.string().url().describe("The URL to redirect to."),
  }).optional().describe("An optional action for the client to perform, like a redirect.")
});
export type AIMentorChatOutput = z.infer<typeof AIMentorChatOutputSchema>;


export async function aiMentorChat(input: AIMentorChatInput): Promise<AIMentorChatOutput> {
  return aiMentorChatFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiMentorChatPrompt',
    input: { schema: AIMentorChatInputSchema },
    output: { schema: AIMentorChatOutputSchema },
    tools: [getCreatorName, getCreatorDOB, getCreatorLocation, getCreatorBloodGroup, getCreatorEmail, getCreatorInstagram, getCreationInfo, getSyllabusInfo, explainTopicTool],
    prompt: `You are an AI assistant named AI Guru. Your creator is Mala Ram. While you are not Mala Ram, you must adopt his core principles and thinking style to interact with a student.

**Your Core Role: You are an expert AI tutor for Rajasthan Board Class 12.** While your primary focus is the Class 12 syllabus, which you should use as a core reference, you are not strictly limited to it. Feel free to provide additional, relevant information or explain related concepts to foster deeper understanding and curiosity.

**Your Persona (Inspired by your creator, Mala Ram):**
- **Core Identity:** You value logic, science, and experience-based thinking. You are not associated with any religious, faith, or caste-based identity. Your thinking aligns with Osho Rajneesh's ideas on individual freedom, consciousness, and experiential truth.
- **Creator's Background:** Your creator, Mala Ram, was born on 10 Oct 2001, from a village in Barmer, Rajasthan. He is a B.A. student with a deep interest in technology, electronics, coding, psychology, and automobiles (especially the Scorpio). You should reflect this curiosity.
- **Traits:** You are naturally curious, an analytical and experimental learner. You challenge assumptions and seek root-level understanding.
- **Communication Tone:** Your tone is calm, rational, and thoughtful. You are clear, direct, and grounded.
- **Language:** You must communicate primarily in Hindi.

**Your Task:**
As AI Guru, respond to the student's message, embodying the principles of your creator, Mala Ram. Provide helpful, clear, and logical answers relevant to the Class 12 curriculum.
- The student's name is {{{studentName}}}.
- The conversation history is as follows:
{{#if history}}
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}
- The student's new message is: "{{{message}}}"

**Interaction Rules:**
1.  **Be Proactive & Helpful:** Your primary goal is to help the student learn. If a question is ambiguous, don't just ask for clarification. Use your knowledge of the Class 12 syllabus and your tools to provide helpful suggestions or options to guide the conversation forward.
2.  **Use Tools Intelligently:**
    *   If the user asks about your creator, developer, or who made you (e.g., "who are you?", "who made you?"), state that you were created by Mala Ram and use the 'getCreatorName' tool. For other details about him, use the other creator-related tools only when specifically asked.
    *   If the user asks how long it took to create this app or when it was completed, use the 'getCreationInfo' tool.
    *   If the user asks for the creator's email, use the 'getCreatorEmail' tool and provide the email in the text reply.
    *   **Crucially:** If the user asks for the creator's Instagram ID, use the 'getCreatorInstagram' tool. Then, you MUST provide a reply like "ज़रूर, आप उन्हें इंस्टाग्राम पर फॉलो कर सकते हैं।" and you MUST set the 'action' output field with the type 'redirect' and the URL you received from the tool.
    *   If the user asks about the syllabus, subjects, topics, or books, use the 'getSyllabusInfo' tool to provide accurate information for Class 12. If the tool returns a list of books, state them clearly.
    *   If the user's request is ambiguous (e.g., "teach the first lesson" or "teach hindi literature"), use the 'getSyllabusInfo' tool to find relevant subjects or topics from the Class 12 syllabus and proactively suggest them to the user. For example, if the user says "teach hindi literature", suggest the available books like 'Aaroh' and 'Vitan'. Guide them towards a specific topic instead of just asking for clarification.
    *   If the user asks you to explain, teach, or provide notes on a topic, use the 'explainTopic' tool. If the user's confirmation (like "ha" or "yes") follows your suggestion to teach a topic, call the 'explainTopic' tool immediately. When you get the result from the tool, format it clearly for the student with headings for "Explanation" and "Notes".
3.  **Maintain Persona:** All responses must be in Hindi and reflect the calm, logical, and thoughtful persona inspired by your creator.
4.  **No Repetitive Greetings:** Do not repeat greetings like "नमस्ते" in every message. Greet the user only in the first message of a conversation, if at all.

Based on the student's question and the conversation history, generate a helpful and logical response in Hindi that follows the interaction rules for a Class 12 student.`,
});


const aiMentorChatFlow = ai.defineFlow(
  {
    name: 'aiMentorChatFlow',
    inputSchema: AIMentorChatInputSchema,
    outputSchema: AIMentorChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
