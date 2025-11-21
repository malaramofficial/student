
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

type MockTestResult = {
  subject: string;
  score: number;
  total: number;
  date: string;
};

type WrittenExamResult = {
  subject: string;
  obtainedMarks: number;
  totalMarks: number;
  date: string;
};

type ChartData = {
  subject: string;
  score: number;
  averageScore: number;
};

export default function ProgressTrackerPage() {
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([]);
  const [writtenExamResults, setWrittenExamResults] = useState<WrittenExamResult[]>([]);
  const [mockTestChartData, setMockTestChartData] = useState<ChartData[]>([]);
  const [writtenExamChartData, setWrittenExamChartData] = useState<ChartData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    const storedMockResults = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
    const storedWrittenResults = JSON.parse(localStorage.getItem('writtenExamResults') || '[]');
    
    setMockTestResults(storedMockResults);
    setWrittenExamResults(storedWrittenResults);

    if (storedMockResults.length > 0) {
      const subjectScores: { [key: string]: { scores: number[], count: number } } = {};
      storedMockResults.forEach((result: MockTestResult) => {
        if (!subjectScores[result.subject]) {
          subjectScores[result.subject] = { scores: [], count: 0 };
        }
        const percentage = (result.score / result.total) * 100;
        subjectScores[result.subject].scores.push(percentage);
        subjectScores[result.subject].count++;
      });
      const aggregatedData = Object.keys(subjectScores).map(subject => ({
        subject: subject,
        score: Math.round(subjectScores[subject].scores[subjectScores[subject].scores.length - 1]),
        averageScore: Math.round(subjectScores[subject].scores.reduce((a, b) => a + b, 0) / subjectScores[subject].count),
      }));
      setMockTestChartData(aggregatedData);
    } else {
        setMockTestChartData([]);
    }
    
    if (storedWrittenResults.length > 0) {
      const subjectScores: { [key: string]: { scores: number[], count: number } } = {};
      storedWrittenResults.forEach((result: WrittenExamResult) => {
        if (!subjectScores[result.subject]) {
          subjectScores[result.subject] = { scores: [], count: 0 };
        }
        const percentage = (result.obtainedMarks / result.totalMarks) * 100;
        subjectScores[result.subject].scores.push(percentage);
        subjectScores[result.subject].count++;
      });
      const aggregatedData = Object.keys(subjectScores).map(subject => ({
        subject: subject,
        score: Math.round(subjectScores[subject].scores[subjectScores[subject].scores.length - 1]),
        averageScore: Math.round(subjectScores[subject].scores.reduce((a, b) => a + b, 0) / subjectScores[subject].count),
      }));
      setWrittenExamChartData(aggregatedData);
    } else {
        setWrittenExamChartData([]);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
  }, []);
  
  const handleResetProgress = () => {
    localStorage.removeItem('mockTestResults');
    localStorage.removeItem('writtenExamResults');
    localStorage.removeItem('studentName');
    loadData();
    toast({
      title: 'प्रगति रीसेट',
      description: 'आपकी सभी प्रगति सफलतापूर्वक हटा दी गई है।',
    });
    // Optional: force a reload to re-trigger name prompt on home page
    setTimeout(() => window.location.href = '/', 500);
  };


  if (!isClient) {
    return null; // Don't render server-side
  }

  if (mockTestResults.length === 0 && writtenExamResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4 min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline">दिखाने के लिए कोई प्रगति नहीं है</CardTitle>
            <CardDescription>
              अपनी प्रगति को ट्रैक करना शुरू करने के लिए एक मॉक टेस्ट या लिखित परीक्षा पूरी करें। आपके परिणाम यहां दिखाई देंगे।
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/mock-tests">
              <Button className="w-full">मॉक टेस्ट दें</Button>
            </Link>
             <Link href="/written-exam">
              <Button className="w-full" variant="outline">लिखित परीक्षा दें</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderChart = (data: ChartData[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        <CardDescription>
          यह चार्ट प्रत्येक विषय में आपके औसत स्कोर की तुलना में आपका नवीनतम स्कोर दिखाता है।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<ChartTooltipContent />}
                />
                <Legend />
                <Bar dataKey="score" name="नवीनतम स्कोर" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="averageScore" name="औसत स्कोर" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              इस परीक्षा प्रकार के लिए कोई डेटा उपलब्ध नहीं है।
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-end mb-4">
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                प्रगति रीसेट करें
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>क्या आप निश्चित हैं?</AlertDialogTitle>
                <AlertDialogDescription>
                    यह क्रिया आपके सभी सहेजे गए परीक्षा परिणामों और प्रगति डेटा को स्थायी रूप से हटा देगी। आप इस क्रिया को पूर्ववत नहीं कर सकते।
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>रद्द करें</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetProgress}>जारी रखें</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
      <Tabs defaultValue="mock-tests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mock-tests">मॉक टेस्ट</TabsTrigger>
          <TabsTrigger value="written-exams">लिखित परीक्षा</TabsTrigger>
        </TabsList>
        <TabsContent value="mock-tests" className="mt-6">
          {renderChart(mockTestChartData, 'मॉक टेस्ट प्रदर्शन')}
        </TabsContent>
        <TabsContent value="written-exams" className="mt-6">
          {renderChart(writtenExamChartData, 'लिखित परीक्षा प्रदर्शन')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
