import { DashboardCard } from "@/components/dashboard-card";
import { BookOpenCheck, Bot, ClipboardCheck, LineChart, Lock, AudioLines } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Welcome to Aditi Learning Platform</h1>
        <p className="mt-2 text-muted-foreground">Your centralized hub for interactive learning and progress tracking.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-8 pb-8">
        <DashboardCard
          href="/mock-tests"
          icon={<ClipboardCheck className="w-8 h-8 text-primary" />}
          title="Mock Tests"
          description="Evaluate your knowledge with mock tests across various subjects."
        />
        <DashboardCard
          href="/progress-tracker"
          icon={<LineChart className="w-8 h-8 text-primary" />}
          title="Progress Tracker"
          description="Visualize your test scores and track your improvement over time."
        />
        <DashboardCard
          href="/ai-teacher"
          icon={<Bot className="w-8 h-8 text-primary" />}
          title="AI Virtual Teacher"
          description="Ask questions and get instant help from Aditi Madam, your AI mentor."
        />
        <DashboardCard
          href="/text-to-speech"
          icon={<AudioLines className="w-8 h-8 text-primary" />}
          title="Text-to-Speech"
          description="Convert text to audio in Hindi or English for auditory learning."
        />
        <DashboardCard
          href="/admin"
          icon={<Lock className="w-8 h-8 text-primary" />}
          title="Admin Training"
          description="Secured area for training and configuring the AI mentor."
        />
         <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-center justify-center p-6 bg-card rounded-lg border">
          <div className="text-center">
            <BookOpenCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-headline font-semibold text-lg">Aditi Learning</h3>
            <p className="text-sm text-muted-foreground">Learn, Practice, Succeed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
