"use client";

import { useState, useEffect, useRef } from 'react';

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

// A more robust check for SpeechRecognition
const hasSpeechRecognitionSupport = () =>
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export const useSpeechRecognition = ({ onSpeechEnd }: UseSpeechRecognitionOptions): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef(''); // Use ref to hold the latest transcript

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
      let final_transcript = '';
      let interim_transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      const fullTranscript = transcriptRef.current + final_transcript + interim_transcript;
      setTranscript(fullTranscript);

      if (final_transcript.trim()) {
        transcriptRef.current += final_transcript;
      }
      
       // Reset timeout on any speech activity
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
      speechEndTimeoutRef.current = setTimeout(() => {
        if (isListening) {
             onSpeechEnd(transcriptRef.current);
             transcriptRef.current = '';
        }
      }, 3000);

    };

    recognition.onerror = (event) => {
      setError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Clean up timeout when recognition ends completely
       if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
    };

    return () => {
      recognition.stop();
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
    };
  }, [onSpeechEnd]);
  
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        transcriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
         console.error("Error starting recognition:", err);
         setError("Could not start speech recognition.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
       if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
       if (transcriptRef.current.trim()) {
         onSpeechEnd(transcriptRef.current);
         transcriptRef.current = '';
      }
    }
  };

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    hasRecognitionSupport: hasSpeechRecognitionSupport(),
  };
};
