
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAIChatResponseAction, getInitialAIResponseAction } from '@/lib/actions';
import { Loader2, Send, Bot } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AITeacherPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const studentName = 'छात्र'; // Generic name

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    const history = messages.slice(-5);
    const response = await getAIChatResponseAction({
      studentName,
      message: userMessage,
      history,
    });

    setIsLoading(false);

    if (response.success && response.data) {
      const assistantMessage = response.data.reply;
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } else {
      toast({
        variant: 'destructive',
        title: 'AI से प्रतिक्रिया प्राप्त करने में विफल',
        description: response.error || 'एक अज्ञात त्रुटि हुई।',
      });
    }
  }, [messages, studentName, toast]);

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
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col p-4">
      <Card className="flex-1 flex flex-col bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
        <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Bot />
              एआई गुरु
            </CardTitle>
            <CardDescription>आपका व्यक्तिगत एआई-सहायक ट्यूटर</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
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
    </div>
  );
}
