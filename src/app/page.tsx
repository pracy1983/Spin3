import { useEffect } from 'react'
import { ContextPanel } from '../components/ContextPanel'
import { SuggestionsPanel } from '../components/SuggestionsPanel'
import { TranscriptionPanel } from '../components/TranscriptionPanel'
import { RecordButton } from '../components/RecordButton'
import { useTranscription } from '../hooks/useTranscription'
import { useAISuggestions } from '../hooks/useAISuggestions'

export default function HomePage() {
  const { isRecording, transcript, interimTranscript, toggleRecording, language, changeLanguage } = useTranscription()
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
        />
      </div>

      <RecordButton 
        isRecording={isRecording} 
        onToggleRecording={toggleRecording} 
      />
    </main>
  )
}
