
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import syllabusData from '../../syllabus/syllabus-data.json';

export default function SyllabusPage() {
  const [activeStream, setActiveStream] = useState(syllabusData.streams[0].name);

  return (
    <div className="p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
        <CardHeader>
          <CardTitle>कक्षा 12 पाठ्यक्रम</CardTitle>
          <CardDescription>
            राजस्थान बोर्ड के लिए विस्तृत विषय-वार पाठ्यक्रम।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeStream} onValueChange={setActiveStream} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              {syllabusData.streams.map((stream) => (
                <TabsTrigger key={stream.name} value={stream.name}>
                  {stream.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {syllabusData.streams.map((stream) => (
              <TabsContent key={stream.name} value={stream.name}>
                <Accordion type="single" collapsible className="w-full">
                  {stream.subjects.map((subject) => (
                    <AccordionItem key={subject.name} value={subject.name}>
                      <AccordionTrigger className="font-semibold text-base">
                        {subject.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc space-y-2 pl-6 pt-2">
                          {subject.topics.map((topic, index) => (
                            <li key={index} className="text-muted-foreground">
                              {topic}
                            </li>
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
