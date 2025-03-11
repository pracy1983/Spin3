import { useState, useCallback, useRef } from 'react';
import { AudioRecorder } from '@/lib/whisper/audio-recorder';
import { WhisperClient } from '@/lib/whisper/whisper-client';
import { useWhisperStore } from '@/stores/whisperStore';

export function useSystemAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const whisperClient = useRef(new WhisperClient('/api/whisper/transcribe')).current;
  const { addTranscription, clearTranscriptions } = useWhisperStore();

  const handleAudioData = useCallback(async (audioBlob: Blob) => {
    try {
      const response = await whisperClient.transcribe(audioBlob);
      if (response.text) {
        addTranscription(response.text);
      }
    } catch (error) {
      console.error('Erro na transcrição:', error);
      throw error;
    }
  }, [addTranscription]);

  const startRecording = useCallback(async () => {
    try {
      clearTranscriptions();
      
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder(handleAudioData);
      }

      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setIsRecording(false);
      throw error;
    }
  }, [handleAudioData, clearTranscriptions]);

  const stopRecording = useCallback(() => {
    try {
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      throw error;
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
}
