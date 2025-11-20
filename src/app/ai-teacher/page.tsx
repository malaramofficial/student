"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Mic, Send, User, Volume2, StopCircle } from "lucide-react";
import { getAIResponse, getAudioResponse } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { placeHolderImages } from "@/lib/placeholder-images";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AITeacherPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { transcript, isListening, startListening, stopListening, hasRecognitionSupport, error: speechError } = useSpeechRecognition();

  const aditiAvatar = placeHolderImages.find(img => img.id === 'aditi-avatar');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);
  
  useEffect(() => {
    if(speechError) {
      toast({ variant: 'destructive', title: 'Speech Recognition Error', description: speechError });
    }
  }, [speechError, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [audioUrl]);

  const playAudioForMessage = async (text: string) => {
    setIsAudioLoading(true);
    setAudioUrl(null);
    const audioResponse = await getAudioResponse({ text });
    if (audioResponse.success && audioResponse.audio) {
      setAudioUrl(audioResponse.audio);
    } else {
      toast({ variant: 'destructive', title: 'Audio Error', description: audioResponse.error });
    }
    setIsAudioLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    stopListening();
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const chatHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
    const response = await getAIResponse({ question: input, chatHistory });

    if (response.success && response.answer) {
      const assistantMessage: Message = { role: 'assistant', content: response.answer };
      setMessages(prev => [...prev, assistantMessage]);
      await playAudioForMessage(response.answer);
    } else {
      toast({ variant: 'destructive', title: 'AI Error', description: response.error });
      const errorMessage: Message = { role: 'assistant', content: "क्षमा करें, मैं आपके अनुरोध को संसाधित नहीं कर सकी। कृपया पुन: प्रयास करें।" };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
             <div className="text-center p-8 rounded-lg">
                <Bot className="mx-auto h-16 w-16 text-primary/70" />
                <h2 className="mt-4 text-2xl font-semibold font-headline">अदिति मैडम से पूछें</h2>
                <p className="mt-2 text-muted-foreground">
                  मैं आपकी एआई वर्चुअल शिक्षक हूँ। अपनी पढ़ाई के बारे में मुझसे कुछ भी पूछें!
                </p>
             </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
              {message.role === 'assistant' && (
                <Avatar className="border-2 border-primary/50">
                  {aditiAvatar && <Image src={aditiAvatar.imageUrl} alt="Aditi Madam" width={40} height={40} data-ai-hint={aditiAvatar.imageHint} />}
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", 
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}>
                <p className="whitespace-pre-wrap text-muted-foreground">{message.content}</p>
                 {message.role === 'assistant' && index === messages.length -1 && (
                    <div className="mt-2">
                      {isAudioLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        audioUrl && <button onClick={() => audioRef.current?.play()}><Volume2 className="h-4 w-4" /></button>
                      )}
                    </div>
                )}
              </div>
              {message.role === 'user' && <Avatar><AvatarFallback><User /></AvatarFallback></Avatar>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <Avatar className="border-2 border-primary/50">
                  {aditiAvatar && <Image src={aditiAvatar.imageUrl} alt="Aditi Madam" width={40} height={40} data-ai-hint={aditiAvatar.imageHint} />}
                  <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
              <div className="max-w-[75%] rounded-lg p-3 text-sm bg-muted text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "सुन रही हूँ..." : "अपना प्रश्न टाइप करें..."}
            disabled={isLoading}
            className="flex-1"
          />
          {isClient && hasRecognitionSupport && (
            <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={isListening ? stopListening : startListening}>
              {isListening ? <StopCircle /> : <Mic />}
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send />
          </Button>
        </form>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </div>
  );
}
