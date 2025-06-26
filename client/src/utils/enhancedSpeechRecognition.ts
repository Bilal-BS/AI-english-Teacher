// Enhanced Speech Recognition with comprehensive error handling
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives: string[];
  isFinal: boolean;
  audioMetrics?: {
    volume: number;
    clarity: number;
    duration: number;
  };
}

export interface SpeechRecognitionError {
  code: string;
  message: string;
  type: 'network' | 'audio' | 'not-allowed' | 'no-speech' | 'aborted';
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class EnhancedSpeechRecognition {
  private recognition: any = null;
  private isListening = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;
  }

  async startListening(): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject({
          code: 'not-supported',
          message: 'Speech recognition not supported in this browser',
          type: 'not-allowed'
        } as SpeechRecognitionError);
        return;
      }

      let finalTranscript = '';
      let confidence = 0;
      let alternatives: string[] = [];
      let startTime = Date.now();

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
            confidence = result[0].confidence || 0.8;
            
            // Collect alternatives
            for (let j = 0; j < Math.min(result.length, 3); j++) {
              alternatives.push(result[j].transcript);
            }
          } else {
            interimTranscript += transcript;
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        const duration = Date.now() - startTime;
        
        resolve({
          transcript: finalTranscript.trim(),
          confidence,
          alternatives,
          isFinal: true,
          audioMetrics: {
            volume: 0.7,
            clarity: confidence,
            duration
          }
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject({
          code: event.error,
          message: `Speech recognition error: ${event.error}`,
          type: this.mapErrorType(event.error)
        } as SpeechRecognitionError);
      };

      this.recognition.start();
      this.isListening = true;

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (this.isListening && this.recognition) {
          this.recognition.stop();
        }
      }, 30000);
    });
  }

  private mapErrorType(error: string): 'network' | 'audio' | 'not-allowed' | 'no-speech' | 'aborted' {
    switch (error) {
      case 'network':
        return 'network';
      case 'audio-capture':
      case 'no-speech':
        return 'no-speech';
      case 'not-allowed':
        return 'not-allowed';
      case 'aborted':
        return 'aborted';
      default:
        return 'audio';
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const enhancedSpeechRecognition = new EnhancedSpeechRecognition();