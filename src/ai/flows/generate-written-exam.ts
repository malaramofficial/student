'use server';

/**
 * @fileOverview A flow to generate a written exam paper.
 *
 * - generateWrittenExam - A function that handles the exam generation process.
 * - GenerateWrittenExamInput - The input type for the generateWrittenExam function.
 * - GenerateWrittenExamOutput - The return type for the generateWrittenExam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import syllabusData from '@/app/syllabus/syllabus-data.json';

const QuestionSchema = z.object({
  question: z.string().describe('The exam question text in Hindi.'),
  type: z.enum(['short', 'long', 'essay']).describe('The type of question.'),
  marks: z.number().describe('The marks allocated for this question.'),
});

const GenerateWrittenExamInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate the exam.'),
});
export type GenerateWrittenExamInput = z.infer<typeof GenerateWrittenExamInputSchema>;

const GenerateWrittenExamOutputSchema = z.object({
  subject: z.string(),
  totalMarks: z.number(),
  duration: z.string().describe('The duration of the exam, e.g., "3 घंटे".'),
  instructions: z.array(z.string()).describe('General instructions for the exam in Hindi.'),
  questions: z.array(QuestionSchema),
});
export type GenerateWrittenExamOutput = z.infer<typeof GenerateWrittenExamOutputSchema>;

export async function generateWrittenExam(
  input: GenerateWrittenExamInput
): Promise<GenerateWrittenExamOutput> {
  // Find the relevant syllabus for the subject
  let syllabusTopics: string[] = [];
  const subjectToFind = input.subject.toLowerCase();
  for (const stream of syllabusData.streams) {
    const foundSubject = stream.subjects.find((s) =>
      s.name.toLowerCase().includes(subjectToFind)
    );
    if (foundSubject) {
      syllabusTopics = foundSubject.topics;
      break;
    }
  }

  if (syllabusTopics.length === 0) {
    throw new Error(`Could not find syllabus for subject: ${input.subject}`);
  }

  const flowInput = {
    ...input,
    syllabus: syllabusTopics.join(', '),
  };

  return generateWrittenExamFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'generateWrittenExamPrompt',
  input: {
    schema: z.object({
      subject: z.string(),
      syllabus: z.string(),
    }),
  },
  output: { schema: GenerateWrittenExamOutputSchema },
  prompt: `You are an expert paper setter for the Rajasthan Board Class 12 examinations. Your task is to create a well-structured written exam paper in Hindi for the given subject.

Subject: {{{subject}}}

Syllabus Topics:
{{{syllabus}}}

Please create a balanced exam paper that adheres to the Rajasthan Board pattern. The paper should include:
1.  **Total Marks:** Around 50-60 marks.
2.  **Duration:** Appropriate for the total marks (e.g., 2-3 hours).
3.  **Instructions:** A few general instructions for the students in Hindi.
4.  **A mix of question types:**
    *   Some short answer questions (लघु उत्तरीय प्रश्न) of 2-3 marks each.
    *   Some long answer questions (दीर्घ उत्तरीय प्रश्न) of 4-5 marks each.
    *   At least one essay-type question (निबंधात्मक प्रश्न) of 6-8 marks.
5.  **Coverage:** The questions should cover a wide range of topics from the provided syllabus.
6.  **Language:** All questions and instructions must be in clear and standard Hindi.

Generate the complete exam paper in the required JSON format. Ensure the sum of marks for all questions equals the totalMarks.
`,
});

const generateWrittenExamFlow = ai.defineFlow(
  {
    name: 'generateWrittenExamFlow',
    inputSchema: z.object({
      subject: z.string(),
      syllabus: z.string(),
    }),
    outputSchema: GenerateWrittenExamOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
