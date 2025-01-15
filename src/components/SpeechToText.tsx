import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Mic, MicOff } from 'lucide-react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
}

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  item(index: number): { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
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
  new (): SpeechRecognition;
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
      const results = event.results;
      const lastResult = results.item(results.length - 1);
      console.log('Last result:', lastResult);
      
      if (!lastResult) {
        console.log('No results found');
        return;
      }

      const firstAlternative = lastResult.item(0);
      if (!firstAlternative) {
        console.log('No alternatives found');
        return;
      }

      const transcript = firstAlternative.transcript;
      console.log('Current transcript:', transcript);
      setCurrentTranscript(transcript);

      if (lastResult.isFinal) {
        console.log('Final transcript:', transcript);
        if (transcript && transcript.trim()) {
          onTranscript(transcript);
        }
        setCurrentTranscript('');
      }
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setCurrentTranscript('');
    };

    recognitionInstance.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognitionInstance.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // If we still have a current transcript when recognition ends,
      // send it as final
      if (currentTranscript && currentTranscript.trim()) {
        console.log('Sending final transcript on end:', currentTranscript);
        onTranscript(currentTranscript);
      }
      setCurrentTranscript('');
    };

    recognitionRef.current = recognitionInstance;
    try {
      recognitionInstance.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Error starting speech recognition. Please try again.');
    }
  }, [onTranscript, currentTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentTranscript('');
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={toggleListening}
        variant="primary"
        size="sm"
        className={`flex items-center gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Start Recording
          </>
        )}
      </Button>
      {currentTranscript && (
        <div className="text-sm text-gray-500 italic">
          Recording: {currentTranscript}
        </div>
      )}
    </div>
  );
}
