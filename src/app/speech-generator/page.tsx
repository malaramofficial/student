"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateSpeechAction, getAudioResponse } from '@/lib/actions';
import { Loader2, Volume2, Download, MicVocal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SpeechGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [speech, setSpeech] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleGenerateSpeech = async () => {
    if (!topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'विषय आवश्यक है',
        description: 'कृपया भाषण के लिए एक विषय दर्ज करें।',
      });
      return;
    }
    setIsLoading(true);
    setSpeech('');
    setAudioUrl(null);

    const response = await generateSpeechAction({ topic });

    if (response.success && response.speech) {
      setSpeech(response.speech);
      toast({
        title: 'भाषण तैयार है',
        description: 'अदिति मैडम द्वारा आपका भाषण उत्पन्न किया गया है।',
      });
      await handleConvertToAudio(response.speech);
    } else {
      toast({
        variant: 'destructive',
        title: 'भाषण उत्पन्न करने में विफल',
        description: response.error || 'एक अज्ञात त्रुटि हुई।',
      });
    }
    setIsLoading(false);
  };

  const handleConvertToAudio = async (text: string) => {
    setIsAudioLoading(true);
    const audioResponse = await getAudioResponse({ text });
    if (audioResponse.success && audioResponse.audio) {
      setAudioUrl(audioResponse.audio);
    } else {
      toast({ variant: 'destructive', title: 'ऑडियो त्रुटि', description: audioResponse.error });
    }
    setIsAudioLoading(false);
  };


  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };
  
  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'speech.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <MicVocal /> भाषण जनरेटर
          </CardTitle>
          <CardDescription>
            अदिति मैडम के लिए एक भाषण का विषय प्रदान करें। वह एक प्रेरक और जानकारीपूर्ण भाषण तैयार करेंगी।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-input">भाषण का विषय</Label>
            <Textarea
              id="topic-input"
              placeholder="जैसे, 'शिक्षा का महत्व' या 'प्रौद्योगिकी का भविष्य'..."
              className="min-h-[100px]"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {speech && (
            <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">अदिति मैडम का भाषण</h3>
                        {audioUrl && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={handlePlay} disabled={isAudioLoading}>
                                    {isAudioLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleDownload}>
                                    <Download className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <ScrollArea className="h-64">
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{speech}</p>
                    </ScrollArea>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateSpeech} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                भाषण तैयार किया जा रहा है...
              </>
            ) : (
              'भाषण उत्पन्न करें'
            )}
          </Button>
        </CardFooter>
      </Card>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" onEnded={() => setIsAudioLoading(false)} onPlay={() => setIsAudioLoading(true)} onPause={() => setIsAudioLoading(false)} />}
    </div>
  );
}
