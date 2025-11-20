
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateSpeechAction, getAudioResponse } from '@/lib/actions';
import { Loader2, Play, Pause, UserSquare } from 'lucide-react';
import { placeHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function VisualTeacherPage() {
  const [topic, setTopic] = useState('शिक्षा का महत्व');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech, setSpeech] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [teleprompterText, setTeleprompterText] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const wordsRef = useRef<string[]>([]);
  const wordIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const visualTeacherAvatar = placeHolderImages.find(img => img.id === 'visual-teacher-avatar');

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
    setIsPlaying(false);
    setTeleprompterText('');
    wordIndexRef.current = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const response = await generateSpeechAction({ topic });
      if (response.success && response.speech) {
        setSpeech(response.speech);
        toast({ title: 'भाषण तैयार है' });
        
        const audioResponse = await getAudioResponse({ text: response.speech });
        if (audioResponse.success && audioResponse.audio) {
          setAudioUrl(audioResponse.audio);
          wordsRef.current = response.speech.split(/\s+/);
        } else {
          toast({ variant: 'destructive', title: 'ऑडियो रूपांतरण विफल', description: audioResponse.error });
        }
      } else {
        toast({ variant: 'destructive', title: 'भाषण उत्पन्न करने में विफल', description: response.error });
      }
    } catch(e) {
        toast({ variant: 'destructive', title: 'An unexpected error occurred.', description: (e as Error).message });
    } finally {
        setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const startTeleprompter = () => {
    const totalWords = wordsRef.current.length;
    if (!audioRef.current || totalWords === 0) return;

    const duration = audioRef.current.duration;
    const wordsPerSecond = totalWords / duration;
    const interval = 1000 / wordsPerSecond;

    intervalRef.current = setInterval(() => {
      if (wordIndexRef.current < totalWords) {
        const currentWords = wordsRef.current.slice(Math.max(0, wordIndexRef.current - 5), wordIndexRef.current + 1);
        setTeleprompterText(currentWords.join(' '));
        wordIndexRef.current++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, interval);
  };
  
  useEffect(() => {
    if (isPlaying) {
      startTeleprompter();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <UserSquare /> विजुअल टीचर
            </CardTitle>
            <CardDescription>
              अदिति मैडम को भाषण देते हुए देखें। एक विषय चुनें और 'भाषण तैयार करें' पर क्लिक करें।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-input">भाषण का विषय</Label>
              <Textarea
                id="topic-input"
                placeholder="जैसे, 'समय का सदुपयोग'..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button onClick={handleGenerateSpeech} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  भाषण तैयार किया जा रहा है...
                </>
              ) : (
                'भाषण तैयार करें'
              )}
            </Button>
            {audioUrl && !isLoading && (
                 <Button onClick={handlePlayPause} className="w-full" variant="outline">
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPlaying ? 'रोकें' : 'चलाएं'}
                </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="lg:w-2/3">
        <div className="relative aspect-[4/3] w-full bg-muted rounded-lg overflow-hidden border">
           {visualTeacherAvatar ? (
             <Image 
                src={visualTeacherAvatar.imageUrl}
                alt="Aditi Madam"
                fill
                className={cn("object-contain object-bottom transition-transform duration-1000", isPlaying ? "scale-105" : "scale-100")}
                priority
                data-ai-hint={visualTeacherAvatar.imageHint}
            />
           ) : (
            <div className="w-full h-full bg-gray-300"></div>
           )}

            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg h-28 overflow-hidden">
                <p className="text-center text-lg font-mono">
                    {teleprompterText || "भाषण शुरू करने के लिए प्ले बटन दबाएं..."}
                </p>
            </div>
        </div>
      </div>

      {audioUrl && <audio 
        ref={audioRef} 
        src={audioUrl} 
        className="hidden" 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />}
    </div>
  );
}
