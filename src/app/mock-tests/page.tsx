
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Book, CheckCircle, Clock, Loader2, Percent, XCircle } from 'lucide-react';
import { generateMockTest } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

type Question = {
  question: string;
  options: string[];
  answer: string;
};

type TestResult = {
  subject: string;
  score: number;
  total: number;
  date: string;
};

const subjects = [
  "गणित", "विज्ञान", "इतिहास", "भौतिक विज्ञान", "रसायन विज्ञान", "जीव विज्ञान", "लेखाशास्त्र", "व्यवसाय अध्ययन", "अर्थशास्त्र", "राजनीति विज्ञान", "हिन्दी साहित्य", "भूगोल", "समाजशास्त्र", "अंग्रेजी साहित्य"
];

export default function MockTestsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectSubject = async (subject: string) => {
    setSelectedSubject(subject);
    setIsLoading(true);
    setResult(null);
    setQuestions([]);
    
    try {
      const response = await generateMockTest({ subject, numQuestions: 5 });
      if (response.success && response.test) {
        setQuestions(response.test.questions);
        setUserAnswers(new Array(response.test.questions.length).fill(''));
        setCurrentQuestionIndex(0);
        setSelectedOption('');
      } else {
        toast({
          variant: "destructive",
          title: "टेस्ट बनाने में विफल",
          description: response.error || "AI से प्रश्न प्राप्त करने में विफल रहा।",
        });
        setSelectedSubject(null);
      }
    } catch (e) {
      toast({
          variant: "destructive",
          title: "एक त्रुटि हुई",
          description: "टेस्ट उत्पन्न करते समय एक अप्रत्याशित त्रुटि हुई।",
        });
      setSelectedSubject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(userAnswers[currentQuestionIndex + 1] || '');
    }
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedOption(value);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        score++;
      }
    });

    const newResult: TestResult = {
      subject: selectedSubject!,
      score: score,
      total: questions.length,
      date: new Date().toISOString(),
    };
    setResult(newResult);

    // Store result in localStorage
    const pastResults: TestResult[] = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
    localStorage.setItem('mockTestResults', JSON.stringify([...pastResults, newResult]));
  };

  const resetTest = () => {
    setSelectedSubject(null);
    setResult(null);
    setQuestions([]);
  };

  if (result) {
    return (
      <div className="flex justify-center items-center p-4 min-h-[80vh]">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">परीक्षा परिणाम: {result.subject}</CardTitle>
            <CardDescription>यहां आपका प्रदर्शन है।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative mx-auto h-40 w-40">
              <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-muted" strokeWidth="2"></circle>
                <g className="origin-center -rotate-90 transform">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-primary" strokeWidth="2" strokeDasharray={`${(result.score / result.total) * 100}, 100`}></circle>
                </g>
              </svg>
              <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <span className="text-center text-3xl font-bold text-foreground">{Math.round((result.score / result.total) * 100)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">सही</p><p className="text-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="text-green-500"/>{result.score}</p></div>
              <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">गलत</p><p className="text-2xl font-bold flex items-center justify-center gap-2"><XCircle className="text-red-500"/>{result.total - result.score}</p></div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetTest} className="w-full">दूसरा विषय चुनें</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!selectedSubject || isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold">एक विषय चुनें</h1>
            <p className="text-muted-foreground">अपने कौशल का मूल्यांकन शुरू करने के लिए एक परीक्षा चुनें।</p>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">{selectedSubject} के लिए प्रश्न तैयार किए जा रहे हैं...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((s) => (
              <Card key={s} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-headline">{s}</CardTitle>
                  <Book className="w-6 h-6 text-primary"/>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">AI द्वारा उत्पन्न 5 प्रश्न।</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSelectSubject(s)} className="w-full">परीक्षा शुरू करें</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex justify-center items-center p-4 min-h-[80vh]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{selectedSubject} परीक्षा</CardTitle>
          <CardDescription>प्रश्न {currentQuestionIndex + 1} / {questions.length}</CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold">{currentQuestion.question}</p>
          <RadioGroup value={selectedOption} onValueChange={handleAnswerSelect}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-accent has-[:checked]:border-accent-foreground">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetTest}>विषय बदलें</Button>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext} disabled={!selectedOption}>अगला प्रश्न</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!selectedOption}>समाप्त करें और परिणाम देखें</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

    