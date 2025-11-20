"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

type SpeechRecognitionHook = {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
};

// Extend the global Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Set language to Hindi (India)

    recognition.onresult = (event) => {
      let interimTranscript = '';
      finalTranscriptRef.current = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
       setTranscript(finalTranscriptRef.current + interimTranscript);
    };
    
    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            // Ignore no-speech errors, as they are common
            return;
        }
        setError(`स्पीच रिकग्निशन त्रुटि: ${event.error}`);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
        // We update the transcript one last time with the final version.
        setTranscript(finalTranscriptRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
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
    startListening,
    stopListening,
    hasRecognitionSupport: !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)),
    error,
  };
};
