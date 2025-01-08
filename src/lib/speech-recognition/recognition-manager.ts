import type { Language } from '../../components/LanguageSelector';
import type { TranscriptionSegment, TranscriptionCallbacks } from './types';

export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private language: Language;
  private callbacks: TranscriptionCallbacks;
  private isListening: boolean = false;
  private lastFinalTimestamp: number = 0;
  private readonly PARAGRAPH_THRESHOLD = 2000; // 2 segundos de pausa = novo parágrafo

  constructor(language: Language, callbacks: TranscriptionCallbacks) {
    this.language = language;
    this.callbacks = callbacks;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Reconhecimento de voz não suportado neste navegador');
    }

    // @ts-ignore
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const now = Date.now();

      if (finalTranscript) {
        const shouldAddParagraphBreak = (now - this.lastFinalTimestamp) > this.PARAGRAPH_THRESHOLD;
        const finalText = shouldAddParagraphBreak ? `\n\n${finalTranscript}` : finalTranscript;
        
        this.callbacks.onFinalTranscript({
          text: finalText,
          timestamp: now
        });
        
        this.lastFinalTimestamp = now;
      }
      
      if (interimTranscript) {
        this.callbacks.onInterimTranscript({
          text: interimTranscript,
          timestamp: now
        });
      }
    };

    this.recognition.onerror = (event) => {
      this.callbacks.onError(event.error);
    };
  }

  public async start() {
    if (this.isListening) return;
    
    try {
      await this.recognition?.start();
      this.isListening = true;
    } catch (error) {
      throw new Error('Erro ao iniciar reconhecimento de voz');
    }
  }

  public async stop() {
    if (!this.isListening) return;

    try {
      await this.recognition?.stop();
      this.isListening = false;
    } catch (error) {
      throw new Error('Erro ao parar reconhecimento de voz');
    }
  }
}