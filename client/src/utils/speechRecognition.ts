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
      let timeoutId: NodeJS.Timeout;

      // Set a maximum timeout to prevent hanging
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (this.recognition) {
          try {
            this.recognition.onstart = null;
            this.recognition.onresult = null;
            this.recognition.onerror = null;
            this.recognition.onend = null;
          } catch (e) {
            console.log('Error cleaning up recognition handlers:', e);
          }
        }
      };

      timeoutId = setTimeout(() => {
        if (!hasResult) {
          hasResult = true;
          cleanup();
          resolve({
            transcript: '',
            confidence: 0,
            isListening: false,
            error: 'Speech recognition timed out. Please try again.'
          });
        }
      }, 10000); // 10 second timeout

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event) => {
        if (hasResult) return;
        hasResult = true;
        cleanup();

        try {
          const result = event.results[0];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;

          resolve({
            transcript: transcript.trim(),
            confidence: confidence || 0.8,
            isListening: false
          });
        } catch (error) {
          console.error('Error processing speech result:', error);
          resolve({
            transcript: '',
            confidence: 0,
            isListening: false,
            error: 'Error processing speech. Please try again.'
          });
        }
      };

      this.recognition.onerror = (event) => {
        if (hasResult) return;
        hasResult = true;
        cleanup();

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
          case 'aborted':
            errorMessage = 'Speech recognition was stopped.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        console.log('Speech recognition error:', event.error);
        resolve({
          transcript: '',
          confidence: 0,
          isListening: false,
          error: errorMessage
        });
      };

      this.recognition.onend = () => {
        if (!hasResult) {
          hasResult = true;
          cleanup();
          resolve({
            transcript: '',
            confidence: 0,
            isListening: false,
            error: 'No speech detected. Please try again.'
          });
        }
      };

      try {
        // Stop any existing recognition first
        this.stopListening();
        
        // Small delay to ensure previous recognition is stopped
        setTimeout(() => {
          try {
            this.recognition?.start();
          } catch (error) {
            if (!hasResult) {
              hasResult = true;
              cleanup();
              reject(new Error('Failed to start speech recognition: ' + (error as Error).message));
            }
          }
        }, 100);
      } catch (error) {
        hasResult = true;
        cleanup();
        reject(new Error('Failed to start speech recognition: ' + (error as Error).message));
      }
    });
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.log('Error stopping speech recognition:', error);
      }
    }
  }
}

export const speechRecognition = new RealSpeechRecognition();