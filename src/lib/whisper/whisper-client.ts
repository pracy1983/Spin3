import { WhisperResponse } from './types';

export class WhisperClient {
  private apiUrl: string;
  private ffmpeg: any = null;
  private ffmpegLoaded: boolean = false;
  private ffmpegLoadPromise: Promise<void> | null = null;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  private async loadFFmpeg() {
    if (this.ffmpegLoadPromise) {
      return this.ffmpegLoadPromise;
    }

    if (!this.ffmpegLoaded) {
      this.ffmpegLoadPromise = (async () => {
        try {
          const { FFmpeg } = await import('@ffmpeg/ffmpeg');
          const { toBlobURL } = await import('@ffmpeg/util');

          this.ffmpeg = new FFmpeg();

          const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
          
          await this.ffmpeg.load({
            coreURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.js`,
              'text/javascript'
            ),
            wasmURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.wasm`,
              'application/wasm'
            ),
            workerURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.worker.js`,
              'text/javascript'
            )
          });

          this.ffmpegLoaded = true;
          console.log('FFmpeg carregado com sucesso');
        } catch (error) {
          console.error('Erro ao carregar FFmpeg:', error);
          this.ffmpeg = null;
          this.ffmpegLoaded = false;
          throw error;
        } finally {
          this.ffmpegLoadPromise = null;
        }
      })();

      return this.ffmpegLoadPromise;
    }
  }

  private async convertToWAV(audioBlob: Blob): Promise<Blob> {
    try {
      await this.loadFFmpeg();
      if (!this.ffmpeg) throw new Error('FFmpeg não inicializado');

      console.log('Convertendo áudio:', audioBlob.size, 'bytes', audioBlob.type);

      // Converte o Blob para ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const inputData = new Uint8Array(arrayBuffer);

      // Escreve o arquivo de entrada
      await this.ffmpeg.writeFile('input.webm', inputData);

      // Executa a conversão otimizada para voz
      await this.ffmpeg.exec([
        '-i', 'input.webm',
        '-ar', '16000',  // Sample rate de 16kHz
        '-ac', '1',      // Mono
        '-c:a', 'pcm_s16le', // Formato WAV
        'output.wav'
      ]);

      // Lê o arquivo convertido
      const data = await this.ffmpeg.readFile('output.wav');
      console.log('Áudio convertido para WAV:', data.length, 'bytes');

      // Limpa os arquivos
      await this.ffmpeg.deleteFile('input.webm');
      await this.ffmpeg.deleteFile('output.wav');

      return new Blob([data], { type: 'audio/wav' });
    } catch (error) {
      console.error('Erro na conversão para WAV:', error);
      throw error;
    }
  }

  async transcribe(audioBlob: Blob): Promise<WhisperResponse> {
    try {
      console.log('Convertendo áudio para WAV usando FFmpeg...');
      const wavBlob = await this.convertToWAV(audioBlob);

      console.log('Enviando áudio para transcrição...', {
        tamanhoOriginal: audioBlob.size,
        tipoOriginal: audioBlob.type,
        tamanhoWav: wavBlob.size,
        tipoWav: wavBlob.type
      });

      const formData = new FormData();
      formData.append('file', wavBlob, 'audio.wav');
      formData.append('language', 'portuguese');
      formData.append('task', 'transcribe');

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Whisper: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transcrição recebida:', data);
      return data;

    } catch (error) {
      console.error('Erro ao transcrever áudio:', error);
      throw error;
    }
  }
}