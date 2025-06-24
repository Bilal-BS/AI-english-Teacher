export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isListening: boolean;
  error?: string;
}

export interface PronunciationScore {
  overall: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  feedback: string[];
}

class RealSpeechRecognition {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;

  constructor() {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  public isAvailable(): boolean {
    return this.isSupported;
  }

  public startListening(): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      let hasResult = false;

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event) => {
        if (hasResult) return;
        hasResult = true;

        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        resolve({
          transcript: transcript.trim(),
          confidence: confidence || 0.8,
          isListening: false
        });
      };

      this.recognition.onerror = (event) => {
        if (hasResult) return;
        hasResult = true;

        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        resolve({
          transcript: '',
          confidence: 0,
          isListening: false,
          error: errorMessage
        });
      };

      this.recognition.onend = () => {
        if (!hasResult) {
          resolve({
            transcript: '',
            confidence: 0,
            isListening: false,
            error: 'No speech detected. Please try again.'
          });
        }
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(new Error('Failed to start speech recognition'));
      }
    });
  }

  public stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const speechRecognition = new RealSpeechRecognition();