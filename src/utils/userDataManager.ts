export interface UserData {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  lastActiveAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dailyGoal: number;
  reminderTime?: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  nativeLanguage?: string;
  learningGoals?: string[];
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  timeSpent: number; // in minutes
  completedAt?: Date;
  exercises: ExerciseProgress[];
}

export interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  bestScore?: number;
  transcript?: string;
  feedback?: string[];
}

export interface UserStats {
  totalLessons: number;
  completedLessons: number;
  currentStreak: number;
  longestStreak: number;
  totalScore: number;
  averageScore: number;
  totalTimeSpent: number;
  lessonsToday: number;
  lastLessonDate?: Date;
}

class UserDataManager {
  private readonly STORAGE_KEYS = {
    USER_DATA: 'speakAI_userData',
    LESSON_PROGRESS: 'speakAI_lessonProgress',
    USER_STATS: 'speakAI_userStats',
    ACHIEVEMENTS: 'speakAI_achievements'
  };

  // User Data Management
  public createUser(name: string, email?: string): UserData {
    const userData: UserData = {
      id: this.generateUserId(),
      name,
      email,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      preferences: {
        dailyGoal: 3,
        difficultyLevel: 'beginner',
        focusAreas: ['pronunciation', 'conversation']
      }
    };

    this.saveUserData(userData);
    return userData;
  }

  public getUserData(): UserData | null {
    const data = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastActiveAt: new Date(parsed.lastActiveAt)
      };
    } catch {
      return null;
    }
  }

  public saveUserData(userData: UserData): void {
    userData.lastActiveAt = new Date();
    localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  public updateUserPreferences(preferences: Partial<UserPreferences>): void {
    const userData = this.getUserData();
    if (userData) {
      userData.preferences = { ...userData.preferences, ...preferences };
      this.saveUserData(userData);
    }
  }

  // Lesson Progress Management
  public getLessonProgress(lessonId: string): LessonProgress | null {
    const allProgress = this.getAllLessonProgress();
    return allProgress.find(p => p.lessonId === lessonId) || null;
  }

  public getAllLessonProgress(): LessonProgress[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.LESSON_PROGRESS);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((p: any) => ({
        ...p,
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined
      }));
    } catch {
      return [];
    }
  }

  public saveLessonProgress(progress: LessonProgress): void {
    const allProgress = this.getAllLessonProgress();
    const existingIndex = allProgress.findIndex(p => p.lessonId === progress.lessonId);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }

    localStorage.setItem(this.STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(allProgress));
    this.updateUserStats();
  }

  public updateExerciseProgress(
    lessonId: string, 
    exerciseId: string, 
    score: number, 
    transcript: string, 
    feedback: string[]
  ): void {
    let lessonProgress = this.getLessonProgress(lessonId);
    
    if (!lessonProgress) {
      const userData = this.getUserData();
      lessonProgress = {
        lessonId,
        userId: userData?.id || 'anonymous',
        completed: false,
        attempts: 0,
        timeSpent: 0,
        exercises: []
      };
    }

    const exerciseIndex = lessonProgress.exercises.findIndex(e => e.exerciseId === exerciseId);
    const exerciseProgress: ExerciseProgress = {
      exerciseId,
      completed: score >= 60, // Consider 60% as passing
      score,
      attempts: exerciseIndex >= 0 ? lessonProgress.exercises[exerciseIndex].attempts + 1 : 1,
      bestScore: exerciseIndex >= 0 
        ? Math.max(lessonProgress.exercises[exerciseIndex].bestScore || 0, score)
        : score,
      transcript,
      feedback
    };

    if (exerciseIndex >= 0) {
      lessonProgress.exercises[exerciseIndex] = exerciseProgress;
    } else {
      lessonProgress.exercises.push(exerciseProgress);
    }

    lessonProgress.attempts += 1;
    this.saveLessonProgress(lessonProgress);
  }

  public completeLessonProgress(lessonId: string, totalScore: number, timeSpent: number): void {
    let lessonProgress = this.getLessonProgress(lessonId);
    
    if (!lessonProgress) {
      const userData = this.getUserData();
      lessonProgress = {
        lessonId,
        userId: userData?.id || 'anonymous',
        completed: false,
        attempts: 0,
        timeSpent: 0,
        exercises: []
      };
    }

    lessonProgress.completed = true;
    lessonProgress.score = totalScore;
    lessonProgress.timeSpent += timeSpent;
    lessonProgress.completedAt = new Date();

    this.saveLessonProgress(lessonProgress);
  }

  // User Statistics
  public getUserStats(): UserStats {
    const data = localStorage.getItem(this.STORAGE_KEYS.USER_STATS);
    let stats: UserStats;

    if (data) {
      try {
        const parsed = JSON.parse(data);
        stats = {
          ...parsed,
          lastLessonDate: parsed.lastLessonDate ? new Date(parsed.lastLessonDate) : undefined
        };
      } catch {
        stats = this.getDefaultStats();
      }
    } else {
      stats = this.getDefaultStats();
    }

    return stats;
  }

  private getDefaultStats(): UserStats {
    return {
      totalLessons: 0,
      completedLessons: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalScore: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      lessonsToday: 0
    };
  }

  public updateUserStats(): void {
    const allProgress = this.getAllLessonProgress();
    const completedLessons = allProgress.filter(p => p.completed);
    
    const totalScore = completedLessons.reduce((sum, p) => sum + (p.score || 0), 0);
    const averageScore = completedLessons.length > 0 ? Math.round(totalScore / completedLessons.length) : 0;
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);

    // Calculate streak
    const { currentStreak, longestStreak } = this.calculateStreaks(completedLessons);
    
    // Calculate lessons today
    const today = new Date();
    const lessonsToday = completedLessons.filter(p => 
      p.completedAt && this.isSameDay(p.completedAt, today)
    ).length;

    const stats: UserStats = {
      totalLessons: allProgress.length,
      completedLessons: completedLessons.length,
      currentStreak,
      longestStreak,
      totalScore,
      averageScore,
      totalTimeSpent,
      lessonsToday,
      lastLessonDate: completedLessons.length > 0 
        ? new Date(Math.max(...completedLessons.map(p => p.completedAt?.getTime() || 0)))
        : undefined
    };

    localStorage.setItem(this.STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  }

  private calculateStreaks(completedLessons: LessonProgress[]): { currentStreak: number; longestStreak: number } {
    if (completedLessons.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Sort by completion date
    const sortedLessons = completedLessons
      .filter(p => p.completedAt)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

    if (sortedLessons.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get unique days
    const uniqueDays = Array.from(new Set(
      sortedLessons.map(p => this.getDateString(p.completedAt!))
    )).sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Calculate current streak
    for (let i = 0; i < uniqueDays.length; i++) {
      const dayDate = new Date(uniqueDays[i]);
      
      if (i === 0) {
        // First day should be today or yesterday
        if (this.isSameDay(dayDate, today) || this.isSameDay(dayDate, yesterday)) {
          currentStreak = 1;
          tempStreak = 1;
        } else {
          break;
        }
      } else {
        const prevDate = new Date(uniqueDays[i - 1]);
        const diffDays = Math.floor((prevDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 0;
    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(uniqueDays[i]);
        const prevDate = new Date(uniqueDays[i - 1]);
        const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Clear all data (for testing or reset)
  public clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const userDataManager = new UserDataManager();