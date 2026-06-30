export type UserRole = 'parent' | 'student';

export type PersonalityType = 'difficult' | 'irritable' | 'timid' | 'hurried' | 'skeptical' | 'friendly';

export type DifficultyLevel = 'strict' | 'mixed' | 'extreme';

export interface TrainingConfig {
  role: UserRole;
  personality: PersonalityType;
  difficulty: DifficultyLevel;
  customPersonality?: string;
}

export interface AdmissionsDoc {
  id: string;
  title: string;
  content: string;
  category: 'tuition' | 'curriculum' | 'scholarship' | 'faq' | 'general';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AssessmentItem {
  question: string;
  userAnswer: string;
  isCorrect: 'correct' | 'partially' | 'incorrect' | 'not_applicable';
  evaluation: string; // analysis of correct/wrong/missing info compared to background docs
  sampleAnswer: string; // perfect sample response
  handlingTips: string; // suggestions on handling the asker's attitude (e.g., cooling down angry parents)
}

export interface EvaluationReport {
  overallScore: number; // Scale 0-100
  criteria: {
    accuracy: { score: number; comment: string }; // 0-10
    persuasiveness: { score: number; comment: string }; // 0-10
    attitude: { score: number; comment: string }; // 0-10
  };
  detailedAssessments: AssessmentItem[];
  generalAdvice: string;
}
