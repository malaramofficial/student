"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

type SpeechRecognitionOptions = {
  onSpeechEnd?: (finalTranscript: string) => void;
};

type SpeechRecognitionHook = {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
  resetTranscript: () => void;
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const useSpeechRecognition = ({ onSpeechEnd }: SpeechRecognitionOptions = {}): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to hold the final transcript without causing re-renders on every interim result.
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
    recognition.lang = 'hi-IN';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = finalTranscript;
      setTranscript(finalTranscript + interimTranscript);

       if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      speechTimeoutRef.current = setTimeout(() => {
        // Only stop if the user has actually said something
        if (finalTranscriptRef.current.trim() || interimTranscript.trim()) {
           stopListening();
        }
      }, 3000); // 3-second pause before stopping
    };
    
    recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
            // These errors are common and can be ignored in some cases.
            // 'not-allowed' happens if user denies permission.
             if(event.error === 'not-allowed') {
                setError("माइक्रोफ़ोन की अनुमति आवश्यक है।");
             }
            return;
        }
        setError(`स्पीच रिकग्निशन त्रुटि: ${event.error}`);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        // Use the ref for the final transcript to avoid stale closures
        const finalContent = finalTranscriptRef.current.trim();
        if (onSpeechEnd && finalContent) {
          onSpeechEnd(finalContent);
        }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSpeechEnd]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      resetTranscript();
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)),
    error,
    resetTranscript,
  };
};
