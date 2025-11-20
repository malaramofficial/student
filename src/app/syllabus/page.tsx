
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <BookMarked className="w-8 h-8 text-primary" />
            कक्षा 12 पाठ्यक्रम
          </CardTitle>
          <CardDescription>
            राजस्थान माध्यमिक शिक्षा बोर्ड, अजमेर - कला, वाणिज्य और विज्ञान
            के लिए पाठ्यक्रम।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={syllabusData.streams[0].name} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              {syllabusData.streams.map((stream) => (
                <TabsTrigger
                  key={stream.name}
                  value={stream.name}
                  className="flex items-center gap-2"
                >
                  {streamIcons[stream.name]}
                  {stream.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {syllabusData.streams.map((stream) => (
              <TabsContent key={stream.name} value={stream.name}>
                <Accordion type="single" collapsible className="w-full">
                  {stream.subjects.map((subject) => (
                    <AccordionItem
                      key={subject.name}
                      value={subject.name}
                    >
                      <AccordionTrigger className="text-lg font-headline hover:no-underline">
                        {subject.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          {subject.topics.map((topic, index) => (
                            <li key={index}>{topic}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
