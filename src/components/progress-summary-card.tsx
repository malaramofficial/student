
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type MockTestResult = {
  score: number;
  total: number;
};

type WrittenExamResult = {
  obtainedMarks: number;
  totalMarks: number;
};

export function ProgressSummaryCard() {
  const [overallPercentage, setOverallPercentage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This code runs only on the client
    setIsLoading(true);
    try {
      const mockTestResults: MockTestResult[] = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
      const writtenExamResults: WrittenExamResult[] = JSON.parse(localStorage.getItem('writtenExamResults') || '[]');

      let totalObtained = 0;
      let totalPossible = 0;

      mockTestResults.forEach(result => {
        totalObtained += result.score;
        totalPossible += result.total;
      });

      writtenExamResults.forEach(result => {
        totalObtained += result.obtainedMarks;
        totalPossible += result.totalMarks;
      });

      if (totalPossible > 0) {
        setOverallPercentage(Math.round((totalObtained / totalPossible) * 100));
      } else {
        setOverallPercentage(0);
      }
    } catch (error) {
      console.error("Failed to parse progress data from localStorage", error);
      setOverallPercentage(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Link href="/progress-tracker" className="group lg:col-span-2">
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
          <div>
            <CardTitle className="font-headline text-xl">समग्र प्रगति</CardTitle>
            <CardDescription>सभी परीक्षाओं में आपका संयुक्त प्रदर्शन।</CardDescription>
          </div>
          <div className="relative h-32 w-32">
            {isLoading ? (
                <Skeleton className="h-32 w-32 rounded-full" />
            ) : (
                <>
                <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-muted/30" strokeWidth="2"></circle>
                    <g className="origin-center -rotate-90 transform">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-primary" strokeWidth="2" strokeDasharray={`${overallPercentage}, 100`}></circle>
                    </g>
                </svg>
                <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                    <span className="text-center text-3xl font-bold text-foreground">{overallPercentage}%</span>
                </div>
                </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
