"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getWordOfTheDay } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { BookDashed } from 'lucide-react';

type WordData = {
  word: string;
  meaning: string;
  example: string;
};

export function WordOfTheDayCard() {
  const [data, setData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWord() {
      try {
        setIsLoading(true);
        const result = await getWordOfTheDay();
        if (result.success && result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch word of the day", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWord();
  }, []);

  return (
    <Card className="flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-xl text-primary">आज का शब्द</CardTitle>
          <BookDashed className="w-8 h-8 text-primary/70" />
        </div>
        <CardDescription>हर दिन एक नया शब्द सीखें।</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-headline text-foreground">{data.word}</h3>
            <p className="text-muted-foreground"><span className="font-semibold text-foreground">अर्थ:</span> {data.meaning}</p>
            <p className="text-muted-foreground italic"><span className="font-semibold text-foreground not-italic">उदाहरण:</span> "{data.example}"</p>
          </div>
        ) : (
          <p className="text-muted-foreground">आज का शब्द लोड करने में विफल।</p>
        )}
      </CardContent>
    </Card>
  );
}
