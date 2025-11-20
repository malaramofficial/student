
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBoardResult } from '@/lib/actions';

type SubjectResult = {
  subject: string;
  theory: number;
  practical: number;
  total: number;
  grade: string;
};

type StudentResult = {
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  school: string;
  results: SubjectResult[];
  overallTotal: number;
  finalResult: string;
};

export default function ResultsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StudentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (formData: FormData) => {
    const rollNumber = formData.get('rollNumber') as string;
     if (!rollNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'अमान्य इनपुट',
        description: 'कृपया अपना रोल नंबर दर्ज करें।',
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setError(null);

    const response = await getBoardResult(formData);

    if (response.success && response.data) {
        setResult(response.data as StudentResult);
    } else {
        setError(response.error);
        toast({
            variant: "destructive",
            title: "खोज विफल",
            description: response.error,
        });
    }
    setIsLoading(false);
  };

  const handleNewSearch = () => {
    setResult(null);
    setError(null);
  }

  if (result) {
    return (
      <div className="p-4 md:p-8 flex justify-center">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center bg-muted/50 p-6">
            <CardTitle className="font-headline text-2xl text-primary">माध्यमिक शिक्षा बोर्ड, राजस्थान</CardTitle>
            <CardDescription>उच्च माध्यमिक परीक्षा परिणाम - 2024</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm border-b pb-4">
              <div><span className="font-semibold">रोल नंबर:</span> {result.rollNumber}</div>
              <div><span className="font-semibold">नाम:</span> {result.name}</div>
              <div><span className="font-semibold">पिता का नाम:</span> {result.fatherName}</div>
              <div><span className="font-semibold">माता का नाम:</span> {result.motherName}</div>
              <div className="col-span-2 md:col-span-4"><span className="font-semibold">विद्यालय:</span> {result.school}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>विषय</TableHead>
                  <TableHead className="text-right">थ्योरी</TableHead>
                  <TableHead className="text-right">प्रैक्टिकल</TableHead>
                  <TableHead className="text-right">कुल</TableHead>
                  <TableHead>ग्रेड</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.results.map((res) => (
                  <TableRow key={res.subject}>
                    <TableCell className="font-medium">{res.subject}</TableCell>
                    <TableCell className="text-right">{res.theory}</TableCell>
                    <TableCell className="text-right">{res.practical}</TableCell>
                    <TableCell className="text-right font-semibold">{res.total}</TableCell>
                    <TableCell>{res.grade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 flex justify-between items-center bg-primary text-primary-foreground p-4 rounded-lg">
                <div className="font-bold">कुल योग: {result.overallTotal}</div>
                <div className={`font-bold text-lg px-4 py-1 rounded-md ${result.finalResult === 'PASS' ? 'bg-green-500' : 'bg-red-500'}`}>{result.finalResult}</div>
            </div>
          </CardContent>
           <CardFooter>
            <Button onClick={handleNewSearch} className="w-full md:w-auto mx-auto">
              <Search className="mr-2 h-4 w-4" /> नया परिणाम खोजें
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md">
       <form action={handleSearch}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">परीक्षा परिणाम देखें</CardTitle>
          <CardDescription>
            कृपया अपना बोर्ड रोल नंबर दर्ज करें और अपना परिणाम प्राप्त करने के लिए खोजें।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roll-number">रोल नंबर</Label>
            <Input
              id="roll-number"
              name="rollNumber"
              placeholder="उदा. 2400001"
              disabled={isLoading}
              required
            />
          </div>
          {error && (
            <div className="text-center text-red-500 text-sm">
                {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'खोज रहा है...' : 'परिणाम खोजें'}
          </Button>
        </CardFooter>
       </form>
      </Card>
    </div>
  );
}

