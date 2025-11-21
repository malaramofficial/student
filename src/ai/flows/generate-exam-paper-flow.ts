'use server';
/**
 * @fileOverview This file defines the flow for generating a written exam paper from the syllabus.
 * 
 * - generateExamPaper - A function that generates an entire exam paper based on a subject and its topics.
 * - GenerateExamPaperInput - The input type for the generateExamPaper function.
 * - GenerateExamPaperOutput - The return type for the generateExamPaper function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import syllabusData from '@/app/syllabus/syllabus-data.json';

const GenerateExamPaperInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate the paper.'),
  stream: z.string().describe('The academic stream of the subject.'),
});
type GenerateExamPaperInput = z.infer<typeof GenerateExamPaperInputSchema>;

const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  marks: z.number().describe('The marks for the question.'),
});

const SectionSchema = z.object({
  name: z.string().describe('The name of the section (e.g., "खंड अ").'),
  description: z.string().optional().describe('A brief description of the section.'),
  questions: z.array(QuestionSchema).describe('An array of questions in this section.'),
});

const GenerateExamPaperOutputSchema = z.object({
  subject: z.string(),
  sections: z.array(SectionSchema),
});
type GenerateExamPaperOutput = z.infer<typeof GenerateExamPaperOutputSchema>;

export async function generateExamPaper(input: GenerateExamPaperInput): Promise<GenerateExamPaperOutput> {
  return generateExamPaperFlow(input);
}

const paperGenerationPrompt = ai.definePrompt({
    name: 'examPaperGenerationPrompt',
    input: { schema: z.object({ subject: z.string(), topics: z.array(z.string()) }) },
    output: { schema: GenerateExamPaperOutputSchema },
    prompt: `You are an expert examiner responsible for creating question papers for the Rajasthan Board Class 12. Your task is to generate a complete and well-structured question paper for the subject "{{{subject}}}" based on the provided syllabus topics.

**Syllabus Topics:**
{{#each topics}}
- {{{this}}}
{{/each}}

**Instructions:**
1.  **Structure:** The paper must be divided into four sections (खंड): 'खंड अ', 'खंड ब', 'खंड स', and 'खंड द'.
2.  **Question Types and Marks:**
    *   **खंड अ (अतिलघुरात्मक प्रश्न):** Generate 8-12 very short answer questions. Each question should be worth 1 mark.
    *   **खंड ब (लघु उत्तरात्मक प्रश्न):** Generate 5-7 short answer questions. Each question should be worth 2 marks.
    *   **खंड स (दीर्घ उत्तरीय प्रश्न):** Generate 2-3 long answer questions. Each question should be worth 4 marks.
    *   **खंड द (निबंधात्मक प्रश्न):** Generate 1-2 essay-type questions. Each question should be worth 6 marks.
3.  **Coverage:** The questions should cover a wide range of topics from the provided syllabus. Do not focus on just one or two topics.
4.  **Language:** All questions must be in Hindi.
5.  **Quality:** The questions should be clear, unambiguous, and appropriate for a Class 12 board examination. They should test the student's understanding, analytical skills, and knowledge.
6.  **Output Format:** You must generate the output in the specified JSON format, with a 'subject' and a 'sections' array. Each section object must have a name, description (optional), and an array of questions, where each question has the 'question' text and its 'marks'.

Generate a complete question paper for the subject "{{{subject}}}" following all these rules.`,
});

const generateExamPaperFlow = ai.defineFlow(
  {
    name: 'generateExamPaperFlow',
    inputSchema: GenerateExamPaperInputSchema,
    outputSchema: GenerateExamPaperOutputSchema,
  },
  async ({ subject, stream }) => {
    
    const streamData = syllabusData.streams.find(s => s.name === stream);
    if (!streamData) {
        throw new Error(`Stream not found: ${stream}`);
    }

    const subjectData = streamData.subjects.find(s => s.name === subject);
    if (!subjectData) {
        throw new Error(`Subject not found: ${subject} in stream ${stream}`);
    }

    const topics = subjectData.topics;

    const { output } = await paperGenerationPrompt({ subject, topics });

    return output!;
  }
);
