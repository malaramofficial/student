
'use server';

/**
 * @fileOverview A flow to generate a mock test for a given subject.
 *
 * - generateMockTest - A function that handles the test generation process.
 * - GenerateMockTestInput - The input type for the generateMockTest function.
 * - GenerateMockTestOutput - The return type for the generateMockTest function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import syllabusData from '@/app/syllabus/syllabus-data.json';

const QuestionSchema = z.object({
    question: z.string().describe('The multiple-choice question.'),
    options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
    answer: z.string().describe('The correct answer, which must be one of the options.'),
});

const GenerateMockTestInputSchema = z.object({
  subject: z.string().describe('The subject to generate the test for (e.g., "Physics", "History").'),
  numQuestions: z.number().min(1).max(20).default(5).describe('The number of questions to generate.'),
});
export type GenerateMockTestInput = z.infer<typeof GenerateMockTestInputSchema>;

const GenerateMockTestOutputSchema = z.object({
  subject: z.string(),
  questions: z.array(QuestionSchema),
});
export type GenerateMockTestOutput = z.infer<typeof GenerateMockTestOutputSchema>;


export async function generateMockTest(input: GenerateMockTestInput): Promise<GenerateMockTestOutput> {
  // Find the relevant syllabus for the subject
  let syllabusTopics: string[] = [];
  const subjectToFind = input.subject.toLowerCase();
  for (const stream of syllabusData.streams) {
    const foundSubject = stream.subjects.find(s => s.name.toLowerCase().includes(subjectToFind));
    if (foundSubject) {
      syllabusTopics = foundSubject.topics;
      break;
    }
  }

  if (syllabusTopics.length === 0) {
    throw new Error(`Could not find syllabus for subject: ${input.subject}`);
  }

  // Inject the syllabus into the flow input
  const flowInput = {
    ...input,
    syllabus: syllabusTopics.join(', '),
  };

  return generateMockTestFlow(flowInput);
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
        // Check both Hindi and English names
        const subjectName = subject.name.toLowerCase();
        if (subjectName.includes(subjectToFind)) {
          return { topics: subject.topics };
        }
      }
    }
    return { topics: undefined };
  }
);


const prompt = ai.definePrompt({
  name: 'generateMockTestPrompt',
  input: {
    schema: z.object({
      subject: z.string(),
      numQuestions: z.number(),
      syllabus: z.string(),
    })
  },
  output: { schema: GenerateMockTestOutputSchema },
  tools: [getSyllabusTool],
  prompt: `You are an expert in creating educational content for Rajasthan Board Class 12 students. Your task is to generate a mock test in Hindi.

Subject: {{{subject}}}
Number of Questions: {{{numQuestions}}}

Syllabus Topics:
{{{syllabus}}}

Please generate {{{numQuestions}}} multiple-choice questions. You MUST base these questions strictly on the provided syllabus topics. Do not invent or include information from outside this syllabus.
For each question:
1.  The question must be in clear Hindi.
2.  Provide exactly 4 options.
3.  Indicate the correct answer. The correct answer must be one of the provided options.
4.  Ensure the questions cover a range of topics from the syllabus provided.

Generate the test according to the output schema.`,
});

const generateMockTestFlow = ai.defineFlow(
  {
    name: 'generateMockTestFlow',
    inputSchema: z.object({
      subject: z.string(),
      numQuestions: z.number(),
      syllabus: z.string(),
    }),
    outputSchema: GenerateMockTestOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

    
