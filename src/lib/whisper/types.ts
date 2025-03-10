export interface Speaker {
  id: number;
  name?: string;
}

export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface WhisperResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
}

export interface AudioRecorderConfig {
  onDataAvailable: (blob: Blob) => void;
  onError?: (error: string) => void;
}