"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
}

interface UseSpeechRecognitionOptions {
  onSpeechEnd: (transcript: string) => void;
}

const hasSpeechRecognitionSupport = () =>
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export const useSpeechRecognition = ({ onSpeechEnd }: UseSpeechRecognitionOptions): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (!hasSpeechRecognitionSupport()) {
      setError("Browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim_transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscriptRef.current + interim_transcript);

      // Reset timeout on any speech activity
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
      speechEndTimeoutRef.current = setTimeout(() => {
        if(isListening) {
          stopListening();
        }
      }, 2000); // 2-second silence timeout
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
      if (finalTranscriptRef.current.trim()) {
        onSpeechEnd(finalTranscriptRef.current);
        finalTranscriptRef.current = '';
        setTranscript('');
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
    };
  }, [onSpeechEnd]); // isListening removed from dependencies
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        finalTranscriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
         console.error("Error starting recognition:", err);
         if (err instanceof Error && err.name === 'NotAllowedError') {
             setError("Microphone access denied.");
         } else {
             setError("Could not start speech recognition.");
         }
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    }
  }, [isListening]);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    hasRecognitionSupport: hasSpeechRecognitionSupport(),
  };
};
