"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

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
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline text-primary">नमस्ते, {name || 'छात्र'}!</h1>
            <p className="text-muted-foreground mt-2">राजस्थान बोर्ड कक्षा 12 वीं की तैयारी के लिए आपके संसाधन यहाँ हैं।</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>एआई गुरु</CardTitle>
                <CardDescription>अपने किसी भी विषय के प्रश्नों के उत्तर तुरंत प्राप्त करें।</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">लाइव प्रश्नोत्तर सत्र</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleNavigation('/ai-teacher')} className="w-full">शुरू करें</Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>मॉक टेस्ट</CardTitle>
                <CardDescription>आगामी परीक्षाओं के लिए अभ्यास करें और अपनी तैयारी का मूल्यांकन करें।</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">विषय-वार टेस्ट</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleNavigation('/mock-tests')} className="w-full">टेस्ट दें</Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>पाठ्यक्रम</CardTitle>
                <CardDescription>कक्षा 12 के सभी विषयों का विस्तृत पाठ्यक्रम देखें।</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">नवीनतम पाठ्यक्रम</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleNavigation('/syllabus')} className="w-full">देखें</Button>
              </CardFooter>
            </Card>

             <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>परीक्षा परिणाम</CardTitle>
                <CardDescription>अपना रोल नंबर दर्ज करके परिणाम देखें।</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">रोल नंबर से खोजें</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleNavigation('/results')} className="w-full">परिणाम देखें</Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>टेक्स्ट-टू-स्पीच</CardTitle>
                <CardDescription>किसी भी पाठ को ऑडियो में बदलें। सुनने में मदद करता है।</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">टेक्स्ट को ऑडियो में बदलें</p>
                </div>
              </CardContent>
              <CardFooter>
                 <Button onClick={() => handleNavigation('/text-to-speech')} className="w-full">उपयोग करें</Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </main>

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
