
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

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript(''); // Clear previous transcript before starting
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        if ((err as DOMException).name !== 'InvalidStateError') {
          console.error("Error starting speech recognition:", err);
          setError("माइक्रोफ़ोन शुरू करने में विफल।");
        }
      }
    }
  }, [isListening]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';

    recognition.onresult = (event) => {
      let final_transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
        }
      }
      setTranscript(final_transcript);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // These are common, non-critical errors. We can ignore them.
        setIsListening(false);
        return; 
      }
      if (event.error === 'not-allowed') {
        setError("माइक्रोफ़ोन की अनुमति आवश्यक है।");
      } else if (event.error === 'network') {
        setError("स्पीच सेवा से कनेक्ट नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।");
      } else {
        setError(`स्पीच रिकग्निशन त्रुटि: ${event.error}`);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.onstart = null;
            recognitionRef.current.stop();
        }
    };
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)),
    error,
  };
};

    