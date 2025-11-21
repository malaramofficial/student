
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BotMessageSquare, BookOpen, FileText, GraduationCap, Speech, BrainCircuit, Target, FileArchive, ChevronRight, Book, TestTube2, Mic, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  buttonText: string;
};

const handleNavigation = (path: string, router: any, toast: any) => {
  if (typeof window !== 'undefined' && !localStorage.getItem('studentName')) {
    (document.getElementById('name-dialog-trigger') as HTMLButtonElement)?.click();
     toast({
        variant: 'destructive',
        title: 'आवश्यक जानकारी',
        description: 'कृपया आगे बढ़ने से पहले अपना नाम दर्ज करें।',
    });
  } else {
    router.push(path);
  }
};


const FeatureCard = ({ title, description, icon, path }: FeatureCardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  
  return (
    <Card 
      onClick={() => handleNavigation(path, router, toast)}
      className="bg-card hover:bg-muted/50 transition-all cursor-pointer group flex flex-col rounded-2xl shadow-lg hover:shadow-primary/10"
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-xl">
            {icon}
          </div>
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
       <CardFooter>
         <Button variant="link" size="sm" className="p-0 text-primary group-hover:text-secondary">
           शुरू करें
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const quickActions = [
  { label: 'आज का पाठ', icon: <Book className="mr-2 h-4 w-4" />, path: '/syllabus' },
  { label: 'मॉक टेस्ट', icon: <TestTube2 className="mr-2 h-4 w-4" />, path: '/mock-tests' },
  { label: 'स्पीकर मोड', icon: <Mic className="mr-2 h-4 w-4" />, path: '/ai-teacher' },
  { label: 'परिणाम', icon: <BarChart3 className="mr-2 h-4 w-4" />, path: '/results' },
];

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

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>लोड हो रहा है...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in-up">
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        
        {/* Personal Greeting Block */}
        <div>
          <h1 className="text-4xl font-extrabold text-primary font-headline tracking-tight">नमस्ते, {name || 'छात्र'}!</h1>
          <p className="mt-1 text-muted-foreground">आज की स्टडी स्ट्रीक: <span className="font-bold text-foreground">3 दिन 🔥</span></p>
        </div>

        {/* Quick Actions */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 pb-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="bg-card border-border hover:bg-muted h-10"
                onClick={() => handleNavigation(action.path, router, toast)}
              >
                {action.icon}{action.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        {/* Continue Learning */}
        <div>
            <h2 className="text-lg font-bold mb-3 font-headline">जारी रखें</h2>
            <Card className="bg-secondary/20 border-secondary/30 rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-secondary">अध्याय 5: आधुनिक भारत</p>
                        <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                            <div className="bg-secondary h-1.5 rounded-full" style={{width: '62%'}}></div>
                        </div>
                    </div>
                    <Button size="icon" className="rounded-full bg-secondary text-secondary-foreground" onClick={() => handleNavigation('/syllabus', router, toast)}>
                        <ArrowRight />
                    </Button>
                </CardContent>
            </Card>
        </div>


        {/* Feature Cards Grid */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard 
              title="AI गुरु"
              description="किसी भी सवाल का जवाब पाएँ"
              icon={<BotMessageSquare className="w-6 h-6 text-primary" />}
              path="/ai-teacher"
              buttonText="शुरू करें"
            />
            <FeatureCard 
              title="मॉक टेस्ट"
              description="विषय-वार प्रैक्टिस"
              icon={<Target className="w-6 h-6 text-green-400" />}
              path="/mock-tests"
              buttonText="टेस्ट दें"
            />
            <FeatureCard 
              title="लिखित परीक्षा"
              description="लॉन्ग आंसर प्रैक्टिस"
              icon={<FileText className="w-6 h-6 text-orange-400" />}
              path="/written-exam"
              buttonText="अभ्यास करें"
            />
             <FeatureCard 
              title="पाठ्यक्रम"
              description="अध्याय-वार सामग्री"
              icon={<BookOpen className="w-6 h-6 text-blue-400" />}
              path="/syllabus"
              buttonText="देखें"
            />
            <FeatureCard 
              title="परिणाम"
              description="टेस्ट हिस्ट्री, स्कोर"
              icon={<GraduationCap className="w-6 h-6 text-teal-400" />}
              path="/results"
              buttonText="परिणाम देखें"
            />
            <FeatureCard 
              title="ऑडियो लर्निंग"
              description="कानों से पढ़ो, समय बचाओ"
              icon={<Speech className="w-6 h-6 text-sky-400" />}
              path="/text-to-speech"
              buttonText="शुरू करें"
            />
             <FeatureCard 
                title="पिछले पेपर्स"
                description="पुराने पेपर्स डाउनलोड करें।"
                icon={<FileArchive className="w-6 h-6 text-indigo-400" />}
                path="/previous-papers"
                buttonText="देखें"
              />
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
