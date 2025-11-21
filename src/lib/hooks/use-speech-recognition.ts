
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

type UseSpeechRecognitionOptions = {
  onSpeechEnd: (transcript: string) => void;
};

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

export const useSpeechRecognition = ({ onSpeechEnd }: UseSpeechRecognitionOptions): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // Ignore "already started" errors, which can happen in some cases.
        if ((err as DOMException).name !== 'InvalidStateError') {
          console.error("Error starting speech recognition:", err);
          setError("माइक्रोफ़ोन शुरू करने में विफल।");
          setIsListening(false);
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

    if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN';

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
            setTranscript(final_transcript + interim_transcript);
        };

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
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
        };
    }
    
    return () => {
        if (recognitionRef.current) {
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
