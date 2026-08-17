import type { MeteringSample } from './snoreDetector';

// expo-audio não implementa "metering" (nível de áudio) na plataforma Web —
// RecorderState.metering nunca é preenchido lá (ver AudioModule.web.ts).
// Este módulo é a alternativa Web-only: mede o volume do próprio microfone
// via Web Audio API (AnalyserNode) em paralelo à gravação do expo-audio,
// convertendo pra dBFS na mesma escala que snoreDetector.ts já espera
// (SNORE_DB_THRESHOLD, SILENCE_DB_THRESHOLD etc). Não é usado no Android/iOS,
// onde o metering nativo do expo-audio já funciona.
export class WebAudioMeter {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;

  async start(onSample: (sample: MeteringSample) => void, intervalMs = 1000): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    const source = this.audioContext.createMediaStreamSource(this.stream);
    source.connect(this.analyser);

    const buffer = new Float32Array(this.analyser.fftSize);
    this.startedAt = Date.now();

    this.intervalId = setInterval(() => {
      if (!this.analyser) return;
      this.analyser.getFloatTimeDomainData(buffer);

      let sumSquares = 0;
      for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i];
      const rms = Math.sqrt(sumSquares / buffer.length);
      const dB = 20 * Math.log10(rms > 0 ? rms : 1e-10);

      onSample({ timestampMs: Date.now() - this.startedAt, dB });
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;
    this.stream = null;
  }
}
