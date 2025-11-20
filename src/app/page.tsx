import { DashboardCard } from "@/components/dashboard-card";
import { BookOpenCheck, Bot, ClipboardCheck, LineChart, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">अदिति लर्निंग प्लेटफॉर्म पर आपका स्वागत है</h1>
        <p className="mt-2 text-muted-foreground">इंटरैक्टिव सीखने और प्रगति की ट्रैकिंग के लिए आपका केंद्रीकृत हब।</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-8 pb-8">
        <DashboardCard
          href="/mock-tests"
          icon={<ClipboardCheck className="w-8 h-8 text-primary" />}
          title="मॉक टेस्ट"
          description="विभिन्न विषयों पर मॉक टेस्ट के साथ अपने ज्ञान का मूल्यांकन करें।"
        />
        <DashboardCard
          href="/progress-tracker"
          icon={<LineChart className="w-8 h-8 text-primary" />}
          title="प्रगति ट्रैकर"
          description="अपने परीक्षा स्कोर देखें और समय के साथ अपने सुधार को ट्रैक करें।"
        />
        <DashboardCard
          href="/ai-teacher"
          icon={<Bot className="w-8 h-8 text-primary" />}
          title="एआई वर्चुअल शिक्षक"
          description="प्रश्न पूछें और अपनी एआई मेंटर अदिति मैडम से तुरंत सहायता प्राप्त करें।"
        />
        <DashboardCard
          href="/admin"
          icon={<Lock className="w-8 h-8 text-primary" />}
          title="एडमिन ट्रेनिंग"
          description="एआई मेंटर के प्रशिक्षण और कॉन्फ़िगरेशन के लिए सुरक्षित क्षेत्र।"
        />
         <div className="col-span-1 md:col-span-2 flex items-center justify-center p-6 bg-card rounded-lg border">
          <div className="text-center">
            <BookOpenCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-headline font-semibold text-lg">अदिति लर्निंग</h3>
            <p className="text-sm text-muted-foreground">सीखें, अभ्यास करें, सफल हों।</p>
          </div>
        </div>
      </div>
    </div>
  );
}
