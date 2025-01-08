import React, { useRef, useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import type { Language } from './LanguageSelector';

interface TranscriptionPanelProps {
  transcript: string;
  interimTranscript?: string;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function TranscriptionPanel({ transcript, interimTranscript = '', language, onLanguageChange }: TranscriptionPanelProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const messages = transcript.split('\n\n').filter(Boolean);

  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-6 bg-gray-800/80 rounded-lg shadow-lg shadow-purple-500/5 border border-purple-500/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Live Transcription</h2>
        </div>
        <LanguageSelector 
          selectedLanguage={language} 
          onLanguageChange={onLanguageChange}
        />
      </div>
      <div ref={transcriptRef} className="h-[calc(50vh-8rem)] lg:h-[calc(100vh-12rem)] overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <p key={index} className="text-gray-100 p-3 bg-gray-700/50 rounded-lg border border-purple-500/10">
            {message}
          </p>
        ))}
        {interimTranscript && (
          <p className="text-gray-400 p-3 bg-gray-700/30 rounded-lg border border-purple-500/5">
            {interimTranscript}
          </p>
        )}
      </div>
    </div>
  );
}