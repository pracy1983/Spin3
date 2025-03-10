import { useState, useCallback, useRef } from 'react';
import { AudioRecorder } from '../lib/whisper/audio-recorder';
import { WhisperClient } from '../lib/whisper/whisper-client';
import type { TranscriptionSegment } from '../lib/whisper/types';

export function useWhisperTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const whisperClient = useRef(WhisperClient.getInstance());

  const handleAudioData = useCallback(async (blob: Blob) => {
    try {
      const response = await whisperClient.current.transcribe(blob);
      setSegments(prev => [...prev, ...response.segments]);
    } catch (error) {
      console.error('Erro na transcrição:', error);
      setError('Falha ao processar áudio');
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setSegments([]);

      recorderRef.current = new AudioRecorder({
        onDataAvailable: handleAudioData,
        onError: (errorMessage) => {
          console.error('Erro no gravador:', errorMessage);
          setError(errorMessage);
          setIsRecording(false);
        }
      });

      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setError('Falha ao iniciar gravação. Verifique as permissões de áudio.');
      setIsRecording(false);
      throw error; // Propaga o erro para mostrar o estado de erro no botão
    }
  }, [handleAudioData]);

  const stopRecording = useCallback(async () => {
    try {
      if (recorderRef.current) {
        await recorderRef.current.stop();
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
    } finally {
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    try {
      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Erro ao alternar gravação:', error);
      throw error;
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    segments,
    error,
    toggleRecording
  };
}