"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type TestResult = {
  subject: string;
  score: number;
  total: number;
  date: string;
};

type ChartData = {
  subject: string;
  score: number;
  averageScore: number;
};

export default function ProgressTrackerPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const storedResults = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
    setResults(storedResults);

    if (storedResults.length > 0) {
      const subjectScores: { [key: string]: { scores: number[], count: number } } = {};

      storedResults.forEach((result: TestResult) => {
        if (!subjectScores[result.subject]) {
          subjectScores[result.subject] = { scores: [], count: 0 };
        }
        const percentage = (result.score / result.total) * 100;
        subjectScores[result.subject].scores.push(percentage);
        subjectScores[result.subject].count++;
      });

      const aggregatedData = Object.keys(subjectScores).map(subject => {
        const lastScore = subjectScores[subject].scores[subjectScores[subject].scores.length - 1];
        const avg = subjectScores[subject].scores.reduce((a, b) => a + b, 0) / subjectScores[subject].count;
        return {
          subject: subject,
          score: Math.round(lastScore),
          averageScore: Math.round(avg),
        };
      });
      setChartData(aggregatedData);
    }
  }, []);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4 min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline">दिखाने के लिए कोई प्रगति नहीं है</CardTitle>
            <CardDescription>
              अपनी प्रगति को ट्रैक करना शुरू करने के लिए एक मॉक टेस्ट पूरा करें। आपके परिणाम यहां दिखाई देंगे।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mock-tests">
              <Button>मॉक टेस्ट दें</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">आपके प्रदर्शन का अवलोकन</CardTitle>
          <CardDescription>
            यह चार्ट प्रत्येक विषय में आपके औसत स्कोर की तुलना में आपका नवीनतम स्कोर दिखाता है।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
