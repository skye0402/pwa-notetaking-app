import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Mic, MicOff } from 'lucide-react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function SpeechToText({ onTranscript }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      finalTranscriptRef.current = '';
      setCurrentTranscript('');
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    console.log('Starting speech recognition...');
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      console.log('Speech recognition result received:', event.results);
      let interimTranscript = '';

      // Get the latest result
      const latestResult = event.results[event.results.length - 1];
      const transcript = latestResult[0].transcript.trim();
        
      if (latestResult.isFinal) {
        // When the sentence is final, replace the entire transcript
        finalTranscriptRef.current = transcript;
        onTranscript(transcript);
        setCurrentTranscript('');
      } else {
        // For interim results, show them as current transcript
        interimTranscript = transcript;
        setCurrentTranscript(interimTranscript);
      }
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition on no-speech error
        stopListening();
        setTimeout(startListening, 100);
      } else {
        stopListening();
      }
    };

    recognitionInstance.onend = () => {
      console.log('Speech recognition ended');
      if (isListening) {
        // Automatically restart if we're still supposed to be listening
        recognitionInstance.start();
      } else {
        setIsListening(false);
      }
    };

    recognitionInstance.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognitionRef.current = recognitionInstance;
    try {
      recognitionInstance.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }, [currentTranscript, isListening, onTranscript, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={isListening ? "secondary" : "primary"}
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
        {isListening ? 'Stop Recording' : 'Start Recording'}
      </Button>
      {currentTranscript && (
        <p className="text-sm text-gray-500">{currentTranscript}</p>
      )}
    </div>
  );
}
