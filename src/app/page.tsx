import { DashboardCard } from "@/components/dashboard-card";
import { WordOfTheDayCard } from "@/components/word-of-the-day-card";
import { BookOpenCheck, Bot, ClipboardCheck, FileText, LineChart, Lock, MicVocal, UserSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary animate-fade-in-down">अदिति लर्निंग प्लेटफॉर्म पर आपका स्वागत है</h1>
        <p className="mt-2 text-muted-foreground animate-fade-in-up">इंटरैक्टिव सीखने और प्रगति की ट्रैकिंग के लिए आपका केंद्रीकृत हब।</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-8 pb-8">
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
          description="अदिति मैडम को एक विज़ुअल अवतार में भाषण देते हुए देखें।"
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
          description="किसी भी विषय पर अदिति मैडम से एक प्रेरक भाषण तैयार करवाएं।"
        />
        <DashboardCard
          href="/admin"
          icon={<Lock className="w-8 h-8 text-primary" />}
          title="एडमिन ट्रेनिंग"
          description="एआई मेंटर के प्रशिक्षण और कॉन्फ़िगरेशन के लिए सुरक्षित क्षेत्र।"
        />
      </div>
    </div>
  );
}
