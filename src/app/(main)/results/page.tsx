
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import resultsData from './mock-results.json';

type ResultDetail = {
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
  results: ResultDetail[];
  overallTotal: number;
  finalResult: string;
};

export default function ResultsPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [studentResult, setStudentResult] = useState<StudentResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!rollNumber) {
      toast({
        variant: 'destructive',
        title: 'त्रुटि',
        description: 'कृपया अपना रोल नंबर दर्ज करें।',
      });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const result = resultsData.results.find(
        (r) => r.rollNumber === rollNumber
      );
      if (result) {
        setStudentResult(result);
        toast({
          title: 'परिणाम मिला',
          description: 'आपका परिणाम नीचे प्रदर्शित है।',
        });
      } else {
        setStudentResult(null);
        toast({
          variant: 'destructive',
          title: 'परिणाम नहीं मिला',
          description: 'इस रोल नंबर के लिए कोई परिणाम नहीं मिला।',
        });
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-4xl mx-auto bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
        <CardHeader>
          <CardTitle>कक्षा 12 परिणाम</CardTitle>
          <CardDescription>
            अपना रोल नंबर दर्ज करें और अपना परिणाम देखें।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Label htmlFor="roll-number">रोल नंबर</Label>
              <Input
                id="roll-number"
                placeholder="उदा. 2400001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} className="self-end">
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? 'खोज रहा है...' : 'खोजें'}
            </Button>
          </div>

          {studentResult && (
            <div className="border border-border rounded-lg p-4" id="result-card">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg">
                  माध्यमिक शिक्षा बोर्ड, राजस्थान
                </h3>
                <p>उच्च माध्यमिक परीक्षा परिणाम - 2024</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                <p>
                  <strong>रोल नंबर:</strong> {studentResult.rollNumber}
                </p>
                <p>
                  <strong>नाम:</strong> {studentResult.name}
                </p>
                <p>
                  <strong>पिता का नाम:</strong> {studentResult.fatherName}
                </p>
                <p>
                  <strong>माता का नाम:</strong> {studentResult.motherName}
                </p>
                <p className="col-span-2">
                  <strong>स्कूल:</strong> {studentResult.school}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>विषय</TableHead>
                    <TableHead className="text-right">थ्योरी</TableHead>
                    <TableHead className="text-right">प्रैक्टिकल</TableHead>
                    <TableHead className="text-right">कुल</TableHead>
                    <TableHead className="text-right">ग्रेड</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResult.results.map((res, index) => (
                    <TableRow key={index}>
                      <TableCell>{res.subject}</TableCell>
                      <TableCell className="text-right">{res.theory || '-'}</TableCell>
                      <TableCell className="text-right">{res.practical || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">{res.total}</TableCell>
                      <TableCell className="text-right">{res.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between items-center font-bold">
                 <p>कुल योग: {studentResult.overallTotal}</p>
                 <p>अंतिम परिणाम: <span className={studentResult.finalResult === 'PASS' ? 'text-green-500' : 'text-red-500'}>{studentResult.finalResult}</span></p>
              </div>
            </div>
          )}
        </CardContent>
         {studentResult && (
            <CardFooter className="justify-end gap-2">
                 <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    प्रिंट करें
                 </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
