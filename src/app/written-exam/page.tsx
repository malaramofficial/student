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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import questionsData from './written-questions.json';
import syllabusData from '../syllabus/syllabus-data.json';
import { FileText } from 'lucide-react';

type Question = {
  question: string;
};

type Subject = {
  name: string;
  questions: Question[];
};

const subjects: Subject[] = questionsData.subjects;
const streams = syllabusData.streams;

export default function WrittenExamPage() {
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [testStarted, setTestStarted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStartTest = () => {
    if (selectedSubject) {
      setTestStarted(true);
    }
  };
  
  const handleEndTest = () => {
      setTestStarted(false);
      setSelectedStream('');
      setSelectedSubject('');
  }

  if (!isClient) return null;

  const currentQuestions = subjects.find(
    (s) => s.name === selectedSubject
  )?.questions;
  
  const availableSubjects =
    streams.find((s) => s.name === selectedStream)?.subjects || [];

  return (
    <div className="flex justify-center items-start p-4 min-h-[calc(100vh-56px)] animate-fade-in-up">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText />लिखित परीक्षा</CardTitle>
          <CardDescription>
            लंबे उत्तर वाले प्रश्नों के उत्तर लिखकर अपनी तैयारी का अभ्यास करें।
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!testStarted ? (
            <div className="space-y-4 max-w-sm mx-auto">
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
                        subjects.some(s => s.name === subject.name) && (
                            <SelectItem key={subject.name} value={subject.name}>
                                {subject.name}
                            </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : currentQuestions && currentQuestions.length > 0 ? (
            <div className="space-y-8">
               <h3 className="text-xl font-semibold text-center">{selectedSubject}</h3>
              {currentQuestions.map((q, index) => (
                <div key={index} className="space-y-3">
                  <p className="font-semibold text-base">
                    प्रश्न {index + 1}: {q.question}
                  </p>
                  <Textarea placeholder="अपना उत्तर यहाँ लिखें..." className="min-h-[120px]"/>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground">इस विषय के लिए कोई प्रश्न उपलब्ध नहीं है।</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!testStarted ? (
            <Button onClick={handleStartTest} disabled={!selectedSubject}>
              अभ्यास शुरू करें
            </Button>
          ) : (
            <Button onClick={handleEndTest} variant="destructive">
              अभ्यास समाप्त करें
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
