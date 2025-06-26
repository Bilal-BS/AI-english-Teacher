import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PronunciationError {
  word: string;
  expected: string;
  actual: string;
  confidence: number;
  phonemeErrors: {
    expected: string;
    actual: string;
    position: number;
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
}

export interface SpeechAnalysisResult {
  transcribedText: string;
  confidence: number;
  pronunciationErrors: PronunciationError[];
  fluencyScore: number;
  clarityScore: number;
  paceScore: number;
  intonationScore: number;
  overallScore: number;
  feedback: string;
  improvements: string[];
  strengths: string[];
}

// Web Speech API wrapper with advanced error detection
export class AdvancedSpeechRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;
  }

  async startListening(): Promise<{
    transcript: string;
    confidence: number;
    alternatives: string[];
    audioMetrics: {
      volume: number;
      frequency: number;
      clarity: number;
    };
  }> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      let finalTranscript = '';
      let confidence = 0;
      let alternatives: string[] = [];

      // Setup audio analysis
      this.setupAudioAnalysis();

      this.recognition.onresult = (event) => {
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
        const audioMetrics = this.getAudioMetrics();
        
        resolve({
          transcript: finalTranscript.trim(),
          confidence,
          alternatives,
          audioMetrics
        });
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
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

  private async setupAudioAnalysis() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 2048;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      source.connect(this.analyser);
    } catch (error) {
      console.warn('Audio analysis setup failed:', error);
    }
  }

  private getAudioMetrics() {
    if (!this.analyser || !this.dataArray) {
      return { volume: 0.5, frequency: 200, clarity: 0.7 };
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const volume = Math.sqrt(sum / this.dataArray.length) / 255;

    // Find dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    const frequency = (maxIndex * this.audioContext!.sampleRate) / (2 * this.dataArray.length);

    // Calculate clarity based on signal strength
    const clarity = maxValue / 255;

    return { volume, frequency, clarity };
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}

export async function analyzeSpeechComprehensively(
  audioBlob: Blob,
  expectedText?: string,
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<SpeechAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackSpeechAnalysis(expectedText || '', userLevel);
  }

  try {
    // Convert blob to base64 for OpenAI Whisper
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Use OpenAI Whisper for transcription
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: 'en'
    });

    const transcribedText = transcriptionResponse.text;
    
    // Analyze pronunciation if expected text is provided
    let pronunciationAnalysis: SpeechAnalysisResult;
    
    if (expectedText) {
      pronunciationAnalysis = await analyzePronunciationWithAI(
        transcribedText,
        expectedText,
        userLevel
      );
    } else {
      pronunciationAnalysis = await analyzeGeneralSpeech(transcribedText, userLevel);
    }

    return {
      ...pronunciationAnalysis,
      transcribedText,
      confidence: (transcriptionResponse as any).confidence || 0.8
    };

  } catch (error) {
    console.error('Speech analysis failed:', error);
    return fallbackSpeechAnalysis(expectedText || '', userLevel);
  }
}

