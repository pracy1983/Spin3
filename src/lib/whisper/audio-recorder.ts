export class AudioRecorder {
  private displayStream: MediaStream | null = null;
  private microphoneStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private audioChunks: Float32Array[] = [];
  private isRecording: boolean = false;
  private onDataAvailable: ((data: Blob) => void) | null = null;

  constructor(onDataAvailable: (data: Blob) => void) {
    this.onDataAvailable = onDataAvailable;
  }

  async requestDisplayMedia(): Promise<MediaStream> {
    console.log('Solicitando permissão para captura de tela e áudio...');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: false
      });

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('Áudio capturado:', audioTrack.label);
      }

      return stream;
    } catch (error) {
      console.error('Erro ao capturar áudio do sistema:', error);
      throw error;
    }
  }

  async requestMicrophoneMedia(): Promise<MediaStream> {
    console.log('Solicitando permissão para microfone...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('Microfone:', audioTrack.label);
      }

      return stream;
    } catch (error) {
      console.error('Erro ao capturar microfone:', error);
      throw error;
    }
  }

  private setupAudioProcessing(displayStream: MediaStream, microphoneStream: MediaStream) {
    try {
      this.audioContext = new AudioContext();
      
      // Criar fontes de áudio
      const displaySource = this.audioContext.createMediaStreamSource(displayStream);
      const micSource = this.audioContext.createMediaStreamSource(microphoneStream);

      // Criar mixer para combinar os áudios
      const merger = this.audioContext.createChannelMerger(2);
      displaySource.connect(merger, 0, 0);
      micSource.connect(merger, 0, 1);

      // Criar processador
      this.processor = this.audioContext.createScriptProcessor(4096, 2, 1);
      merger.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Configurar processamento de áudio
      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;

        // Combinar os canais em mono
        const left = e.inputBuffer.getChannelData(0);
        const right = e.inputBuffer.getChannelData(1);
        const combined = new Float32Array(left.length);

        for (let i = 0; i < left.length; i++) {
          combined[i] = (left[i] + right[i]) / 2;
        }

        this.audioChunks.push(combined);

        // A cada 1 segundo, converter e enviar o áudio
        if (this.audioChunks.length >= 43) { // ~1 segundo em chunks de 4096 samples
          this.processAudioChunks();
        }
      };

      console.log('Processamento de áudio configurado');
    } catch (error) {
      console.error('Erro ao configurar processamento de áudio:', error);
      throw error;
    }
  }

  private processAudioChunks() {
    if (!this.audioChunks.length) return;

    // Calcular tamanho total
    const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const mergedArray = new Float32Array(totalLength);

    // Combinar todos os chunks
    let offset = 0;
    for (const chunk of this.audioChunks) {
      mergedArray.set(chunk, offset);
      offset += chunk.length;
    }

    // Converter para WAV
    const wavBlob = this.float32ArrayToWav(mergedArray, 44100);
    
    // Enviar dados
    if (this.onDataAvailable) {
      this.onDataAvailable(wavBlob);
    }

    // Limpar chunks
    this.audioChunks = [];
  }

  private float32ArrayToWav(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // Escrever cabeçalho WAV
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');                    // RIFF identifier
    view.setUint32(4, 36 + samples.length * 2, true); // File length
    writeString(8, 'WAVE');                    // WAVE identifier
    writeString(12, 'fmt ');                   // Format chunk identifier
    view.setUint32(16, 16, true);             // Format chunk length
    view.setUint16(20, 1, true);              // Sample format (1 = PCM)
    view.setUint16(22, 1, true);              // Channel count
    view.setUint32(24, sampleRate, true);     // Sample rate
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true);              // Block align
    view.setUint16(34, 16, true);             // Bits per sample
    writeString(36, 'data');                   // Data chunk identifier
    view.setUint32(40, samples.length * 2, true); // Data chunk length

    // Escrever dados PCM
    const volume = 0.8;
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i])) * volume;
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  async start() {
    try {
      console.log('Iniciando captura de áudio...');

      // Capturar streams
      this.displayStream = await this.requestDisplayMedia();
      this.microphoneStream = await this.requestMicrophoneMedia();

      // Configurar processamento
      this.setupAudioProcessing(this.displayStream, this.microphoneStream);
      
      // Iniciar gravação
      this.isRecording = true;
      console.log('Gravação iniciada');

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      this.stop();
      throw error;
    }
  }

  stop() {
    console.log('Parando gravação...');
    this.isRecording = false;

    // Processar chunks restantes
    if (this.audioChunks.length > 0) {
      this.processAudioChunks();
    }

    // Limpar recursos
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.displayStream) {
      this.displayStream.getTracks().forEach(track => track.stop());
      this.displayStream = null;
    }

    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }

    console.log('Gravação finalizada');
  }
}