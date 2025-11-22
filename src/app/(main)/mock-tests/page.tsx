
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import questionsData from '../../mock-tests/questions.json';
import syllabusData from '../../syllabus/syllabus-data.json';

type Question = {
  question: string;
  options: string[];
  answer: string;
};

type Subject = {
  name: string;
  questions: Question[];
};

const subjects: Subject[] = questionsData.subjects;
const streams = syllabusData.streams;

export default function MockTestsPage() {
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStartTest = () => {
    if (selectedSubject) {
      setUserAnswers(
        new Array(
          subjects.find((s) => s.name === selectedSubject)?.questions.length || 0
        ).fill('')
      );
      setCurrentQuestionIndex(0);
      setScore(null);
      setTestStarted(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (
      currentQuestionIndex <
      (subjects.find((s) => s.name === selectedSubject)?.questions.length ||
        1) -
        1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitTest = () => {
    const subjectQuestions = subjects.find(
      (s) => s.name === selectedSubject
    )?.questions;
    if (subjectQuestions) {
      let correctAnswers = 0;
      subjectQuestions.forEach((q, index) => {
        if (q.answer === userAnswers[index]) {
          correctAnswers++;
        }
      });
      setScore((correctAnswers / subjectQuestions.length) * 100);
    }
  };

  const handleRestartTest = () => {
    setTestStarted(false);
    setSelectedSubject('');
    setSelectedStream('');
    setScore(null);
  };

  if (!isClient) return null;

  const currentQuestions = subjects.find(
    (s) => s.name === selectedSubject
  )?.questions;
  const currentQuestion = currentQuestions
    ? currentQuestions[currentQuestionIndex]
    : null;

  const availableSubjects =
    streams.find((s) => s.name === selectedStream)?.subjects || [];

  return (
    <div className="flex justify-center items-start p-4 min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
        <CardHeader>
          <CardTitle>मॉक टेस्ट</CardTitle>
          <CardDescription>
            अपनी परीक्षा की तैयारी का मूल्यांकन करें।
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!testStarted ? (
            <div className="space-y-4">
              <div>
                <Label>स्ट्रीम चुनें</Label>
                <Select
                  value={selectedStream}
                  onValueChange={(value) => {
                    setSelectedStream(value);
                    setSelectedSubject('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="एक स्ट्रीम चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {streams.map((stream) => (
                      <SelectItem key={stream.name} value={stream.name}>
                        {stream.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedStream && (
                <div>
                  <Label>विषय चुनें</Label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="एक विषय चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject.name} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{selectedSubject}</h3>
                <p className="text-sm text-muted-foreground">
                  प्रश्न {currentQuestionIndex + 1} / {currentQuestions?.length}
                </p>
              </div>
              <Progress
                value={
                  ((currentQuestionIndex + 1) /
                    (currentQuestions?.length || 1)) *
                  100
                }
              />
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="font-semibold text-lg">
                  {currentQuestion.question}
                </p>
              </div>
              <RadioGroup
                value={userAnswers[currentQuestionIndex]}
                onValueChange={handleAnswerSelect}
                className="space-y-2"
              >
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!testStarted ? (
            <Button onClick={handleStartTest} disabled={!selectedSubject}>
              टेस्ट शुरू करें
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                पिछला
              </Button>
              {currentQuestionIndex ===
              (currentQuestions?.length || 1) - 1 ? (
                <Button onClick={handleSubmitTest}>टेस्ट जमा करें</Button>
              ) : (
                <Button onClick={handleNext}>अगला</Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={score !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {score !== null && score >= 33 ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )}
              टेस्ट का परिणाम
            </AlertDialogTitle>
            <AlertDialogDescription>
              {score !== null && (
                <div className="text-center p-4">
                  <p className="text-lg">आपका स्कोर है:</p>
                  <p
                    className={`text-4xl font-bold ${
                      score >= 33 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {score.toFixed(2)}%
                  </p>
                  <p
                    className={`mt-2 font-semibold ${
                      score >= 33 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {score >= 33 ? 'बधाई हो, आप पास हैं!' : 'और मेहनत करें'}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRestartTest}>
              नया टेस्ट शुरू करें
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
