"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAIChatResponseAction, getAudioResponse, getInitialAIResponseAction } from '@/lib/actions';
import { Loader2, Send, Mic, StopCircle, Bot } from 'lucide-react';
import { useSpeechRecognition } from '@/lib/hooks/use-speech-recognition';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ConversationStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function AITeacherPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>('idle');
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSpeechEnd = (transcript: string) => {
    if (transcript.trim()) {
      setInput(transcript);
      // Automatically send the message in conversation mode
      handleSubmit(new Event('submit'), transcript);
    }
  };

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport
  } = useSpeechRecognition({ onSpeechEnd: handleSpeechEnd });

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('studentName') || 'छात्र';
    setStudentName(storedName);

    const fetchInitialMessage = async () => {
      setIsLoading(true);
      const response = await getInitialAIResponseAction({ studentName: storedName });
      if (response.success && response.data) {
        setMessages([{ role: 'assistant', content: response.data.message }]);
      } else {
        toast({
          variant: 'destructive',
          title: 'प्रारंभिक संदेश लोड करने में विफल',
          description: response.error || 'एक अज्ञात त्रुटि हुई।',
        });
      }
      setIsLoading(false);
    };

    fetchInitialMessage();
  }, [toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
   useEffect(() => {
    if (isConversationMode) {
      if (isListening) {
        setConversationStatus('listening');
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        speechTimeoutRef.current = setTimeout(() => {
           if (transcript.trim() && conversationStatus === 'listening') {
             stopListening();
           }
        }, 3000);
      } else if (conversationStatus !== 'thinking' && conversationStatus !== 'speaking') {
        setConversationStatus('idle');
      }
    } else {
       setConversationStatus('idle');
    }

    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [isListening, transcript, isConversationMode, conversationStatus, stopListening]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);
  
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      
      audioRef.current.onended = () => {
        if(isConversationMode){
          startListening();
        }
        setConversationStatus('idle');
      };
    }
  }, [audioUrl, isConversationMode, startListening]);

  const handleAIResponse = async (userMessage: string) => {
      const history = messages.slice(-5);
      const response = await getAIChatResponseAction({
        studentName,
        message: userMessage,
        history,
      });

      if (response.success && response.data) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
        
        if (isConversationMode) {
          setConversationStatus('speaking');
          const audioResponse = await getAudioResponse({ text: response.data.reply, voice: 'female' });
          if (audioResponse.success && audioResponse.audio) {
            setAudioUrl(audioResponse.audio);
          } else {
             toast({
              title: 'ऑडियो उत्पन्न करने में विफल रहा',
              description: audioResponse.error || 'आप बातचीत जारी रख सकते हैं।',
              variant: 'destructive',
            });
            // If audio fails, go back to listening
            if(isConversationMode){
                startListening();
            }
            setConversationStatus('idle');
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'AI से प्रतिक्रिया प्राप्त करने में विफल',
          description: response.error || 'एक अज्ञात त्रुटि हुई।',
        });
        if(isConversationMode){
          startListening(); // Re-start listening even if AI fails
        }
      }
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | Event, messageToSend?: string) => {
    if(e.preventDefault) e.preventDefault();
    const userMessage = messageToSend || input;

    if (!userMessage.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    if(isListening) stopListening();
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    
    setConversationStatus('thinking');

    await handleAIResponse(userMessage);

    setIsLoading(false);
     if (isConversationMode && !audioUrl) {
        if (conversationStatus !== 'speaking') {
            startListening();
        }
    }
  };
  
  const toggleConversationMode = () => {
    const newMode = !isConversationMode;
    setIsConversationMode(newMode);
    if(newMode){
        startListening();
        toast({
            title: 'सार्वजनिक मोड सक्रिय',
            description: 'अब आप बोलकर सवाल पूछ सकते हैं।',
        });
    } else {
        stopListening();
         if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        toast({
            title: 'सार्वजनिक मोड निष्क्रिय',
            description: 'आप अब टाइप करके सवाल पूछ सकते हैं।',
        });
    }
  }

  const getStatusIndicator = () => {
    if (!isConversationMode) return null;

    switch(conversationStatus) {
      case 'listening':
        return <div className="flex items-center gap-2 text-green-500"><Mic className="w-4 h-4 animate-pulse" />सुन रहा है...</div>;
      case 'thinking':
        return <div className="flex items-center gap-2 text-blue-500"><Loader2 className="w-4 h-4 animate-spin" />सोच रहा है...</div>;
      case 'speaking':
        return <div className="flex items-center gap-2 text-purple-500"><Bot className="w-4 h-4" />बोल रहा है...</div>;
      default:
        return <div className="flex items-center gap-2 text-gray-500">निष्क्रिय</div>;
    }
  }


  return (
    <div className="h-[calc(100vh-56px)] flex flex-col p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Bot />
              एआई गुरु
            </CardTitle>
            <CardDescription>आपका व्यक्तिगत एआई-सहायक ट्यूटर</CardDescription>
          </div>
          {isConversationMode && <div className="text-sm font-medium">{getStatusIndicator()}</div>}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
           {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <div className="flex items-start gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
              <div className="max-w-md p-3 rounded-lg bg-muted flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Input
              placeholder="आपका सवाल यहाँ टाइप करें..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isConversationMode}
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
        </CardFooter>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
