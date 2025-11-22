
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotMessageSquare, BookOpen, FileText, GraduationCap, Speech, Target, FileArchive, Book, TestTube2, Mic, BarChart3, ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
};

const handleNavigation = (path: string, router: any) => {
    router.push(path);
};


const FeatureCard = ({ title, description, icon, path }: FeatureCardProps) => {
  const router = useRouter();
  
  return (
    <Card 
      onClick={() => handleNavigation(path, router)}
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

const AdBanner = () => {
    const router = useRouter();
    return (
        <Card className="bg-gradient-to-r from-primary/80 to-secondary/80 text-primary-foreground p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold">Mala Ram Official</h3>
                <p className="text-sm text-primary-foreground/80">अपने पसंदीदा क्रिएटर के आधिकारिक मर्चेंडाइज के साथ अपने समर्थन दिखाएं।</p>
                <Button 
                    variant="secondary" 
                    className="mt-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    onClick={() => router.push('https://www.instagram.com/malaramofficial')}
                >
                    अभी खरीदें
                </Button>
            </div>
            <div className="relative w-32 h-32 md:w-36 md:h-36 shrink-0">
                <Image
                    src="https://picsum.photos/seed/adbanner/200/200"
                    alt="Advertisement"
                    fill
                    className="object-cover rounded-lg"
                    data-ai-hint="merchandise product"
                />
            </div>
        </Card>
    )
}

const quickActions = [
  { label: 'आज का पाठ', icon: <Book className="mr-2 h-4 w-4" />, path: '/syllabus' },
  { label: 'मॉक टेस्ट', icon: <TestTube2 className="mr-2 h-4 w-4" />, path: '/mock-tests' },
  { label: 'स्पीकर मोड', icon: <Mic className="mr-2 h-4 w-4" />, path: '/ai-teacher' },
  { label: 'परिणाम', icon: <BarChart3 className="mr-2 h-4 w-4" />, path: '/results' },
];

export default function DashboardPage() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [inputName, setInputName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('studentName');
    if (storedName) {
      setStudentName(storedName);
    } else {
      setShowNameDialog(true);
    }
  }, []);
  
  const handleSaveName = () => {
    if (inputName.trim()) {
      localStorage.setItem('studentName', inputName.trim());
      setStudentName(inputName.trim());
      setShowNameDialog(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen animate-fade-in-up">
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
          
          {/* Personal Greeting Block */}
          <div>
            <h1 className="text-4xl font-extrabold text-primary font-headline tracking-tight">नमस्ते, {studentName || 'छात्र'}!</h1>
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
                  onClick={() => handleNavigation(action.path, router)}
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
                      <Button size="icon" className="rounded-full bg-secondary text-secondary-foreground" onClick={() => handleNavigation('/syllabus', router)}>
                          <ArrowRight />
                      </Button>
                  </CardContent>
              </Card>
          </div>

          {/* Ad Banner */}
          <AdBanner />

          {/* Feature Cards Grid */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard 
                title="AI गुरु"
                description="किसी भी सवाल का जवाब पाएँ"
                icon={<BotMessageSquare className="w-6 h-6 text-primary" />}
                path="/ai-teacher"
              />
              <FeatureCard 
                title="मॉक टेस्ट"
                description="विषय-वार प्रैक्टिस"
                icon={<Target className="w-6 h-6 text-green-400" />}
                path="/mock-tests"
              />
              <FeatureCard 
                title="लिखित परीक्षा"
                description="लॉन्ग आंसर प्रैक्टिस"
                icon={<FileText className="w-6 h-6 text-orange-400" />}
                path="/written-exam"
              />
              <FeatureCard 
                title="पाठ्यक्रम"
                description="अध्याय-वार सामग्री"
                icon={<BookOpen className="w-6 h-6 text-blue-400" />}
                path="/syllabus"
              />
              <FeatureCard 
                title="परिणाम"
                description="टेस्ट हिस्ट्री, स्कोर"
                icon={<GraduationCap className="w-6 h-6 text-teal-400" />}
                path="/results"
              />
              <FeatureCard 
                title="ऑडियो लर्निंग"
                description="कानों से पढ़ो, समय बचाओ"
                icon={<Speech className="w-6 h-6 text-sky-400" />}
                path="/text-to-speech"
              />
              <FeatureCard 
                  title="पिछले पेपर्स"
                  description="पुराने पेपर्स डाउनलोड करें।"
                  icon={<FileArchive className="w-6 h-6 text-indigo-400" />}
                  path="/previous-papers"
                />
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={showNameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>आपका स्वागत है!</AlertDialogTitle>
            <AlertDialogDescription>
              कृपया अपना नाम दर्ज करें ताकि हम आपको एक व्यक्तिगत अनुभव प्रदान कर सकें।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="name">नाम</Label>
            <Input 
              id="name" 
              value={inputName} 
              onChange={(e) => setInputName(e.target.value)}
              placeholder="अपना नाम यहाँ लिखें"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSaveName} disabled={!inputName.trim()}>सहेजें</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
