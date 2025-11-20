
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import syllabusData from "./syllabus-data.json";
import { BookMarked, TestTube, Briefcase, Palette } from "lucide-react";

const streamIcons: { [key: string]: React.ReactNode } = {
  "विज्ञान (Science)": <TestTube className="w-5 h-5" />,
  "वाणिज्य (Commerce)": <Briefcase className="w-5 h-5" />,
  "कला (Arts)": <Palette className="w-5 h-5" />,
};

export default function SyllabusPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <CardTitle className="font-headline text-3xl flex items-center gap-3">
          <BookMarked className="w-8 h-8 text-primary" />
          कक्षा 12 पाठ्यक्रम
        </CardTitle>
        <CardDescription className="mt-2">
          राजस्थान माध्यमिक शिक्षा बोर्ड, अजमेर - कला, वाणिज्य और विज्ञान
          के लिए पाठ्यक्रम।
        </CardDescription>
      </div>

      <Tabs defaultValue={syllabusData.streams[0].name} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
          {syllabusData.streams.map((stream) => (
            <TabsTrigger
              key={stream.name}
              value={stream.name}
              className="flex items-center gap-2 text-base py-2.5"
            >
              {streamIcons[stream.name]}
              {stream.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {syllabusData.streams.map((stream) => (
          <TabsContent key={stream.name} value={stream.name} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stream.subjects.map((subject) => (
                <Card key={subject.name} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle className="font-headline text-xl">
                        {subject.name}
                        </CardTitle>
                        <BookMarked className="w-6 h-6 text-muted-foreground"/>
                    </div>
                    <CardDescription>कक्षा 12</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                      {subject.topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
