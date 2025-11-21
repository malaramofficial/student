
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
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const stableOnSpeechEnd = useCallback((finalTranscript: string) => {
    if (onSpeechEnd) {
      onSpeechEnd(finalTranscript);
    }
  }, [onSpeechEnd]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

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

    let finalTranscript = '';

    recognition.onresult = (event) => {
      // Clear any existing timeout on new speech input
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }

      let interim_transcript = '';
      finalTranscript = ''; // Reset final transcript for this result event

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscript + interim_transcript);
      
      // Set a timeout to trigger onSpeechEnd if there's a pause in speech
      speechEndTimeoutRef.current = setTimeout(() => {
        const currentTranscript = (finalTranscript + interim_transcript).trim();
        if (currentTranscript) {
          stableOnSpeechEnd(currentTranscript);
          resetTranscript();
        }
      }, 3000); 
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // These are not critical errors, we can ignore them and let listening restart if needed.
        return; 
      }
      if (event.error === 'not-allowed') {
        setError("माइक्रोफ़ोन की अनुमति आवश्यक है।");
      } else if (event.error === 'network') {
        setError("स्पीच सेवा से कनेक्ट नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।");
      } else {
        setError(`स्पीच रिकग्निशन त्रुटि: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
    };
    
    return () => {
        if (speechEndTimeoutRef.current) {
            clearTimeout(speechEndTimeoutRef.current);
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.onstart = null;
        }
    };
  }, [stableOnSpeechEnd, resetTranscript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      resetTranscript();
      try {
        recognitionRef.current.start();
      } catch (err) {
        if ((err as DOMException).name !== 'InvalidStateError') {
            console.error("स्पीच रिकग्निशन शुरू करने में त्रुटि:", err);
            setError("माइक्रोफ़ोन शुरू करने में विफल।");
            setIsListening(false);
        }
      }
    }
  }, [isListening, resetTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
      recognitionRef.current.stop();
    }
  }, [isListening]);

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

    