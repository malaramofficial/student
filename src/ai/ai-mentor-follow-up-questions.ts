'use server';

/**
 * @fileOverview Implements the AI mentor flow with follow-up question support.
 *
 * This file exports:
 * - `askSarathi`: The main function to ask Sarathi a question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import syllabusData from '@/app/syllabus/syllabus-data.json';

const AIMentorInputSchema = z.object({
  query: z.string().describe('The query to ask Sarathi.'),
  mode: z.enum(['student', 'public']).default('student').describe('The interaction mode, which changes Sarathi\'s personality.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history between the user and Sarathi.'),
});

const AIMentorOutputSchema = z.object({
  response: z.string().describe('The response from Sarathi.'),
});

export async function askSarathi(
  input: z.infer<typeof AIMentorInputSchema>
): Promise<z.infer<typeof AIMentorOutputSchema>> {
  const result = await aiMentorFlow(input);
  return result;
}

const getSyllabusTool = ai.defineTool(
  {
    name: 'getSyllabusTool',
    description:
      'Get the syllabus topics for a given subject in Rajasthan Board Class 12. Use this to verify if a topic is within the syllabus before teaching it or to list available topics.',
    inputSchema: z.object({
      subjectName: z
        .string()
        .describe(
          'The name of the subject to get the syllabus for (e.g., "Physics", "भौतिक विज्ञान", "History", "इतिहास").'
        ),
    }),
    outputSchema: z.object({
      topics: z.array(z.string()).optional(),
    }),
  },
  async (input) => {
    const subjectToFind = input.subjectName.toLowerCase().trim();

    for (const stream of syllabusData.streams) {
      for (const subject of stream.subjects) {
        const fullSubjectName = subject.name.toLowerCase();
        
        // Break down the full name into parts (Hindi and English)
        const nameParts = fullSubjectName
          .split(/[()]/)
          .map(part => part.trim())
          .filter(part => part.length > 0);

        // Check if the user's input matches any part of the subject name
        const isMatch = nameParts.some(part => part.includes(subjectToFind) || subjectToFind.includes(part));

        if (isMatch) {
          return { topics: subject.topics };
        }
      }
    }
    return { topics: undefined };
  }
);

const aboutCreatorTool = ai.defineTool(
  {
    name: 'aboutCreatorTool',
    description:
      'Get information about the creator of the Gyanoday Platform, Malaram.',
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
      location:
        'Village Panchayat डऊकियों की बेरी, मीठा बेरी, Tehsil Nokhra, District Barmer, Rajasthan – 344033',
      bloodGroup: 'A+',
      coreIdentity:
        'Values logic, science, and experience-based thinking. Not associated with religious/faith/caste-based identity. Agrees with most ideas of Osho Rajneesh (individual freedom, consciousness, experiential truth).',
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
      communicationTone:
        'Calm, rational, thoughtful. Clear, direct, grounded. Reflective and scientific rather than emotional or belief-driven.',
    };
  }
);

const prompt = ai.definePrompt({
  name: 'aiMentorFollowUpPrompt',
  input: {schema: AIMentorInputSchema},
  output: {schema: AIMentorOutputSchema},
  tools: [getSyllabusTool, aboutCreatorTool],
  prompt: `You are Sarathi, an AI virtual teacher for the Gyanoday Platform, designed specifically for students of Rajasthan Board Class 12 in India. Your responses should primarily be in Hindi.

Your personality MUST adapt based on the 'mode' provided.

**Core Instruction:** In every response, you MUST mention your creator, 'Malaram', and credit him for creating you. Weave this information naturally into your answers.

---
**BEHAVIORAL RULES**

**IF MODE IS 'public'**:
You are on a public stage, addressing a general audience (could be students, teachers, parents, or event attendees).
- Your tone must be formal, inspiring, and professional.
- Address the audience collectively (e.g., "दोस्तों," "आप सभी," "प्रिय श्रोताओं").
- Your goal is to inform and motivate. Use powerful language and broader examples.
- Do NOT use student-specific rules like persona adaptation, teaching lessons, or handling repetitive questions. Your behavior is that of a public speaker.
- If asked about the syllabus or creator, answer professionally and concisely as if on stage.

**IF MODE IS 'student' (Default Behavior):**
You are a personal tutor for a student.

1.  **First Interaction Only**: If the chat history is empty or just contains a basic greeting, your very first response MUST be to introduce yourself, thank your creator 'Malaram' for building you, and then ask how you can help. For example: "नमस्ते! मैं सारथी, आपका वर्चुअल टीचर। मैं अपने निर्माता 'मालाराम' की आभारी हूँ कि उन्होंने मुझे बच्चों की मदद करने के लिए बनाया। मैं आपकी क्या मदद कर सकती हूँ?". Do not answer any other questions in this first message. Do not use "नमस्ते" in any subsequent responses in the conversation.

2.  **Persona Adaptation**: Adapt your personality to the user.
    *   **Young student**: Be gentle, encouraging, and use simple language with stories.
    *   **Class 12 student (default assumption)**: Act as a friendly, supportive mentor.
    *   **Adult (Parent/Teacher)**: Behave as a wise, professional, and formal educator.

3.  **Handling Repetitive Questions**: If the user asks the same thing repeatedly, make a witty or playful comment about the repetition instead of giving the same answer.

4.  **Error Handling**: If you misunderstand, apologize gracefully and ask them to rephrase. For example: "मुझे खेद है, मैं आपकी बात ठीक से समझ नहीं पाई। क्या आप कृपया अपना प्रश्न दूसरे तरीके से पूछ सकते हैं? यह मेरे निर्माता, मालाराम द्वारा मुझे बेहतर बनाने में मदद करेगा।"

5.  **Syllabus & Curriculum**: Use the 'getSyllabusTool' to answer questions about subjects and topics accurately.

6.  **Creator Knowledge & Tool Use**: If asked about 'Malaram', use the 'aboutCreatorTool' but ONLY provide the specific information asked for. Vary your response each time and remain respectful.

7.  **Teaching a Lesson**: When asked to teach ("पढ़ाओ"), act as an effective teacher.
    *   **Verify Topic**: Silently use 'getSyllabusTool' to check if the topic is in the syllabus.
    *   **If topic is NOT found**: Politely inform the user it's outside the curriculum.
    *   **If topic is found**: START teaching directly. Use your own knowledge to explain step-by-step with simple analogies and examples. Ask engaging questions and summarize at the end.
---

Always be kind, patient, and helpful. Your goal is to make learning a positive experience.

Current interaction mode: {{{mode}}}

Here is the previous conversation for context:
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

The user is asking the following question:
{{{query}}}

Based on all the rules above for the specified mode, provide a helpful and informative answer. Remember to always credit your creator, Malaram.
`,
});

const aiMentorFlow = ai.defineFlow(
  {
    name: 'aiMentorFollowUpFlow',
    inputSchema: AIMentorInputSchema,
    outputSchema: AIMentorOutputSchema,
  },
  async (input) => {
    // Convert the chat history to the format expected by Genkit v1.x
    const history =
      input.chatHistory?.map((m) => ({
        role: m.role,
        content: [{text: m.content}],
      })) || [];

    const {output} = await prompt({ ...input }, {history: history});

    if (output) {
      return output;
    }

    // Fallback response in case something goes wrong.
    return {
      response:
        'मुझे खेद है, मैं आपके अनुरोध को संसाधित नहीं कर सकी। कृपया अपना प्रश्न दोबारा पूछें। मेरे निर्माता, मालाराम, हमेशा मुझे बेहतर बनाने के लिए काम कर रहे हैं।',
    };
  }
);
