
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Mic, Send, User, Volume2, StopCircle, Info, MicOff } from "lucide-react";
import { getAIResponse, getAudioResponse } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { placeHolderImages } from "@/lib/placeholder-images";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ConversationStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function AITeacherPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState<'student' | 'public'>('student');
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>('idle');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleAIResponse = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;
    
    setConversationStatus('thinking');

    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setAudioUrl(null);
    setInput('');
    
    const chatHistory = [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content }));
    
    try {
        const aiResponse = await getAIResponse({ question: query, chatHistory, mode });
        
        if (aiResponse.success && aiResponse.answer) {
            const assistantMessage: Message = { role: 'assistant', content: aiResponse.answer };
            setMessages(prev => [...prev, assistantMessage]);

            setIsAudioLoading(true);
            const audioResponse = await getAudioResponse({ text: aiResponse.answer, voice: 'female' });
            if (audioResponse && audioResponse.success && audioResponse.audio) {
                setAudioUrl(audioResponse.audio);
            } else {
                 toast({ variant: 'destructive', title: 'Audio Error', description: audioResponse?.error || 'Failed to generate audio.' });
                 if (isConversationMode && audioRef.current) {
                    const event = new Event('ended');
                    audioRef.current.dispatchEvent(event);
                 }
            }
            setIsAudioLoading(false);

        } else {
            toast({ variant: 'destructive', title: 'AI Error', description: aiResponse.error });
            const errorMessage: Message = { role: 'assistant', content: "क्षमा करें, मैं आपके अनुरोध को संसाधित नहीं कर सकी। कृपया पुन: प्रयास करें।" };
            setMessages(prev => [...prev, errorMessage]);
            if (isConversationMode && audioRef.current) {
                 const event = new Event('ended');
                 audioRef.current.dispatchEvent(event);
            }
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'An unexpected error occurred.', description: (e as Error).message });
        if (isConversationMode && audioRef.current) {
           const event = new Event('ended');
           audioRef.current.dispatchEvent(event);
        }
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, toast, messages, mode, isConversationMode]);
  
  const handleSpeechEnd = useCallback(async (finalTranscript: string) => {
      if (finalTranscript && isConversationMode) {
        await handleAIResponse(finalTranscript);
      }
  }, [isConversationMode, handleAIResponse]);
  
  const { transcript, isListening, startListening, stopListening, hasRecognitionSupport, error: speechError, resetTranscript } = useSpeechRecognition({ 
    onSpeechEnd: handleSpeechEnd
  });

  const sarathiAvatar = placeHolderImages.find(img => img.id === 'aditi-avatar');

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if(speechError) {
      toast({ variant: 'destructive', title: 'Speech Recognition Error', description: speechError });
      setIsConversationMode(false); // Turn off conversation mode on error
    }
  }, [speechError, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      setConversationStatus('speaking');
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [audioUrl]);

  useEffect(() => {
    if (!isConversationMode || isListening) {
      setInput(transcript);
    }
  }, [transcript, isConversationMode, isListening]);
  
  useEffect(() => {
    if(isConversationMode && isListening){
      setConversationStatus('listening');
    }
  }, [isConversationMode, isListening]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (isListening) stopListening();
    await handleAIResponse(input);
    resetTranscript();
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAudioEnded = () => {
    if (isConversationMode) {
      startListening();
    } else {
      setConversationStatus('idle');
    }
  };
  
  const handleModeChange = (isPublic: boolean) => {
    const newMode = isPublic ? 'public' : 'student';
    setMode(newMode);
    
    setIsConversationMode(isPublic);

    if (isPublic) {
        startListening();
        setConversationStatus('listening');
    } else {
        if (isListening) {
            stopListening();
        }
        setConversationStatus('idle');
    }
  };

  const ConversationStatusIndicator = () => {
    if (!isConversationMode) return null;
    
    switch (conversationStatus) {
      case 'listening':
        return (
          <div className="flex items-center gap-2 text-sm text-red-500 animate-pulse">
            <Mic className="h-4 w-4" />
            <span>सुन रही हूँ...</span>
          </div>
        );
      case 'thinking':
        return (
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>प्रतिक्रिया तैयार की जा रही है...</span>
          </div>
        );
      case 'speaking':
        return (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Volume2 className="h-4 w-4" />
            <span>सारथी बोल रही है...</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="h-4 w-4" />
            <span>कन्वर्सेशन मोड सक्रिय है</span>
          </div>
        );
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
       <div className="p-2 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <Label htmlFor="mode-switch" className={cn(mode === 'student' && 'text-primary font-semibold')}>छात्र मोड</Label>
                <Switch
                    id="mode-switch"
                    checked={mode === 'public'}
                    onCheckedChange={handleModeChange}
                    aria-label="Toggle between Student and Public mode"
                />
                <Label htmlFor="mode-switch" className={cn(mode === 'public' && 'text-primary font-semibold')}>सार्वजनिक मोड</Label>
            </div>
            <ConversationStatusIndicator />
        </div>
       </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
             <div className="text-center p-8 rounded-lg">
                <Bot className="mx-auto h-16 w-16 text-primary/70" />
                <h2 className="mt-4 text-2xl font-semibold font-headline">सारथी से पूछें</h2>
                <p className="mt-2 text-muted-foreground">
                  मैं आपका एआई वर्चुअल शिक्षक हूँ। अपनी पढ़ाई के बारे में मुझसे कुछ भी पूछें!
                </p>
             </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
              {message.role === 'assistant' && (
                <Avatar className="border-2 border-primary/50">
                  {sarathiAvatar && <Image src={sarathiAvatar.imageUrl} alt="Sarathi" width={40} height={40} data-ai-hint={sarathiAvatar.imageHint} />}
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", 
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
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
          {isLoading && messages[messages.length-1]?.role === 'user' && (
            <div className="flex items-start gap-4">
              <Avatar className="border-2 border-primary/50">
                  {sarathiAvatar && <Image src={sarathiAvatar.imageUrl} alt="Sarathi" width={40} height={40} data-ai-hint={sarathiAvatar.imageHint} />}
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
            placeholder={isListening ? "सुन रही हूँ..." : (isConversationMode ? "कन्वर्सेशन मोड से बाहर निकलने के लिए स्विच बंद करें" : "अपना प्रश्न टाइप करें या माइक का उपयोग करें")}
            disabled={isLoading || isConversationMode}
            className="flex-1"
          />
          {isClient && hasRecognitionSupport && !isConversationMode && (
            <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleListening}>
               {isListening ? <StopCircle /> : <Mic />}
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isConversationMode}>
            <Send />
          </Button>
        </form>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" onEnded={handleAudioEnded} />}
    </div>
  );
}
