"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import questionsData from './questions.json';
import { Book, CheckCircle, Clock, Percent, XCircle } from 'lucide-react';

type Question = {
  question: string;
  options: string[];
  answer: string;
};

type Subject = {
  subject: string;
  questions: Question[];
};

type TestResult = {
  subject: string;
  score: number;
  total: number;
  date: string;
};

const subjects: Subject[] = questionsData.subjects;

export default function MockTestsPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (selectedSubject) {
      setSelectedOption(userAnswers[currentQuestionIndex] || '');
    }
  }, [currentQuestionIndex, selectedSubject, userAnswers]);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(subject.questions.length).fill(''));
    setResult(null);
  };

  const handleNext = () => {
    if (selectedSubject && currentQuestionIndex < selectedSubject.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedOption(value);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!selectedSubject) return;

    let score = 0;
    selectedSubject.questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        score++;
      }
    });

    const newResult = {
      subject: selectedSubject.subject,
      score: score,
      total: selectedSubject.questions.length,
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
  };

  if (result) {
    return (
      <div className="flex justify-center items-center p-4 min-h-[80vh]">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Test Result: {result.subject}</CardTitle>
            <CardDescription>Here's how you performed.</CardDescription>
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
              <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Correct</p><p className="text-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="text-green-500"/>{result.score}</p></div>
              <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Incorrect</p><p className="text-2xl font-bold flex items-center justify-center gap-2"><XCircle className="text-red-500"/>{result.total - result.score}</p></div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetTest} className="w-full">Take Another Test</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold">Choose a Subject</h1>
            <p className="text-muted-foreground">Select a test to start evaluating your skills.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((s) => (
            <Card key={s.subject} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">{s.subject}</CardTitle>
                <Book className="w-6 h-6 text-primary"/>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.questions.length} questions to test your knowledge.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSelectSubject(s)} className="w-full">Start Test</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = selectedSubject.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedSubject.questions.length) * 100;

  return (
    <div className="flex justify-center items-center p-4 min-h-[80vh]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{selectedSubject.subject} Test</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {selectedSubject.questions.length}</CardDescription>
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
          <Button variant="outline" onClick={() => setSelectedSubject(null)}>Change Subject</Button>
          {currentQuestionIndex < selectedSubject.questions.length - 1 ? (
            <Button onClick={handleNext} disabled={!selectedOption}>Next Question</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!selectedOption}>Finish & See Results</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
