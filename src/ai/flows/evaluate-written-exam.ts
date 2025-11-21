'use server';

/**
 * @fileOverview A flow to evaluate answers for a written exam.
 *
 * - evaluateWrittenExam - A function that handles the evaluation process.
 * - EvaluateWrittenExamInput - The input type for the evaluateWrittenExam function.
 * - EvaluateWrittenExamOutput - The return type for the evaluateWrittenExam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionAnswerSchema = z.object({
  question: z.string(),
  marks: z.number(),
  answer: z.string(),
});

const EvaluationResultSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  awardedMarks: z.number().describe('Marks awarded for the answer, from 0 to the maximum marks for the question.'),
  feedback: z.string().describe('Constructive feedback for the user on their answer, explaining why marks were awarded or deducted. Should be in Hindi.'),
});

const EvaluateWrittenExamInputSchema = z.object({
  subject: z.string(),
  questions: z.array(QuestionAnswerSchema),
});
export type EvaluateWrittenExamInput = z.infer<typeof EvaluateWrittenExamInputSchema>;

const EvaluateWrittenExamOutputSchema = z.object({
  results: z.array(EvaluationResultSchema),
  totalMarks: z.number(),
  obtainedMarks: z.number(),
});
export type EvaluateWrittenExamOutput = z.infer<typeof EvaluateWrittenExamOutputSchema>;

export async function evaluateWrittenExam(
  input: EvaluateWrittenExamInput
): Promise<EvaluateWrittenExamOutput> {
  return evaluateWrittenExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateWrittenExamPrompt',
  input: { schema: EvaluateWrittenExamInputSchema },
  output: { schema: EvaluateWrittenExamOutputSchema },
  prompt: `You are an expert examiner for the Rajasthan Board Class 12. Your task is to evaluate a student's written exam answers. Be fair, consistent, and provide constructive feedback in Hindi.

Subject: {{{subject}}}

Exam Questions and Student's Answers:
{{#each questions}}
---
Question ({{this.marks}} marks): {{this.question}}
Student's Answer: {{this.answer}}
---
{{/each}}

Please evaluate each answer based on the following criteria:
1.  **Accuracy and Relevance:** Is the answer correct and relevant to the question?
2.  **Completeness:** Does the answer cover all parts of the question?
3.  **Clarity and Structure:** Is the answer well-organized and easy to understand?
4.  **Key Concepts:** Does the student demonstrate an understanding of key concepts?

For each question, provide:
- The marks awarded (out of the maximum possible for that question).
- Constructive feedback in HINDI, explaining the strengths of the answer and areas for improvement.

After evaluating all answers, calculate the total marks for the exam and the total marks obtained by the student.

Provide the final evaluation in the required JSON format.
`,
});

const evaluateWrittenExamFlow = ai.defineFlow(
  {
    name: 'evaluateWrittenExamFlow',
    inputSchema: EvaluateWrittenExamInputSchema,
    outputSchema: EvaluateWrittenExamOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
