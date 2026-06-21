-- SQL SETUP FOR KHO HỌC LIỆU NGỮ VĂN THCS CO VO THI KIM LIEN
-- Copy and paste this script into your Supabase project (SQL Editor) to create the tables.

-- 1. Table users (for login and register)
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  points INTEGER DEFAULT 0,
  progress TEXT DEFAULT '0%',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table lessons
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  grade TEXT NOT NULL,
  content TEXT NOT NULL,
  embed_url TEXT,
  author TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table students
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  last_active TEXT,
  lesson_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table gradebook
CREATE TABLE IF NOT EXISTS gradebook (
  student_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  score_quiz1 NUMERIC DEFAULT 0,
  score_quiz2 NUMERIC DEFAULT 0,
  score_exam NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table announcements
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSERT INITIAL ADMIN USER
INSERT INTO users (username, password, name, class, role, points, progress)
VALUES ('admin', 'admin', 'Cô Võ Thị Kim Liên', 'Trần Quý Cáp', 'teacher', 999, 'Quản trị')
ON CONFLICT (username) DO NOTHING;
