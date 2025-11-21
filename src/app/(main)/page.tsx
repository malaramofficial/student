
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  BotMessageSquare,
  BookOpen,
  FileText,
  GraduationCap,
  Speech,
  Target,
  FileArchive,
  ArrowRight,
  BookCopy,
  BrainCircuit,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell } from 'lucide-react';

const FeatureCard = ({
  title,
  description,
  icon,
  path,
  buttonText,
  router,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  buttonText: string;
  router: any;
}) => (
  <Card
    onClick={() => router.push(path)}
    className="flex flex-col cursor-pointer transition-all hover:shadow-primary/20 hover:scale-[1.02]"
  >
    <CardHeader>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-muted rounded-xl">{icon}</div>
        <CardTitle className="text-base font-bold">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
    <CardFooter>
      <Button variant="link" className="p-0 text-primary">
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
);

const LargeFeatureCard = ({
  title,
  description,
  icon,
  path,
  buttonText,
  router,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  buttonText: string;
  router: any;
}) => (
  <Card
    onClick={() => router.push(path)}
    className="p-6 flex items-center justify-between cursor-pointer transition-all hover:shadow-primary/20 hover:scale-[1.02]"
  >
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Button>{buttonText}</Button>
  </Card>
);

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleSaveName = () => {
    if (tempName.trim()) {
      localStorage.setItem('userName', tempName);
      setUserName(tempName);
      toast({
        title: `स्वागत है, ${tempName}!`,
        description: 'आपका एआई-सहायक सीखने का साथी तैयार है।',
      });
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
      <Dialog open={!userName}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>आपका स्वागत है!</DialogTitle>
            <DialogDescription>
              शुरू करने से पहले, कृपया हमें अपना नाम बताएं।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                नाम
              </Label>
              <Input
                id="name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="col-span-3"
                placeholder="जैसे, राहुल"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName}>सहेजें और जारी रखें</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-primary font-headline tracking-tight">
              👋 नमस्ते, {userName || 'दोस्त'}!
            </h1>
          </div>

          <Alert className="border-primary/30 bg-primary/10">
            <Bell className="h-4 w-4 text-primary" />
            <AlertTitle className="font-bold text-primary">
              आपकी अगली परीक्षा
            </AlertTitle>
            <AlertDescription className="text-foreground/80">
              कक्षा 12 की विज्ञान की परीक्षा 05 दिसंबर को है। तैयारी करते रहें!
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline">🧠 मुख्य उपकरण</h2>
            <div className="space-y-4">
              <LargeFeatureCard
                title="AI गुरु से पूछें"
                description="अपने सभी शैक्षणिक सवालों का तुरंत जवाब पाएं।"
                icon={
                  <BrainCircuit className="w-6 h-6 text-primary" />
                }
                path="/ai-teacher"
                buttonText="अभी पूछें"
                router={router}
              />
              <LargeFeatureCard
                title="अपनी तैयारी परखें"
                description="नए पैटर्न पर आधारित टेस्ट देकर अपने स्कोर को ट्रैक करें।"
                icon={<Target className="w-6 h-6 text-green-400" />}
                path="/mock-tests"
                buttonText="टेस्ट दें"
                router={router}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline">📚 सभी फीचर्स</h2>
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                title="पिछले वर्ष के पेपर"
                description="कक्षा 9-12 के पेपर्स डाउनलोड करें।"
                icon={<FileArchive className="w-6 h-6 text-indigo-400" />}
                path="/previous-papers"
                buttonText="देखें"
                router={router}
              />
              <FeatureCard
                title="पाठ्यक्रम"
                description="सभी विषयों का नवीनतम पाठ्यक्रम।"
                icon={<BookCopy className="w-6 h-6 text-blue-400" />}
                path="/syllabus"
                buttonText="देखें"
                router={router}
              />
              <FeatureCard
                title="परीक्षा परिणाम"
                description="बोर्ड परीक्षा के परिणाम देखें।"
                icon={<GraduationCap className="w-6 h-6 text-teal-400" />}
                path="/results"
                buttonText="परिणाम देखें"
                router={router}
              />
              <FeatureCard
                title="ऑडियो लर्निंग"
                description="अपने नोट्स और पाठों को सुनकर सीखें।"
                icon={<Speech className="w-6 h-6 text-sky-400" />}
                path="/text-to-speech"
                buttonText="शुरू करें"
                router={router}
              />
               <FeatureCard
                title="लिखित परीक्षा"
                description="लंबे उत्तर वाले प्रश्नों का अभ्यास करें।"
                icon={<FileText className="w-6 h-6 text-orange-400" />}
                path="/written-exam"
                buttonText="अभ्यास करें"
                router={router}
              />
               <FeatureCard
                title="AI गुरु"
                description="किसी भी सवाल का जवाब पाएं।"
                icon={<BotMessageSquare className="w-6 h-6 text-purple-400" />}
                path="/ai-teacher"
                buttonText="पूछें"
                router={router}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
