export interface Lesson {
  id: string;
  title: string;
  category: "DOC" | "VIET" | "NOI_NGHE";
  grade: string;
  content: string;
  embedUrl: string;
  author: string;
  downloads: number;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  lastActive: string;
  lessonCount: number;
}

export interface GradeRecord {
  studentId: string;
  name: string;
  class: string;
  scoreQuiz1: number; // Đề số 1
  scoreQuiz2: number; // Đề giữa kỳ / Đề số 2
  scoreExam: number;  // Học tập tích lũy
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correctIndex: number;
}

export interface GameQuestion {
  q: string;
  options: string[];
  correctIndex: number;
}

export interface User {
  username: string;
  name: string;
  class: string;
  role: "guest" | "student" | "teacher";
  points: number;
  progress: string; // "75%", "0%" etc
}
