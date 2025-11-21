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
      let interim_transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(final_transcript + interim_transcript);

      // Reset the timer every time a new result comes in
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
      speechEndTimeoutRef.current = setTimeout(() => {
        // If there's no new result for 1.5s, consider it the end of speech
        const currentTranscript = (final_transcript + interim_transcript).trim();
        if (currentTranscript) {
          stableOnSpeechEnd(currentTranscript);
          setIsListening(false);
          recognition.stop();
        }
      }, 1500); // 1.5-second delay
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') return;
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
  }, [stableOnSpeechEnd]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      resetTranscript();
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error("स्पीच रिकग्निशन शुरू करने में त्रुटि:", err);
        // This can happen if recognition is already started, which is a recoverable state.
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false); 
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
      const finalTranscript = transcript.trim();
      if(finalTranscript){
          stableOnSpeechEnd(finalTranscript);
      }
    }
  }, [isListening, transcript, stableOnSpeechEnd]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
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
