"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BotMessageSquare, FileText, BookCopy, GraduationCap, Speech, Bell, BrainCircuit, Target, FileArchive, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  buttonText: string;
};

const FeatureCard = ({ title, description, icon, path, buttonText }: FeatureCardProps) => {
  const router = useRouter();
  
  const handleNavigation = (path: string) => {
    if (!localStorage.getItem('studentName')) {
      (document.getElementById('name-dialog-trigger') as HTMLButtonElement)?.click();
    } else {
        router.push(path);
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
          <div className="p-2 bg-muted rounded-md">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardFooter>
        <Button onClick={() => handleNavigation(path)} variant="outline" size="sm" className="w-full">
          {buttonText}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function DashboardPage() {
  const [name, setName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('studentName');
    if (storedName) {
      setName(storedName);
    } else {
      setIsDialogOpen(true);
    }
  }, []);

  const handleNameSave = () => {
    if (name.trim()) {
      localStorage.setItem('studentName', name.trim());
      toast({
        title: 'नाम सहेजा गया',
        description: `नमस्ते, ${name.trim()}!`,
      });
      setIsDialogOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'त्रुटि',
        description: 'कृपया अपना नाम दर्ज करें।',
      });
    }
  };
  
  const handleNavigation = (path: string) => {
    if (!localStorage.getItem('studentName')) {
        setIsDialogOpen(true);
        toast({
            variant: 'destructive',
            title: 'आवश्यक जानकारी',
            description: 'कृपया आगे बढ़ने से पहले अपना नाम दर्ज करें।',
        });
    } else {
        router.push(path);
    }
  }

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in-up">
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto grid gap-8">
          
          <div>
            <h1 className="text-3xl font-bold font-headline">👋 नमस्ते, {name || 'छात्र'}!</h1>
          </div>

          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold">आगामी परीक्षा</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              आपकी अगली कक्षा 10 की विज्ञान की परीक्षा 05 दिसंबर को है। तैयारी करते रहें!
            </AlertDescription>
          </Alert>

          <div>
             <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <BrainCircuit className="text-primary" />
                मुख्य उपकरण
             </h2>
             <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl">AI गुरु से पूछें</CardTitle>
                        <CardDescription>अपने सभी शैक्षणिक सवालों का तुरंत जवाब पाएं।</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                         <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <BotMessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Button onClick={() => handleNavigation('/ai-teacher')} size="lg">
                            अभी पूछें
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl">अपनी तैयारी परखें</CardTitle>
                        <CardDescription>नए पैटर्न पर आधारित टेस्ट देकर अपने स्कोर को ट्रैक करें।</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Target className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <Button onClick={() => handleNavigation('/mock-tests')} size="lg" variant="secondary">
                            टेस्ट दें
                        </Button>
                    </CardContent>
                </Card>
             </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <BookCopy className="text-primary" />
                सभी फीचर्स
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                title="पिछले वर्ष के पेपर"
                description="कक्षा 9-12 के पेपर्स डाउनलोड करें।"
                icon={<FileArchive className="w-6 h-6 text-indigo-500" />}
                path="/previous-papers"
                buttonText="देखें"
              />
              <FeatureCard 
                title="पाठ्यक्रम"
                description="सभी विषयों का नवीनतम पाठ्यक्रम।"
                icon={<BookCopy className="w-6 h-6 text-rose-500" />}
                path="/syllabus"
                buttonText="देखें"
              />
              <FeatureCard 
                title="परीक्षा परिणाम"
                description="बोर्ड परीक्षा के परिणाम सबसे पहले देखें।"
                icon={<GraduationCap className="w-6 h-6 text-teal-500" />}
                path="/results"
                buttonText="परिणाम देखें"
              />
              <FeatureCard 
                title="ऑडियो लर्निंग"
                description="अपने नोट्स और पाठों को सुनकर सीखें।"
                icon={<Speech className="w-6 h-6 text-sky-500" />}
                path="/text-to-speech"
                buttonText="शुरू करें"
              />
               <FeatureCard 
                title="लिखित परीक्षा"
                description="लंबे उत्तरों का अभ्यास करें और AI से जांच करवाएं।"
                icon={<FileText className="w-6 h-6 text-orange-500" />}
                path="/written-exam"
                buttonText="अभ्यास करें"
              />
            </div>
          </div>
        </div>
      </main>

      <button id="name-dialog-trigger" onClick={() => setIsDialogOpen(true)} className="hidden">Open Dialog</button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>आपका नाम क्या है?</DialogTitle>
            <DialogDescription>
              एआई गुरु के साथ बेहतर अनुभव के लिए कृपया अपना नाम दर्ज करें।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                नाम
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="अपना पूरा नाम"
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleNameSave}>सहेजें</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
