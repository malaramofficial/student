
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
  const finalTranscriptRef = useRef('');
  
  const stableOnSpeechEnd = useCallback((finalTranscript: string) => {
    if (onSpeechEnd) {
      onSpeechEnd(finalTranscript);
    }
  }, [onSpeechEnd]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
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

    recognition.onresult = (event) => {
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }

      let interim_transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscriptRef.current + interim_transcript);
      
      speechEndTimeoutRef.current = setTimeout(() => {
        const currentTranscript = (finalTranscriptRef.current + interim_transcript).trim();
        if (currentTranscript) {
          stableOnSpeechEnd(currentTranscript);
          resetTranscript();
        }
      }, 3000); 
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
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
        }
    };
  }, [stableOnSpeechEnd, resetTranscript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      resetTranscript();
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        if ((err as DOMException).name === 'InvalidStateError') {
            // Already started, this is fine.
        } else {
            console.error("स्पीच रिकग्निशन शुरू करने में त्रुटि:", err);
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
      setIsListening(false); 
      
      const finalTranscript = (finalTranscriptRef.current || transcript).trim();
      if(finalTranscript){
          stableOnSpeechEnd(finalTranscript);
          resetTranscript();
      }
    }
  }, [isListening, transcript, stableOnSpeechEnd, resetTranscript]);

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
