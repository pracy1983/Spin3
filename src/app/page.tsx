import { useEffect } from 'react'
import { ContextPanel } from '../components/ContextPanel'
import { SuggestionsPanel } from '../components/SuggestionsPanel'
import { TranscriptionPanel } from '../components/TranscriptionPanel'
import { RecordButton } from '../components/RecordButton'
import { useTranscription } from '../hooks/useTranscription'
import { useAISuggestions } from '../hooks/useAISuggestions'
import { useSystemAudio } from '../hooks/useSystemAudio'

export default function HomePage() {
  const { 
    isRecording: isMicRecording, 
    transcript, 
    interimTranscript, 
    toggleRecording: toggleMic, 
    language, 
    changeLanguage 
  } = useTranscription()
  
  const { 
    isRecording: isSystemRecording, 
    error: systemError, 
    toggleRecording: toggleSystem,
    transcriptions: systemTranscriptions,
    currentTranscription: currentSystemTranscription
  } = useSystemAudio()
  
  const { suggestions, error: suggestionsError, generateSuggestions } = useAISuggestions()

  useEffect(() => {
    // Só gera sugestões se houver um transcript não-vazio
    const trimmedTranscript = transcript.trim()
    if (trimmedTranscript) {
      console.log('HomePage: Gerando sugestões para:', trimmedTranscript)
      generateSuggestions(trimmedTranscript)
    }
  }, [transcript, generateSuggestions])

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <ContextPanel />
      <div className="flex flex-col lg:flex-row gap-8">
        <SuggestionsPanel suggestions={suggestions} error={suggestionsError} />
        <TranscriptionPanel 
          transcript={transcript}
          interimTranscript={interimTranscript}
          language={language}
          onLanguageChange={changeLanguage}
          systemTranscriptions={systemTranscriptions}
          currentSystemTranscription={currentSystemTranscription}
        />
      </div>

      <div className="fixed bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <RecordButton 
          isRecording={isMicRecording} 
          onToggleRecording={toggleMic}
          label="Microfone"
        />

        <RecordButton 
          isRecording={isSystemRecording} 
          onToggleRecording={toggleSystem}
          label="Áudio do Sistema"
          error={systemError}
        />
      </div>
    </main>
  )
}
