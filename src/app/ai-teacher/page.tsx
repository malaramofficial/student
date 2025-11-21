
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Mic, Send, User, Volume2, StopCircle, MicOff } from "lucide-react";
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'student' | 'public'>('student');
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>('idle');
  const [isClient, setIsClient] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const sarathiAvatar = placeHolderImages.find(img => img.id === 'aditi-avatar');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAIResponse = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setConversationStatus('thinking');
    setIsLoading(true);
    setAudioUrl(null);
    setInput('');

    const userMessage: Message = { role: 'user', content: query };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    
    const chatHistory = currentMessages.map(msg => ({ role: msg.role, content: msg.content }));
    
    try {
        const aiResponse = await getAIResponse({ question: query, chatHistory, mode });
        if (aiResponse.success && aiResponse.answer) {
            const assistantMessage: Message = { role: 'assistant', content: aiResponse.answer };
            setMessages(prev => [...prev, assistantMessage]);

            try {
                const audioResponse = await getAudioResponse({ text: aiResponse.answer, voice: 'female' });
                if (audioResponse?.success && audioResponse.audio) {
                    setAudioUrl(audioResponse.audio);
                } else {
                     toast({ variant: 'destructive', title: 'Audio Error', description: audioResponse?.error || 'Failed to generate audio.' });
                     if (isConversationMode) startListening(); else setConversationStatus('idle');
                }
            } catch (audioError) {
                 toast({ variant: 'destructive', title: 'Audio Generation Error', description: (audioError as Error).message });
                 if (isConversationMode) startListening(); else setConversationStatus('idle');
            }
        } else {
            toast({ variant: 'destructive', title: 'AI Error', description: aiResponse.error });
            const errorMessage: Message = { role: 'assistant', content: "क्षमा करें, मैं आपके अनुरोध को संसाधित नहीं कर सकी। कृपया पुन: प्रयास करें।" };
            setMessages(prev => [...prev, errorMessage]);
            if (isConversationMode) startListening(); else setConversationStatus('idle');
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'An unexpected error occurred.', description: (e as Error).message });
        if (isConversationMode) startListening(); else setConversationStatus('idle');
    } finally {
        setIsLoading(false);
    }
  }, [messages, mode, isConversationMode, toast]);

  const handleSpeechEnd = useCallback((finalTranscript: string) => {
    if (finalTranscript.trim() && conversationStatus === 'listening') {
      handleAIResponse(finalTranscript);
    }
  }, [conversationStatus, handleAIResponse]);

  const { transcript, isListening, startListening, stopListening, hasRecognitionSupport, error: speechError } = useSpeechRecognition({ onSpeechEnd: handleSpeechEnd });

  useEffect(() => {
    if(speechError) {
      toast({ variant: 'destructive', title: 'Speech Recognition Error', description: speechError });
      if(isConversationMode && (speechError.includes("permission") || speechError.includes("not supported"))) {
          setIsConversationMode(false);
          setConversationStatus('idle');
          stopListening();
      }
    }
  }, [speechError, toast, isConversationMode, stopListening]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      setConversationStatus('speaking');
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [audioUrl]);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (isConversationMode && !isListening) {
       setConversationStatus('idle');
    } else if (isConversationMode && isListening) {
       setConversationStatus('listening');
    }
  }, [isListening, isConversationMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isConversationMode) return;
    await handleAIResponse(input);
  };

  const handleAudioEnded = () => {
    setAudioUrl(null);
    if (isConversationMode) {
      startListening();
    } else {
      setConversationStatus('idle');
    }
  };
  
  const toggleConversationMode = () => {
    if (!hasRecognitionSupport) {
        toast({ variant: "destructive", title: "Unsupported Browser", description: "Speech recognition is not supported in this browser." });
        return;
    }
    const newConversationMode = !isConversationMode;
    setIsConversationMode(newConversationMode);
    if(newConversationMode){
      startListening();
    } else {
      stopListening();
      setInput('');
      setConversationStatus('idle');
    }
  }

  const ConversationStatusIndicator = () => {
    if (!isConversationMode) return null;
    
    let statusContent;
    switch (conversationStatus) {
      case 'listening':
        statusContent = (
          <div className="flex items-center gap-2 text-red-500 animate-pulse">
            <Mic className="h-4 w-4" />
            <span>सुन रही हूँ...</span>
          </div>
        );
        break;
      case 'thinking':
        statusContent = (
          <div className="flex items-center gap-2 text-blue-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>प्रतिक्रिया तैयार की जा रही है...</span>
          </div>
        );
        break;
      case 'speaking':
        statusContent = (
          <div className="flex items-center gap-2 text-green-500">
            <Volume2 className="h-4 w-4" />
            <span>सारथी बोल रही है...</span>
          </div>
        );
        break;
      case 'idle':
      default:
        statusContent = (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MicOff className="h-4 w-4" />
            <span>कन्वर्सेशन मोड सक्रिय है</span>
          </div>
        );
    }

    return (
        <div className="flex items-center justify-center text-sm min-w-[200px]">
            {statusContent}
        </div>
    )
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
                    onCheckedChange={(isPublic) => setMode(isPublic ? 'public' : 'student')}
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
                 {message.role === 'assistant' && index === messages.length -1 && audioUrl && (
                    <div className="mt-2">
                      <button onClick={() => audioRef.current?.play()}><Volume2 className="h-4 w-4" /></button>
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
            placeholder={isConversationMode ? "सुन रही हूँ..." : "अपना प्रश्न टाइप करें..."}
            disabled={isLoading || isConversationMode}
            className="flex-1"
          />
          {isClient && hasRecognitionSupport && (
            <Button type="button" size="icon" variant={isConversationMode ? "destructive" : "outline"} onClick={toggleConversationMode} disabled={isLoading}>
               {isConversationMode ? <StopCircle /> : <Mic />}
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isConversationMode}>
            <Send />
          </Button>
        </form>
      </div>
      <audio ref={audioRef} className="hidden" onEnded={handleAudioEnded} />
    </div>
  );
}
