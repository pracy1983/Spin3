import { create } from 'zustand';

interface WhisperState {
  transcriptions: string[];
  currentTranscription: string | null;
  addTranscription: (text: string) => void;
  setCurrentTranscription: (text: string | null) => void;
  clearTranscriptions: () => void;
}

export const useWhisperStore = create<WhisperState>((set) => ({
  transcriptions: [],
  currentTranscription: null,

  addTranscription: (text: string) => 
    set((state) => ({
      transcriptions: [...state.transcriptions, text],
      currentTranscription: text
    })),

  setCurrentTranscription: (text: string | null) =>
    set(() => ({ currentTranscription: text })),

  clearTranscriptions: () =>
    set(() => ({ 
      transcriptions: [],
      currentTranscription: null
    }))
}));
