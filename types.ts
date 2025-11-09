export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface MangaPanel {
  scene: string;
  dialogue: string[];
  narration: string | null;
  emotion: string;
  imageUrl: string | null | 'error';
}

export interface Chapter {
  id: string;
  name:string;
  sourceFile: {
    name: string;
    content: string;
    type: 'text' | 'image' | 'file';
    mimeType?: string;
  } | null;
  summary: string | null;
  quiz: QuizQuestion[] | null;
  mangaScript: MangaPanel[] | null;
  flashcards: Flashcard[] | null;
}

export interface Course {
    id: string;
    name: string;
    chapters: Chapter[];
}

export type ActiveTab = 'summary' | 'quiz' | 'manga' | 'flashcards';