
export enum ContentType {
  VALUE = 'VALUE', // 70%
  RELATIONSHIP = 'RELATIONSHIP', // 20%
  SALES = 'SALES' // 10%
}

export enum BrandMood {
  PROFESSIONAL = 'PROFESSIONAL',
  FRIENDLY = 'FRIENDLY',
  EMOTIONAL = 'EMOTIONAL',
  ENERGETIC = 'ENERGETIC'
}

export enum PostFormat {
  CAROUSEL = 'CAROUSEL',
  SINGLE = 'SINGLE',
  REELS = 'REELS'
}

export interface DailyContext {
  weather: string;
  mood: string;
  event: string;
  story: string;
}

export interface KnowledgeItem {
  id: string;
  type: 'file' | 'text';
  title: string;
  content: string;
  timestamp: number;
}

export interface GeneratedPost {
  title: string;
  slides: string[];
  caption: string;
  hashtags: string[];
  strategyType: ContentType;
  brandMood: BrandMood;
}

export interface SavedPost extends GeneratedPost {
  id: string;
  savedAt: number;
}
