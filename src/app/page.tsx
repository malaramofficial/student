"use client";

import { useState, useEffect } from "react";
import { DashboardCard } from "@/components/dashboard-card";
import { ProgressSummaryCard } from "@/components/progress-summary-card";
import { WordOfTheDayCard } from "@/components/word-of-the-day-card";
import {
  BookOpenCheck,
  Bot,
  ClipboardCheck,
  FileText,
  LineChart,
  Lock,
  MicVocal,
  PencilRuler,
  UserSquare,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [inputName, setInputName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("studentName");
    if (storedName) {
      setStudentName(storedName);
    } else {
      setIsNameModalOpen(true);
    }
  }, []);

  const handleNameSubmit = () => {
    if (inputName.trim()) {
      localStorage.setItem("studentName", inputName.trim());
      setStudentName(inputName.trim());
      setIsNameModalOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">आपका स्वागत है!</DialogTitle>
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
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="col-span-3"
                placeholder="आपका नाम..."
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleNameSubmit}>सहेजें</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-8">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary animate-fade-in-down">
            {studentName ? `${studentName}, ` : ""}अदिति लर्निंग प्लेटफॉर्म पर आपका स्वागत है
          </h1>
          <p className="mt-2 text-muted-foreground animate-fade-in-up">
            इंटरैक्टिव सीखने और प्रगति की ट्रैकिंग के लिए आपका केंद्रीकृत हब।
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-8 pb-8">
          <ProgressSummaryCard />
          <DashboardCard
            href="/ai-teacher"
            icon={<Bot className="w-8 h-8 text-primary" />}
            title="एआई वर्चुअल शिक्षक"
            description="प्रश्न पूछें और अपनी एआई मेंटर अदिति मैडम से तुरंत सहायता प्राप्त करें।"
          />
          <DashboardCard
            href="/mock-tests"
            icon={<ClipboardCheck className="w-8 h-8 text-primary" />}
            title="मॉक टेस्ट"
            description="विभिन्न विषयों पर मॉक टेस्ट के साथ अपने ज्ञान का मूल्यांकन करें।"
          />
          <DashboardCard
            href="/written-exam"
            icon={<PencilRuler className="w-8 h-8 text-primary" />}
            title="लिखित परीक्षा"
            description="AI द्वारा उत्पन्न लिखित परीक्षा दें और मूल्यांकन प्राप्त करें।"
          />
          <DashboardCard
            href="/syllabus"
            icon={<BookOpenCheck className="w-8 h-8 text-primary" />}
            title="पाठ्यक्रम"
            description="12वीं कक्षा के लिए राजस्थान बोर्ड का पूरा पाठ्यक्रम देखें।"
          />
          <DashboardCard
            href="/results"
            icon={<FileText className="w-8 h-8 text-primary" />}
            title="परीक्षा परिणाम"
            description="राजस्थान बोर्ड के अपने परीक्षा परिणाम देखें।"
          />
          <DashboardCard
            href="/visual-teacher"
            icon={<UserSquare className="w-8 h-8 text-primary" />}
            title="विजुअल टीचर"
            description="रणवीर को एक विज़ुअल अवतार में भाषण देते हुए देखें।"
          />
          <DashboardCard
            href="/progress-tracker"
            icon={<LineChart className="w-8 h-8 text-primary" />}
            title="प्रगति ट्रैकर"
            description="अपने परीक्षा स्कोर देखें और समय के साथ अपने सुधार को ट्रैक करें।"
          />
          <WordOfTheDayCard />
          <DashboardCard
            href="/speech-generator"
            icon={<MicVocal className="w-8 h-8 text-primary" />}
            title="भाषण जनरेटर"
            description="किसी भी विषय पर रणवीर से एक प्रेरक भाषण तैयार करवाएं।"
          />
          <DashboardCard
            href="/admin"
            icon={<Lock className="w-8 h-8 text-primary" />}
            title="एडमिन ट्रेनिंग"
            description="एआई मेंटर के प्रशिक्षण और कॉन्फ़िगरेशन के लिए सुरक्षित क्षेत्र।"
          />
        </div>
      </div>
    </>
  );
}