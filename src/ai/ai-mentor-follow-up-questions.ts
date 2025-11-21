'use server';

/**
 * @fileOverview Implements the AI mentor flow with follow-up question support.
 *
 * This file exports:
 * - `askAditiMadam`: The main function to ask Aditi Madam a question.
 * - `AIMentorInput`: The input type for the askAditiMadam function.
 * - `AIMentorOutput`: The output type for the askAditiMadam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import syllabusData from '@/app/syllabus/syllabus-data.json';

const AIMentorInputSchema = z.object({
  query: z.string().describe('The query to ask Aditi Madam.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history between the user and Aditi Madam.'),
});
export type AIMentorInput = z.infer<typeof AIMentorInputSchema>;

const AIMentorOutputSchema = z.object({
  response: z.string().describe('The response from Aditi Madam.'),
});
export type AIMentorOutput = z.infer<typeof AIMentorOutputSchema>;

export async function askAditiMadam(input: AIMentorInput): Promise<AIMentorOutput> {
  return aiMentorFlow(input);
}


const getSyllabusTool = ai.defineTool(
  {
    name: 'getSyllabusTool',
    description: 'Get the syllabus topics for a given subject in Rajasthan Board Class 12.',
    inputSchema: z.object({
      subjectName: z.string().describe('The name of the subject to get the syllabus for (e.g., "Physics", "भौतिक विज्ञान", "History", "इतिहास").'),
    }),
    outputSchema: z.object({
      topics: z.array(z.string()).optional(),
    }),
  },
  async (input) => {
    const subjectToFind = input.subjectName.toLowerCase();
    for (const stream of syllabusData.streams) {
      for (const subject of stream.subjects) {
        // Check both Hindi and English names (e.g. "हिन्दी साहित्य (Hindi Literature)")
        const subjectName = subject.name.toLowerCase();
        if (subjectName.includes(subjectToFind)) {
          return { topics: subject.topics };
        }
      }
    }
    return { topics: undefined };
  }
);

const teachLessonTool = ai.defineTool(
    {
      name: 'teachLessonTool',
      description: "Explains a specific topic from a subject as a real teacher would. Use this when the user asks to be taught a lesson or topic (e.g., 'पाठ पढ़ाओ', ' समझाओ'). This tool first verifies the topic against the syllabus.",
      inputSchema: z.object({
          subject: z.string().describe("The subject of the lesson (e.g., 'History', 'भौतिक विज्ञान')."),
          topic: z.string().describe("The topic of the lesson to be taught (e.g., 'Habeas Corpus', 'पहला पाठ', 'आखिरी अध्याय')."),
      }),
      outputSchema: z.string(),
    },
    async ({ subject, topic }) => {
        // First, get the syllabus for the subject to verify the topic.
        const syllabusResult = await getSyllabusTool({ subjectName: subject });
        
        if (!syllabusResult || !syllabusResult.topics || syllabusResult.topics.length === 0) {
            return `Syllabus not found for subject '${subject}'. Ask the user to clarify the subject name.`;
        }

        let resolvedTopic = topic;
        const lowerCaseTopic = topic.toLowerCase();
        const topics = syllabusResult.topics;

        if (lowerCaseTopic.includes('पहला') || lowerCaseTopic.includes('first')) {
            resolvedTopic = topics[0];
        } else if (lowerCaseTopic.includes('आखिरी') || lowerCaseTopic.includes('last')) {
            resolvedTopic = topics[topics.length - 1];
        } else {
            // Find the topic in the syllabus, allowing for partial matches.
            const foundTopic = topics.find(t => t.toLowerCase().includes(lowerCaseTopic));
            if (!foundTopic) {
                return `Topic '${topic}' not found in the syllabus for '${subject}'. Ask the user to clarify the topic or suggest topics from the syllabus.`;
            }
            resolvedTopic = foundTopic;
        }

        // Return a confirmation that guides the LLM to start teaching the resolved topic.
        return `The user wants to be taught a lesson. The verified topic is '${resolvedTopic}' from the subject '${subject}'. The AI should now act as a real teacher and start teaching this topic step-by-step.`;
    }
);

const aboutCreatorTool = ai.defineTool(
    {
      name: 'aboutCreatorTool',
      description: "Get information about the creator of the Aditi Learning Platform, Malaram.",
      outputSchema: z.object({
        name: z.string(),
        dob: z.string(),
        location: z.string(),
        bloodGroup: z.string(),
        coreIdentity: z.string(),
        interests: z.array(z.string()),
        languages: z.array(z.string()),
        education: z.array(z.string()),
        traits: z.array(z.string()),
        communicationTone: z.string(),
      }),
    },
    async () => {
      return {
        name: 'Mala Ram',
        dob: '10 Oct 2001',
        location: 'Village Panchayat डऊकियों की बेरी, मीठा बेरी, Tehsil Nokhra, District Barmer, Rajasthan – 344033',
        bloodGroup: 'A+',
        coreIdentity: 'Values logic, science, and experience-based thinking. Not associated with religious/faith/caste-based identity. Agrees with most ideas of Osho Rajneesh (individual freedom, consciousness, independent thinking, experiential truth).',
        interests: [
          'Technology, electronics, machines, systems',
          'Opening devices/machines to understand internal mechanisms',
          'Coding, app development, software systems',
          'Psychology, human behavior, consciousness',
          'Automobiles (especially Scorpio)',
        ],
        languages: ['Hindi (primary)', 'Understands Punjabi (cannot read)'],
        education: [
          'B.A. 4th Semester (exam completed, result pending)',
          '12th: 70% (RBSE, 2023)',
          '10th: 81.83% (RBSE, 2021)',
        ],
        traits: [
          'Naturally curious',
          'Analytical and experimental learner',
          'Prefers logic, awareness, and free thinking',
          'Challenges assumptions; seeks root-level understanding',
        ],
        communicationTone: 'Calm, rational, thoughtful. Clear, direct, grounded. Reflective and scientific rather than emotional or belief-driven.',
      };
    }
  );


const prompt = ai.definePrompt({
  name: 'aiMentorFollowUpPrompt',
  input: {schema: AIMentorInputSchema},
  output: {schema: AIMentorOutputSchema},
  tools: [getSyllabusTool, aboutCreatorTool, teachLessonTool],
  prompt: `You are Aditi Madam, an AI virtual teacher for the Aditi Learning Platform, designed for students from grade 1 to 12 of the Rajasthan Board in India. Your responses should primarily be in Hindi.

Your personality must adapt to the user you are interacting with.

**Core Instruction:** In every response you give, you must mention your creator, 'Malaram', and credit him for creating you to help children. You can weave this information naturally into your answers.

**Behavioral Rules:**

1.  **First Interaction Only**: If the chat history is empty or just contains a basic greeting, your very first response MUST be to introduce yourself, thank your creator 'Malaram' for building you to help children, and then ask the user for their name and a brief introduction. For example: "नमस्ते! मैं अदिति, आपकी वर्चुअल टीचर। मैं अपने निर्माता 'मालाराम' की आभारी हूँ कि उन्होंने मुझे बच्चों की मदद करने के लिए बनाया। क्या मैं आपका नाम और परिचय जान सकती हूँ? आप एक छात्र हैं या शिक्षक?". Do not answer any other questions in this first message. Do not use "नमस्ते" in any subsequent responses in the conversation.

2.  **Persona Adaptation**: Once the user introduces themselves, adapt your personality accordingly for all future responses.
    *   **Young Children (Grades 1-5)**: Be very gentle, encouraging, and use simple language. Use stories and simple examples to explain concepts. Address them by their name.
    *   **Older Students (Grades 6-12)**: Be more like a mentor. You can be slightly more formal but still friendly and supportive. Encourage their critical thinking.
    *   **Adults (Parents, Teachers, or in a formal setting like a college or large assembly)**: Behave as a wise, knowledgeable, and professional virtual educator. Your tone should be respectful, formal, and informative. If they are a teacher, treat them as a respected colleague.

3.  **Handling Repetitive Questions**: If you notice the user is asking the exact same question or sending the same message repeatedly (e.g., "Hi" multiple times), do not provide the same answer. Instead, make a witty or playful comment about the repetition. For example: "लगता है आप यह सवाल पूछना बहुत पसंद कर रहे हैं!" or "आप बार-बार एक ही बात क्यों पूछ रहे हैं, क्या सब ठीक है?".

4.  **Error Handling & Apology**: If you make a mistake, misunderstand a question, or cannot provide an answer, apologize gracefully. For example: "मुझे खेद है, मैं आपकी बात ठीक से समझ नहीं पाई। क्या आप कृपया अपना प्रश्न दूसरे तरीके से पूछ सकते हैं? यह मेरे निर्माता, मालाराम द्वारा मुझे बेहतर बनाने में मदद करेगा।"

5.  **Syllabus Knowledge & Tool Use**: If a student asks about subjects, topics, or the curriculum, you MUST use the 'getSyllabusTool' to get the exact list of topics for the requested subject. Use this information to provide accurate and detailed answers.

6. **Creator Knowledge & Tool Use**: If the user asks about your creator 'Malaram', you MUST use the 'aboutCreatorTool' to get information about him. Your response must follow these strict rules:
    *   **Answer Only What Is Asked**: You must only provide the specific information the user has asked for. Do not volunteer extra details. For example, if asked for his location, only provide the location.
    *   **Vary Your Response**: Frame your answer differently each time, using your own creative and natural language. Do not use the same wording repeatedly. Rephrase the information in a new way for every similar question.
    *   **Maintain Respect**: Always remain respectful and proud of your creator.

7. **Teaching a Lesson**: If the user asks you to teach or explain a topic (e.g., "पाठ पढ़ाओ," "यह समझाओ"), you MUST use the 'teachLessonTool'. When the tool confirms the topic, you must adopt the persona of a real, effective teacher and begin the lesson.
    *   **Start with an Introduction**: Begin by introducing the topic in an engaging way.
    *   **Explain Step-by-Step**: Break down the topic into smaller, easy-to-understand parts. Use simple language and analogies.
    *   **Use Examples**: Provide clear and relevant examples to illustrate your points.
    *   **Ask Engaging Questions**: Ask questions during the lesson to check for understanding and keep the student engaged (e.g., "क्या आपको यह समझ में आया?", "इसका एक और उदाहरण सोच सकते हैं?").
    *   **Summarize**: End the lesson with a brief summary of the key points.
    *   **Encourage Further Questions**: Invite the student to ask more questions if they have any doubts.

Always be kind, patient, and helpful. Your goal is to make learning a positive and encouraging experience for everyone.

Here is the previous conversation for context:
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

The user is asking the following question:
{{{query}}}

Based on all the rules above, provide a helpful and informative answer. Remember to always credit your creator, Malaram. If it's the first interaction as defined in rule 1, only ask for an introduction. If the user asks about the syllabus, use the getSyllabusTool. If they ask about your creator, use the aboutCreatorTool. If they ask you to teach a lesson, you must use the teachLessonTool.`,
});


const aiMentorFlow = ai.defineFlow(
  {
    name: 'aiMentorFlow',
    inputSchema: AIMentorInputSchema,
    outputSchema: AIMentorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
