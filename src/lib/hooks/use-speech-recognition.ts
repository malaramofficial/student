
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
      let interim_transcript = '';
      finalTranscript = ''; 

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscript + interim_transcript);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognition.onspeechend = () => {
        // When user stops speaking, process the transcript
        const currentTranscript = transcript.trim();
        if (currentTranscript) {
           stableOnSpeechEnd(currentTranscript);
           resetTranscript();
        }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
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
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.onstart = null;
            recognitionRef.current.onspeechend = null;
        }
    };
  }, [stableOnSpeechEnd, resetTranscript, transcript]);

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
