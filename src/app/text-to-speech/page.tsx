"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAudioResponse } from '@/lib/actions';
import { Loader2, Volume2, Download, Mic } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('female');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'इनपुट त्रुटि',
        description: 'कृपया बदलने के लिए कुछ टेक्स्ट दर्ज करें।',
      });
      return;
    }
    setIsLoading(true);
    setAudioUrl(null);

    const response = await getAudioResponse({ text, voice });

    if (response.success && response.audio) {
      setAudioUrl(response.audio);
      toast({
        title: 'रूपांतरण सफल',
        description: 'आपका टेक्स्ट भाषण में बदल दिया गया है।',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'रूपांतरण विफल',
        description: response.error || 'एक अज्ञात त्रुटि हुई।',
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
    <div className="flex justify-center items-center p-4 min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><Mic />टेक्स्ट-टू-स्पीच यूटिलिटी</CardTitle>
          <CardDescription>
            हिंदी या अंग्रेजी में टेक्स्ट टाइप या पेस्ट करें और इसे ऑडियो में बदलें। आप पुरुष या महिला की आवाज़ भी चुन सकते हैं।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="text-input">आपका टेक्स्ट</Label>
                <Textarea
                  id="text-input"
                  placeholder="यहां टेक्स्ट दर्ज करें..."
                  className="min-h-[150px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice-select">आवाज़ चुनें</Label>
                <Select value={voice} onValueChange={setVoice} disabled={isLoading}>
                    <SelectTrigger id="voice-select">
                        <SelectValue placeholder="एक आवाज़ चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="female">महिला</SelectItem>
                        <SelectItem value="male">पुरुष</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </div>
          {audioUrl && (
            <div className="p-4 bg-muted rounded-lg flex items-center justify-center gap-4">
              <audio ref={audioRef} src={audioUrl} className="hidden" />
              <Button variant="outline" size="icon" onClick={handlePlay}>
                <Volume2 className="h-5 w-5" />
                <span className="sr-only">चलाएं</span>
              </Button>
               <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-5 w-5" />
                <span className="sr-only">डाउनलोड करें</span>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleConvert} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                बदल रहा है...
              </>
            ) : (
              'भाषण में बदलें'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
