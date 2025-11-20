"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAudioResponse } from '@/lib/actions';
import { Loader2, Volume2, Download } from 'lucide-react';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Error',
        description: 'Please enter some text to convert.',
      });
      return;
    }
    setIsLoading(true);
    setAudioUrl(null);

    const response = await getAudioResponse({ text });

    if (response.success && response.audio) {
      setAudioUrl(response.audio);
      toast({
        title: 'Conversion Successful',
        description: 'Your text has been converted to speech.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Conversion Failed',
        description: response.error || 'An unknown error occurred.',
      });
    }
    setIsLoading(false);
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
    <div className="flex justify-center items-center p-4 min-h-[80vh]">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Text-to-Speech Utility</CardTitle>
          <CardDescription>
            Type or paste text in Hindi or English and convert it to audio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Your Text</Label>
            <Textarea
              id="text-input"
              placeholder="Enter text here..."
              className="min-h-[150px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {audioUrl && (
            <div className="p-4 bg-muted rounded-lg flex items-center justify-center gap-4">
              <audio ref={audioRef} src={audioUrl} className="hidden" />
              <Button variant="outline" size="icon" onClick={handlePlay}>
                <Volume2 className="h-5 w-5" />
              </Button>
               <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleConvert} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to Speech'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
