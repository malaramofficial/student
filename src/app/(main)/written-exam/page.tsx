
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
import questionsData from '../../written-exam/written-questions.json';
import syllabusData from '../../syllabus/syllabus-data.json';
import { FileText, Loader2, BookCheck, ClipboardPaste, Clock, Sparkles } from 'lucide-react';
import { evaluateAnswersAction, generatePaperAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

type Question = {
  question: string;
  marks: number;
};

type Section = {
  name: string;
  description?: string;
  questions: Question[];
};

type Subject = {
  name: string;
  sections: Section[];
};

type Answer = {
  question: string;
  answer: string;
  marks: number;
};

type EvaluationResult = {
  question: string;
  answer: string;
  marksAwarded: number;
  feedback: string;
};

type Marksheet = {
  results: EvaluationResult[];
  totalAwardedMarks: number;
  totalMarks: number;
  overallFeedback: string;
};

const subjects: Subject[] = questionsData.subjects;
const streams = syllabusData.streams;

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to get a random subset of questions from each section
const getRandomizedQuestions = (subjectData: Subject) => {
    const questionLimits: { [key: string]: number } = {
        "खंड अ": 8, // अतिलघुरात्मक
        "खंड ब": 5, // लघु उत्तरात्मक
        "खंड स": 2, // दीर्घ उत्तरीय
        "खंड द": 1, // निबंधात्मक
    };

    const randomizedSections = subjectData.sections.map(section => {
        const limit = questionLimits[section.name.split(' ')[0]] || section.questions.length;
        const shuffledQuestions = shuffleArray([...section.questions]);
        const selectedQuestions = shuffledQuestions.slice(0, limit);
        return {
            ...section,
            questions: selectedQuestions,
        };
    });

    const allQuestions = randomizedSections.flatMap(section => 
        section.questions.map(q => ({
            question: q.question,
            answer: '',
            marks: q.marks
        }))
    );
    
    return { allQuestions, randomizedSections };
}


export default function WrittenExamPage() {
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [testStarted, setTestStarted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [marksheet, setMarksheet] = useState<Marksheet | null>(null);
  const [currentTestSections, setCurrentTestSections] = useState<Section[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const startTestWithPaper = (paper: { sections: Section[] }) => {
    const allQuestions = paper.sections.flatMap(section => 
        section.questions.map(q => ({
            question: q.question,
            answer: '',
            marks: q.marks
        }))
    );
    setAnswers(allQuestions);
    setCurrentTestSections(paper.sections);
    setTestStarted(true);
    setMarksheet(null);
  };

  const handleStartTest = () => {
    if (selectedSubject) {
      const currentSubjectData = subjects.find(
        (s) => s.name === selectedSubject
      );
      if (currentSubjectData && currentSubjectData.sections) {
        const { randomizedSections } = getRandomizedQuestions(currentSubjectData);
        startTestWithPaper({ sections: randomizedSections });
      }
    }
  };

  const handleGenerateAIPaper = async () => {
    if (!selectedSubject || !selectedStream) return;

    setIsLoading(true);
    setLoadingMessage('AI आपके लिए एक नया प्रश्न पत्र तैयार कर रहा है...');

    const response = await generatePaperAction({ subject: selectedSubject, stream: selectedStream });
    
    if (response.success && response.data) {
        startTestWithPaper(response.data);
        toast({
            title: "AI ने पेपर बना दिया है!",
            description: "आपकी परीक्षा अब शुरू हो सकती है।"
        })
    } else {
        toast({
            variant: "destructive",
            title: "AI पेपर बनाने में विफल रहा",
            description: response.error || "कृपया कुछ देर बाद पुनः प्रयास करें।"
        });
    }
    setIsLoading(false);
    setLoadingMessage('');
  }
  
  const handleAnswerChange = (question: string, value: string) => {
    const newAnswers = answers.map(a => 
        a.question === question ? { ...a, answer: value } : a
    );
    setAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
      if (answers.some(a => !a.answer.trim())) {
        toast({
            variant: "destructive",
            title: "अधूरे उत्तर",
            description: "कृपया परीक्षा जमा करने से पहले सभी प्रश्नों के उत्तर दें।"
        });
        return;
      }
      setIsLoading(true);
      setLoadingMessage('AI आपके उत्तरों की जाँच कर रहा है... कृपया प्रतीक्षा करें।');
      const response = await evaluateAnswersAction({ answers });
      if(response.success && response.data) {
        setMarksheet(response.data);
        setTestStarted(false); // To show marksheet view
      } else {
        toast({
            variant: "destructive",
            title: "मूल्यांकन विफल",
            description: response.error || "उत्तरों का मूल्यांकन करते समय एक त्रुटि हुई।"
        });
      }
      setIsLoading(false);
      setLoadingMessage('');
  }

  const handleRestartTest = () => {
      setTestStarted(false);
      setSelectedStream('');
      setSelectedSubject('');
      setMarksheet(null);
      setAnswers([]);
      setCurrentTestSections([]);
  }

  if (!isClient) return null;
  
  const availableSubjects =
    streams.find((s) => s.name === selectedStream)?.subjects || [];
  
  const totalMarks = answers.reduce((acc, a) => acc + a.marks, 0);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-4 justify-center items-center h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">{loadingMessage}</p>
        </div>
    )
  }

  if (marksheet) {
    return (
         <div className="flex justify-center items-start p-4 md:p-8 min-h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-4xl bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookCheck /> परीक्षा परिणाम: {selectedSubject}</CardTitle>
                    <CardDescription>AI द्वारा आपके उत्तरों का विस्तृत मूल्यांकन।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <h3 className="text-xl font-bold">कुल अंक: {marksheet.totalAwardedMarks} / {marksheet.totalMarks}</h3>
                         <p className="mt-2 text-muted-foreground font-semibold">समग्र प्रतिक्रिया: <span className="text-foreground">{marksheet.overallFeedback}</span></p>
                    </div>
                    {marksheet.results.map((result, index) => (
                        <div key={index} className="border-b border-border pb-4 last:border-b-0">
                            <p className="font-semibold">प्रश्न {index + 1}: {result.question}</p>
                            <div className="mt-2 p-3 bg-muted/30 rounded-md">
                               <p className="font-semibold text-sm text-muted-foreground">आपका उत्तर:</p>
                               <p className="text-sm whitespace-pre-wrap">{result.answer || "(उत्तर नहीं दिया गया)"}</p>
                            </div>
                            <div className="mt-3 p-3 bg-blue-900/20 rounded-md">
                                <p className="font-semibold text-sm text-primary">AI प्रतिक्रिया:</p>
                                <p className="text-sm">{result.feedback}</p>
                                <p className="text-right font-bold text-secondary mt-2">दिए गए अंक: {result.marksAwarded}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="justify-center">
                     <Button onClick={handleRestartTest} variant="secondary">नई परीक्षा शुरू करें</Button>
                </CardFooter>
            </Card>
         </div>
    )
  }

  return (
    <div className="flex justify-center items-start p-4 md:p-6 min-h-[calc(100vh-8rem)]">
      {!testStarted ? (
         <Card className="w-full max-w-2xl bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText />लिखित परीक्षा</CardTitle>
            <CardDescription>
                लंबे उत्तर वाले प्रश्नों के उत्तर लिखकर अपनी तैयारी का अभ्यास करें। यह बोर्ड परीक्षा के पैटर्न पर आधारित है।
            </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                <Button onClick={handleStartTest} disabled={!selectedSubject}>
                    अभ्यास शुरू करें
                </Button>
                <span className="text-xs text-muted-foreground">या</span>
                <Button onClick={handleGenerateAIPaper} disabled={!selectedSubject} variant="secondary">
                   <Sparkles className="mr-2 h-4 w-4" />
                    AI से पेपर बनवाएं
                </Button>
            </CardFooter>
         </Card>
      ) : currentTestSections.length > 0 ? (
        <div className="w-full max-w-4xl border-2 border-dashed border-border p-4 sm:p-6 md:p-8 rounded-lg bg-card">
            {/* Exam Header */}
            <div className="text-center border-b-2 border-border pb-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">माध्यमिक शिक्षा बोर्ड, राजस्थान</h2>
                <h3 className="text-lg sm:text-xl font-semibold">उच्च माध्यमिक परीक्षा - 2024 (अभ्यास)</h3>
            </div>
            <div className="flex justify-between items-center text-sm font-medium mb-6">
                <span className="font-bold">विषय: {selectedSubject}</span>
                <div className="flex items-center gap-4">
                    <span>पूर्णांक: {totalMarks}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> समय: 3 घंटे 15 मिनट</span>
                </div>
            </div>

            {/* Instructions */}
            <div className="mb-8 p-3 bg-muted/50 rounded-md">
                <h4 className="font-bold mb-2 flex items-center gap-2"><ClipboardPaste className="w-4 h-4" /> परीक्षार्थियों के लिए सामान्य निर्देश:</h4>
                <ol className="list-decimal list-inside text-xs space-y-1 text-muted-foreground">
                    <li>सभी प्रश्न अनिवार्य हैं।</li>
                    <li>प्रत्येक प्रश्न के अंक उसके सामने अंकित हैं।</li>
                    <li>अपना उत्तर निर्धारित स्थान पर ही लिखें।</li>
                </ol>
            </div>

            {/* Questions by Section */}
            <div className="space-y-8">
              {currentTestSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-lg font-bold border-b-2 border-primary mb-4 pb-2">{section.name}</h3>
                  {section.description && <p className="text-sm text-muted-foreground mb-4">{section.description}</p>}
                  <div className="space-y-8">
                    {section.questions.map((q, qIndex) => {
                        const answer = answers.find(a => a.question === q.question);
                        return (
                            <div key={qIndex} className="space-y-3 border-t border-border/50 pt-6">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-semibold text-base">
                                        प्रश्न {answers.findIndex(a => a.question === q.question) + 1}: {q.question}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium shrink-0 ml-4">({q.marks} अंक)</p>
                                </div>
                                <Textarea 
                                    placeholder="अपना उत्तर यहाँ लिखें..." 
                                    className="min-h-[150px] bg-transparent focus:bg-muted/30"
                                    value={answer?.answer || ''}
                                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                />
                            </div>
                        );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer and Submit button */}
            <div className="flex justify-center mt-8 pt-6 border-t-2 border-dashed border-border">
                <div className="flex gap-4">
                    <Button onClick={handleRestartTest} variant="destructive">
                        अभ्यास समाप्त करें
                    </Button>
                    <Button onClick={handleSubmitExam} >
                        परीक्षा जमा करें
                    </Button>
                </div>
            </div>
        </div>
      ) : (
         <p className="text-center text-muted-foreground">इस विषय के लिए कोई प्रश्न उपलब्ध नहीं है।</p>
      )}
    </div>
  );
}

    
