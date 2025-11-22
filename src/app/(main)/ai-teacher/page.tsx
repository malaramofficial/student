
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAIChatResponseAction, getInitialAIResponseAction, getAudioResponse } from '@/lib/actions';
import { Loader2, Send, Bot, Volume2, Speaker, Instagram } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  isSpeaking?: boolean;
};

type RedirectAction = {
  type: 'redirect';
  url: string;
};

export default function AITeacherPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [voice, setVoice] useState('female');
  const [redirectAction, setRedirectAction] = useState<RedirectAction | null>(null);
  const studentName = 'छात्र'; // Generic name

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((audioUrl: string, messageIndex: number) => {
    if (audioRef.current) {
      setMessages(prev => prev.map((msg, idx) => 
        idx === messageIndex ? { ...msg, isSpeaking: true } : { ...msg, isSpeaking: false }
      ));
      
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));

      audioRef.current.onended = () => {
        setMessages(prev => prev.map((msg, idx) => 
          idx === messageIndex ? { ...msg, isSpeaking: false } : msg
        ));
      };
    }
  }, []);

  const handleSubmit = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    
    const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
    const response = await getAIChatResponseAction({
      studentName,
      message: userMessage,
      history,
    });

    setIsLoading(false);

    if (response.success && response.data) {
      const assistantMessageContent = response.data.reply;
      const newAssistantMessage: Message = { role: 'assistant', content: assistantMessageContent };
      const assistantMessageIndex = messages.length + 1; // Index after user message is added
      setMessages((prev) => [...prev, newAssistantMessage]);

      // Handle redirect action
      if (response.data.action && response.data.action.type === 'redirect') {
        setRedirectAction(response.data.action as RedirectAction);
      }

      if (isTtsEnabled) {
        const audioResponse = await getAudioResponse({ text: assistantMessageContent, voice });
        if (audioResponse.success && audioResponse.audio) {
          setMessages(prev => prev.map((msg, idx) => 
            idx === assistantMessageIndex ? { ...msg, audioUrl: audioResponse.audio } : msg
          ));
          playAudio(audioResponse.audio, assistantMessageIndex);
        } else {
          toast({
            variant: 'destructive',
            title: 'ऑडियो बनाने में विफल',
            description: audioResponse.error || 'एक अज्ञात त्रुटि हुई।',
          });
        }
      }

    } else {
      toast({
        variant: 'destructive',
        title: 'AI से प्रतिक्रिया प्राप्त करने में विफल',
        description: response.error || 'एक अज्ञात त्रुटि हुई।',
      });
      // Rollback the user message if AI fails
      setMessages(prev => prev.filter(m => m !== newUserMessage));
    }
  }, [messages, studentName, toast, isTtsEnabled, voice, playAudio]);

  useEffect(() => {
    const fetchInitialMessage = async () => {
      setIsLoading(true);
      const response = await getInitialAIResponseAction({ studentName });
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

    if (messages.length === 0) {
      fetchInitialMessage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(input);
  };
  
  const handleRedirect = () => {
    if (redirectAction?.url) {
      window.open(redirectAction.url, '_blank');
    }
    setRedirectAction(null);
  };

  return (
    <>
      <div className="flex flex-col p-4 pb-20 md:pb-4 min-h-[calc(100vh-theme(spacing.14))]">
        <Card className="flex-1 flex flex-col bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
          <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
                    <Bot />
                    एआई गुरु
                  </CardTitle>
                  <CardDescription>आपका व्यक्तिगत एआई-सहायक ट्यूटर</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="tts-mode" checked={isTtsEnabled} onCheckedChange={setIsTtsEnabled} />
                        <Label htmlFor="tts-mode" className="flex items-center gap-1"><Speaker size={16}/> स्पीकर मोड</Label>
                    </div>
                     <Select value={voice} onValueChange={setVoice} disabled={!isTtsEnabled}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="आवाज़" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="female">महिला</SelectItem>
                            <SelectItem value="male">पुरुष</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                    {msg.isSpeaking ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
                  </div>
                )}
                <div
                  className={`max-w-md p-3 rounded-xl relative group ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  {msg.role === 'assistant' && msg.audioUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-2 -top-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => playAudio(msg.audioUrl!, index)}
                    >
                      <Volume2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
             {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
              <div className="flex items-start gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
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
            <form onSubmit={handleFormSubmit} className="flex gap-2 w-full">
              <Input
                placeholder="आपका सवाल यहाँ टाइप करें..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border focus:bg-card"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send />
              </Button>
            </form>
          </CardFooter>
        </Card>
        <audio ref={audioRef} className="hidden" />
      </div>

      <AlertDialog open={!!redirectAction}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Instagram className="text-[#E1306C]" />
              इंस्टाग्राम पर जाएं
            </AlertDialogTitle>
            <AlertDialogDescription>
              AI गुरु के निर्माता को फॉलो करने के लिए आपको इंस्टाग्राम पर रीडायरेक्ट किया जा रहा है। क्या आप आगे बढ़ना चाहते हैं?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRedirectAction(null)}>रद्द करें</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedirect}>हाँ, ले चलें</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
