export type Role = 'quant' | 'data' | 'swe' | 'fund';

export interface StructuredComponent {
  label: string;
  description: string;
}

export type CodeLanguage = 'javascript' | 'cpp' | 'mql5' | 'python' | 'sql';
export type AppSection = 'interview' | 'coding';

export interface CodeHelp {
  title: string;
  language: CodeLanguage;
  language_options: CodeLanguage[];
  goal: string;
  steps: string[];
  starter_code: string;
  notes: string[];
}

export interface StructuredQuestion {
  question_type: 'behavioral' | 'technical';
  clean_question: string;
  what_they_really_want: string;
  components: StructuredComponent[];
  recommended_framework: string;
  framework_reason: string;
  code_help?: CodeHelp;
}

export interface IdealBlock {
  label: string;
  content: string;
}

export interface CoachingResult {
  strength: string;
  missing: string;
  structure_tip: string;
  ideal_blocks: IdealBlock[];
  score: number;
}

export interface BulletScript {
  intro: string;
  bullets: string[];
  close: string;
}

export type BadgeState = 'waiting' | 'active' | 'done';

export interface StepBadge {
  state: BadgeState;
  label: string;
}
