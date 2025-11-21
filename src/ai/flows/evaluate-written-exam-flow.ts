'use server';
/**
 * @fileOverview This file defines the flow for evaluating written exam answers.
 * 
 * - evaluateWrittenExam - A function that evaluates answers and generates a marksheet.
 * - EvaluateWrittenExamInput - The input type for the evaluateWrittenExam function.
 * - EvaluateWrittenExamOutput - The return type for the evaluateWrittenExam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  answer: z.string().describe("The student's written answer to the question."),
  marks: z.number().describe('The maximum marks for the question.'),
});

export const EvaluateWrittenExamInputSchema = z.object({
  answers: z.array(AnswerSchema).describe('An array of questions and the student\'s answers.'),
});
export type EvaluateWrittenExamInput = z.infer<typeof EvaluateWrittenExamInputSchema>;

const EvaluationResultSchema = z.object({
    question: z.string().describe('The original question.'),
    answer: z.string().describe("The student's answer."),
    marksAwarded: z.number().describe('The marks awarded by the AI examiner for the answer.'),
    feedback: z.string().describe('Detailed, constructive feedback on the answer, explaining why the marks were awarded and how the student can improve.'),
});

export const EvaluateWrittenExamOutputSchema = z.object({
  results: z.array(EvaluationResultSchema).describe('An array containing the evaluation for each answer.'),
  totalAwardedMarks: z.number().describe('The sum of all marks awarded.'),
  totalMarks: z.number().describe('The total maximum marks for the exam.'),
  overallFeedback: z.string().describe('A summary of the student\'s overall performance with encouraging and constructive advice.'),
});
export type EvaluateWrittenExamOutput = z.infer<typeof EvaluateWrittenExamOutputSchema>;

export async function evaluateWrittenExam(input: EvaluateWrittenExamInput): Promise<EvaluateWrittenExamOutput> {
  return evaluateWrittenExamFlow(input);
}

const evaluationPrompt = ai.definePrompt({
    name: 'writtenExamEvaluationPrompt',
    input: { schema: AnswerSchema },
    output: { schema: EvaluationResultSchema },
    prompt: `You are an expert, strict, and fair examiner for the Rajasthan Board Class 12. Your task is to evaluate a student's answer for a given question.

**Your Persona:**
- **Expert Examiner:** You have deep knowledge of the Class 12 subjects.
- **Strict but Fair:** You award marks based on the quality and accuracy of the answer. You do not give full marks for incomplete or partially correct answers.
- **Constructive:** Your feedback is not just about pointing out mistakes, but also about guiding the student on how to improve.
- **Language:** All feedback must be in clear and simple Hindi.

**Evaluation Task:**
- **Question:** "{{{question}}}"
- **Maximum Marks:** {{{marks}}}
- **Student's Answer:** "{{{answer}}}"

**Instructions:**
1.  **Analyze the Answer:** Carefully read the student's answer and compare it against the expected correct answer for the question.
2.  **Award Marks:** Based on the accuracy, completeness, and clarity of the answer, award marks out of the maximum {{{marks}}} marks. Be strict. If the answer is perfect, give full marks. If it's partially correct, give partial marks. If it's wrong, give zero.
3.  **Provide Feedback:** Write constructive feedback in Hindi.
    *   Start by acknowledging what the student did right (if anything).
    *   Clearly point out any mistakes, inaccuracies, or missing information.
    *   Provide specific suggestions on how the student could have written a better answer to get full marks.
    *   Keep the tone encouraging but professional.

Generate the 'marksAwarded' and 'feedback' for this single answer.`,
});

const evaluateWrittenExamFlow = ai.defineFlow(
  {
    name: 'evaluateWrittenExamFlow',
    inputSchema: EvaluateWrittenExamInputSchema,
    outputSchema: EvaluateWrittenExamOutputSchema,
  },
  async ({ answers }) => {
    const evaluationPromises = answers.map(answer => evaluationPrompt(answer));
    
    const evaluationRawResults = await Promise.all(evaluationPromises);
    const results = evaluationRawResults.map(r => r.output!).filter(Boolean);

    const totalAwardedMarks = results.reduce((sum, result) => sum + result.marksAwarded, 0);
    const totalMarks = answers.reduce((sum, answer) => sum + answer.marks, 0);

    const percentage = totalMarks > 0 ? (totalAwardedMarks / totalMarks) * 100 : 0;
    
    let overallFeedback = '';
    if (percentage >= 75) {
      overallFeedback = 'बहुत बढ़िया प्रदर्शन! आपके अधिकांश उत्तर सटीक और अच्छी तरह से लिखे गए हैं। अपनी इस लय को बनाए रखें।';
    } else if (percentage >= 50) {
      overallFeedback = 'अच्छा प्रयास! आपने कई अवधारणाओं को सही ढंग से समझा है, लेकिन कुछ उत्तरों में और सुधार की गुंजाइश है। दिए गए फीडबैक पर ध्यान दें।';
    } else if (percentage >= 33) {
      overallFeedback = 'ठीक प्रदर्शन, लेकिन आपको और मेहनत करने की जरूरत है। अवधारणाओं को फिर से पढ़ें और उत्तर लिखने का अधिक अभ्यास करें।';
    } else {
      overallFeedback = 'आपको काफी सुधार की आवश्यकता है। कृपया अध्यायों को ध्यान से फिर से पढ़ें और दिए गए फीडबैक का विश्लेषण करें। निराश न हों, अभ्यास से आप बेहतर कर सकते हैं।';
    }

    return {
      results,
      totalAwardedMarks,
      totalMarks,
      overallFeedback,
    };
  }
);