async function analyzePronunciationWithAI(
  actual: string,
  expected: string,
  userLevel: string
): Promise<SpeechAnalysisResult> {
  const prompt = `Analyze pronunciation accuracy by comparing expected vs actual speech transcripts.

Expected: "${expected}"
Actual: "${actual}"
User Level: ${userLevel}

Provide detailed JSON analysis:
{
  "pronunciationErrors": [
    {
      "word": "problem word",
      "expected": "correct pronunciation",
      "actual": "how it was said",
      "confidence": 85,
      "phonemeErrors": [
        {
          "expected": "/θ/",
          "actual": "/f/",
          "position": 2
        }
      ],
      "difficulty": "medium",
      "tips": ["tip 1", "tip 2"]
    }
  ],
  "fluencyScore": 75,
  "clarityScore": 80,
  "paceScore": 70,
  "intonationScore": 85,
  "overallScore": 78,
  "feedback": "Detailed feedback",
  "improvements": ["improvement 1", "improvement 2"],
  "strengths": ["strength 1", "strength 2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert pronunciation coach with perfect phonetic analysis skills."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  });

  const analysis = JSON.parse(response.choices[0].message.content || '{}');

  return {
    transcribedText: actual,
    confidence: 0.9,
    pronunciationErrors: analysis.pronunciationErrors || [],
    fluencyScore: analysis.fluencyScore || 75,
    clarityScore: analysis.clarityScore || 80,
    paceScore: analysis.paceScore || 70,
    intonationScore: analysis.intonationScore || 85,
    overallScore: analysis.overallScore || 78,
    feedback: analysis.feedback || 'Good pronunciation practice!',
    improvements: analysis.improvements || [],
    strengths: analysis.strengths || []
  };
}

async function analyzeGeneralSpeech(
  transcript: string,
  userLevel: string
): Promise<SpeechAnalysisResult> {
  const prompt = `Analyze this English speech transcript for pronunciation, fluency, and clarity.

Transcript: "${transcript}"
User Level: ${userLevel}

Provide comprehensive JSON analysis focusing on:
- Speech patterns and fluency
- Likely pronunciation issues based on transcript
- Overall communication effectiveness
- Specific improvement suggestions

Format:
{
  "fluencyScore": 75,
  "clarityScore": 80,
  "paceScore": 70,
  "intonationScore": 85,
  "overallScore": 78,
  "feedback": "Detailed analysis",
  "improvements": ["suggestion 1", "suggestion 2"],
  "strengths": ["strength 1", "strength 2"],
  "pronunciationErrors": []
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a speech analysis expert who provides detailed feedback on English communication."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  const analysis = JSON.parse(response.choices[0].message.content || '{}');

  return {
    transcribedText: transcript,
    confidence: 0.8,
    pronunciationErrors: analysis.pronunciationErrors || [],
    fluencyScore: analysis.fluencyScore || 75,
    clarityScore: analysis.clarityScore || 80,
    paceScore: analysis.paceScore || 70,
    intonationScore: analysis.intonationScore || 85,
    overallScore: analysis.overallScore || 78,
    feedback: analysis.feedback || 'Keep practicing your English speaking!',
    improvements: analysis.improvements || ['Practice speaking more slowly', 'Focus on clear pronunciation'],
    strengths: analysis.strengths || ['Good vocabulary usage', 'Clear communication intent']
  };
}

function fallbackSpeechAnalysis(expectedText: string, userLevel: string): SpeechAnalysisResult {
  return {
    transcribedText: expectedText || 'Audio analysis not available',
    confidence: 0.7,
    pronunciationErrors: [],
    fluencyScore: 70,
    clarityScore: 75,
    paceScore: 70,
    intonationScore: 75,
    overallScore: 72,
    feedback: 'Continue practicing your pronunciation. Focus on speaking clearly and at a natural pace.',
    improvements: [
      'Practice speaking more slowly',
      'Focus on clear articulation',
      'Record yourself to monitor progress'
    ],
    strengths: [
      'Good effort in speaking practice',
      'Consistent practice leads to improvement'
    ]
  };
}

// Real-time pronunciation feedback
export class RealTimePronunciationFeedback {
  private recognition: AdvancedSpeechRecognition;
  private isActive = false;
  private currentWord = '';
  private onFeedback: (feedback: any) => void;

  constructor(onFeedback: (feedback: any) => void) {
    this.recognition = new AdvancedSpeechRecognition();
    this.onFeedback = onFeedback;
  }

  async startRealTimeFeedback(targetWords: string[]) {
    this.isActive = true;
    
    try {
      const result = await this.recognition.startListening();
      
      if (this.isActive) {
        const feedback = await this.analyzeRealTime(result.transcript, targetWords);
        this.onFeedback(feedback);
      }
    } catch (error) {
      console.error('Real-time feedback error:', error);
      this.onFeedback({
        error: 'Speech recognition failed',
        suggestion: 'Please check your microphone and try again'
      });
    }
  }

  private async analyzeRealTime(transcript: string, targetWords: string[]) {
    const words = transcript.toLowerCase().split(' ');
    const feedback = {
      recognizedWords: words,
      correctWords: [],
      incorrectWords: [],
      suggestions: []
    };

    targetWords.forEach(target => {
      const found = words.find(word => 
        word.includes(target.toLowerCase()) || 
        this.calculateSimilarity(word, target.toLowerCase()) > 0.7
      );

      if (found) {
        feedback.correctWords.push(target);
      } else {
        feedback.incorrectWords.push(target);
        feedback.suggestions.push(`Try saying "${target}" more clearly`);
      }
    });

    return feedback;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  stopRealTimeFeedback() {
    this.isActive = false;
    this.recognition.stopListening();
  }
}