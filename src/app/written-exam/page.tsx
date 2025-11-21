'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Book,
  FileText,
  Loader2,
  Pencil,
  Sparkles,
  Award,
  BookCheck,
} from 'lucide-react';
import { generateWrittenExam, evaluateWrittenExam } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { type GenerateWrittenExamOutput } from '@/ai/flows/generate-written-exam';
import { type EvaluateWrittenExamOutput } from '@/ai/flows/evaluate-written-exam';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const subjects = [
  'गणित',
  'विज्ञान',
  'इतिहास',
  'भौतिक विज्ञान',
  'रसायन विज्ञान',
  'जीव विज्ञान',
  'लेखाशास्त्र',
  'व्यवसाय अध्ययन',
  'अर्थशास्त्र',
  'राजनीति विज्ञान',
  'हिन्दी साहित्य',
  'भूगोल',
  'समाजशास्त्र',
  'अंग्रेजी साहित्य',
];

type QuestionState = {
  question: string;
  type: 'short' | 'long' | 'essay';
  marks: number;
  answer: string;
};

type WrittenExamResult = {
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  date: string;
};

export default function WrittenExamPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [exam, setExam] = useState<GenerateWrittenExamOutput | null>(null);
  const [questionsState, setQuestionsState] = useState<QuestionState[]>([]);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluateWrittenExamOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { toast } = useToast();

  const handleSelectSubject = async (subject: string) => {
    setSelectedSubject(subject);
    setIsLoading(true);
    setExam(null);
    setEvaluationResult(null);

    try {
      const response = await generateWrittenExam({ subject });
      if (response.success && response.exam) {
        setExam(response.exam);
        setQuestionsState(
          response.exam.questions.map((q) => ({ ...q, answer: '' }))
        );
      } else {
        toast({
          variant: 'destructive',
          title: 'परीक्षा बनाने में विफल',
          description: response.error || 'AI से प्रश्न प्राप्त करने में विफल रहा।',
        });
        setSelectedSubject(null);
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'एक त्रुटि हुई',
        description: 'परीक्षा उत्पन्न करते समय एक अप्रत्याशित त्रुटि हुई।',
      });
      setSelectedSubject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newQuestionsState = [...questionsState];
    newQuestionsState[index].answer = answer;
    setQuestionsState(newQuestionsState);
  };

  const handleSubmit = async () => {
    if (questionsState.some((q) => !q.answer.trim())) {
      toast({
        variant: 'destructive',
        title: 'अधूरा प्रयास',
        description: 'कृपया सबमिट करने से पहले सभी प्रश्नों के उत्तर दें।',
      });
      return;
    }
    setIsEvaluating(true);
    setEvaluationResult(null);
    try {
      const payload = {
        subject: selectedSubject!,
        questions: questionsState.map((q) => ({
          question: q.question,
          marks: q.marks,
          answer: q.answer,
        })),
      };
      const response = await evaluateWrittenExam(payload);
      if (response.success && response.evaluation) {
        setEvaluationResult(response.evaluation);
        toast({
          title: 'मूल्यांकन पूर्ण',
          description: 'AI ने आपकी कॉपी जाँच ली है।',
        });
         // Store result in localStorage
        const newResult: WrittenExamResult = {
          subject: selectedSubject!,
          totalMarks: response.evaluation.totalMarks,
          obtainedMarks: response.evaluation.obtainedMarks,
          date: new Date().toISOString(),
        };
        const pastResults: WrittenExamResult[] = JSON.parse(localStorage.getItem('writtenExamResults') || '[]');
        localStorage.setItem('writtenExamResults', JSON.stringify([...pastResults, newResult]));

      } else {
        toast({
          variant: 'destructive',
          title: 'मूल्यांकन में विफल',
          description: response.error || 'AI उत्तरों का मूल्यांकन करने में विफल रहा।',
        });
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'एक त्रुटि हुई',
        description: 'मूल्यांकन के दौरान एक अप्रत्याशit त्रुटि हुई।',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetTest = () => {
    setSelectedSubject(null);
    setExam(null);
    setEvaluationResult(null);
    setQuestionsState([]);
  };

  if (evaluationResult) {
    return (
      <div className="p-4 md:p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <Award className="mx-auto h-12 w-12 text-yellow-500" />
            <CardTitle className="font-headline text-3xl">परीक्षा परिणाम</CardTitle>
            <CardDescription className="text-lg">{selectedSubject}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-around text-center p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">कुल अंक</p>
                <p className="text-2xl font-bold">{evaluationResult.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">प्राप्तांक</p>
                <p className="text-2xl font-bold text-primary">{evaluationResult.obtainedMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">प्रतिशत</p>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(
                    (evaluationResult.obtainedMarks / evaluationResult.totalMarks) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              {evaluationResult.results.map((result, index) => (
                <div key={index}>
                  <p className="font-semibold">{index + 1}. {result.question}</p>
                  <p className="text-sm text-muted-foreground p-2 bg-slate-100 dark:bg-slate-800 my-2 rounded">
                    आपका उत्तर: {result.userAnswer}
                  </p>
                  <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <BookCheck className="h-4 w-4" /> AI प्रतिक्रिया:
                    </p>
                    <p className="text-sm text-muted-foreground">{result.feedback}</p>
                    <p className="text-sm font-bold mt-2">
                      अंक: {result.awardedMarks} /{' '}
                      {exam!.questions[index].marks}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetTest} className="w-full">
              नई परीक्षा शुरू करें
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (exam) {
    return (
      <div className="p-4 md:p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <FileText className="mx-auto h-10 w-10 text-primary" />
            <CardTitle className="font-headline text-3xl">
              लिखित परीक्षा: {exam.subject}
            </CardTitle>
            <div className="flex justify-center gap-6 text-muted-foreground mt-2">
              <span>कुल अंक: {exam.totalMarks}</span>
              <span>अवधि: {exam.duration}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">निर्देश:</h3>
              <ul className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                {exam.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>
            <Separator />
            <div className="space-y-6">
              {questionsState.map((q, index) => (
                <div key={index} className="space-y-2">
                  <Label
                    htmlFor={`question-${index}`}
                    className="flex justify-between"
                  >
                    <span className="font-semibold">
                      प्रश्न {index + 1}. {q.question}
                    </span>
                    <Badge variant="secondary">{q.marks} अंक</Badge>
                  </Label>
                  <Textarea
                    id={`question-${index}`}
                    value={q.answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="अपना उत्तर यहाँ लिखें..."
                    className="min-h-[120px] text-base"
                    disabled={isEvaluating}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="w-full"
              size="lg"
            >
              {isEvaluating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isEvaluating ? 'कॉपी जाँची जा रही है...' : 'AI से कॉपी जाँच कराएँ'}
            </Button>
            <Button onClick={resetTest} variant="outline">
              परीक्षा रद्द करें
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl font-bold flex items-center justify-center gap-2">
          <Pencil /> लिखित परीक्षा
        </h1>
        <p className="text-muted-foreground">
          AI द्वारा उत्पन्न लिखित परीक्षा के साथ अपने ज्ञान का परीक्षण करें।
        </p>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {selectedSubject} के लिए प्रश्न पत्र तैयार किया जा रहा है...
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((s) => (
            <Card key={s} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">{s}</CardTitle>
                <Book className="w-6 h-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI द्वारा उत्पन्न एक पूर्ण लिखित परीक्षा पत्र।
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSelectSubject(s)} className="w-full">
                  परीक्षा शुरू करें
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
