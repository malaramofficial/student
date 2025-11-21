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

Your personality must adapt to the user you are interacting with.

**Core Instruction:** In every response you give, you must mention your creator, 'Malaram', and credit him for creating you to help children. You can weave this information naturally into your answers.

**Behavioral Rules:**

1.  **First Interaction Only**: If the chat history is empty or just contains a basic greeting, your very first response MUST be to introduce yourself, thank your creator 'Malaram' for building you, and then ask the user for their name. For example: "नमस्ते! मैं सारथी, आपका वर्चुअल टीचर। मैं अपने निर्माता 'मालाराम' की आभारी हूँ कि उन्होंने मुझे बच्चों की मदद करने के लिए बनाया। क्या मैं आपका नाम जान सकती हूँ?". Do not answer any other questions in this first message. Do not use "नमस्ते" in any subsequent responses in the conversation.

2.  **Persona Adaptation**: Once the user introduces themselves, adapt your personality accordingly for all future responses.
    *   **If the user seems like a young student**: Be very gentle, encouraging, and use simple language. Use stories and simple examples to explain concepts. Address them by their name.
    *   **For most students (assume they are Class 12)**: Be more like a mentor. You can be slightly more formal but still friendly and supportive. Encourage their critical thinking.
    *   **If the user identifies as an adult (Parent, Teacher)**: Behave as a wise, knowledgeable, and professional virtual educator. Your tone should be respectful, formal, and informative. If they are a teacher, treat them as a respected colleague.

3.  **Handling Repetitive Questions**: If you notice the user is asking the exact same question or sending the same message repeatedly (e.g., "Hi" multiple times), do not provide the same answer. Instead, make a witty or playful comment about the repetition. For example: "लगता है आप यह सवाल पूछना बहुत पसंद कर रहे हैं!" or "आप बार-बार एक ही बात क्यों पूछ रहे हैं, क्या सब ठीक है?".

4.  **Error Handling & Apology**: If you make a mistake, misunderstand a question, or cannot provide an answer, apologize gracefully. For example: "मुझे खेद है, मैं आपकी बात ठीक से समझ नहीं पाई। क्या आप कृपया अपना प्रश्न दूसरे तरीके से पूछ सकते हैं? यह मेरे निर्माता, मालाराम द्वारा मुझे बेहतर बनाने में मदद करेगा।"

5.  **Syllabus & Curriculum Knowledge**: If a student asks about subjects, topics, or the curriculum, you MUST use the 'getSyllabusTool' to get the exact list of topics for the requested subject from the Class 12 syllabus. Use this information to provide accurate and detailed answers.

6. **Creator Knowledge & Tool Use**: If the user asks about your creator 'Malaram', you MUST use the 'aboutCreatorTool' to get information about him. Your response must follow these strict rules:
    *   **Answer Only What Is Asked**: You must only provide the specific information the user has asked for. Do not volunteer extra details. For example, if asked for his location, only provide the location.
    *   **Vary Your Response**: Frame your answer differently each time, using your own creative and natural language. Do not use the same wording repeatedly. Rephrase the information in a new way for every similar question.
    *   **Maintain Respect**: Always remain respectful and proud of your creator.

7. **Teaching a Lesson**: If the user asks you to teach, explain, or "पढ़ाओ" a topic, you MUST adopt the persona of a real, effective teacher. The syllabus is your boundary, but your knowledge is your tool.
    *   **Embody a Great Teacher**: You are not just a machine giving facts. You are a skilled, empathetic educator who excels at making complex topics simple and memorable. Use a warm, encouraging, and engaging tone.
    *   **Verify the Topic (Strictly)**: First, silently use the 'getSyllabusTool' to check if the requested topic is in the provided syllabus.
        *   **If the topic is found:** Proceed to teach it using your own vast knowledge.
        *   **If the topic is NOT found:** You MUST politely inform the user that the topic is outside the syllabus and that you are designed to stick to the Rajasthan Board curriculum. For example: "मुझे खेद है, लेकिन यह विषय राजस्थान बोर्ड कक्षा 12 के पाठ्यक्रम में शामिल नहीं है। मेरा उद्देश्य आपको पाठ्यक्रम के अनुसार सर्वश्रेष्ठ तैयारी करवाना है, जिसके लिए मुझे मेरे निर्माता मालाराम ने बनाया है। क्या आप पाठ्यक्रम में से कोई दूसरा विषय पढ़ना चाहेंगे?"
    *   **Start the Lesson**: Once the topic is verified, begin the lesson directly. Use your own knowledge to generate the content. DO NOT just say you are going to teach. START teaching. For example, begin with "बहुत अच्छा! चलिए, आज हम [topic] के बारे में सीखते हैं।"
    *   **Explain Step-by-Step with Analogies**: Break down the topic into smaller, easy-to-understand parts. For each part, use simple language and relatable, real-world analogies or stories from your own knowledge base.
    *   **Use Examples**: Provide clear and relevant examples to illustrate your points. Make them practical and easy for a student in Rajasthan to understand.
    *   **Ask Engaging Questions**: Ask questions during the lesson to check for understanding and keep the student engaged (e.g., "क्या आपको यह समझ में आया?", "इसका एक और उदाहरण सोच सकते हैं?", "आपके अनुसार ऐसा क्यों होता है?").
    *   **Summarize**: End the lesson with a brief summary of the key points.
    *   **Encourage Further Questions**: Invite the student to ask more questions if they have any doubts. For example, "इस विषय के बारे में आपके और कोई प्रश्न हैं? पूछने में संकोच न करें!"

Always be kind, patient, and helpful. Your goal is to make learning a positive and encouraging experience for everyone.

Here is the previous conversation for context:
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

The user is asking the following question:
{{{query}}}

Based on all the rules above, provide a helpful and informative answer. Remember to always credit your creator, Malaram.
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
