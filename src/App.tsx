import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  House, 
  FilePen, 
  Gamepad, 
  UserCheck, 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  Search, 
  Download, 
  Award, 
  Users, 
  Clock, 
  Plus, 
  Trash2, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle, 
  ArrowRight,
  Eye,
  FileSpreadsheet,
  PlusCircle,
  HelpCircle,
  Lock,
  Gift
} from "lucide-react";
import { Lesson, Student, GradeRecord, Announcement, User } from "./types";
import { initialLessons, initialStudents, initialGradebook, quizQuestions, gameQuestions } from "./data";
import { supabase } from "./supabaseClient";

export default function App() {
  // --- CORE DATA STATE ---
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [gradebook, setGradebook] = useState<GradeRecord[]>([]);
  const [activeView, setActiveView] = useState<string>("trang-chu");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  
  // --- SEARCH & FILTERS ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [leaderboardClassFilter, setLeaderboardClassFilter] = useState<string>("all");
  const [teacherStudentFilter, setTeacherStudentFilter] = useState<string>("6/1");
  const [teacherStudentSearch, setTeacherStudentSearch] = useState<string>("");

  // Announcements list (Dynamic from Supabase)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // --- SEED SYSTEM & SYNC WORKSPACE ON FIRST RUN ---
  useEffect(() => {
    const initDatabase = async () => {
      // 1. Fetch & Seed Announcements
      try {
        const { data: dbAnnouncements, error: annError } = await supabase
          .from("announcements")
          .select("*");
        
        if (annError) throw annError;
        if (!dbAnnouncements || dbAnnouncements.length === 0) {
          const initialAnnouncements = [
            {
              id: "A1",
              title: "Thông báo ôn tập thi học kỳ II",
              content: "Các em hãy lưu ý tự học các tác phẩm truyền thuyết và cấu trúc thơ lục bát để kiểm tra đạt kết quả xuất sắc nhất nhé.",
              date: "25/03/2026"
            },
            {
              id: "A2",
              title: "Cập nhật đề trắc nghiệm chấm điểm tự động",
              content: "Cô đã đăng tải thêm bộ đề trắc nghiệm tương tác mới cho học sinh khối lớp 6 và khối 7 trong kho bài tập.",
              date: "12/03/2026"
            }
          ];
          await supabase.from("announcements").insert(initialAnnouncements);
          setAnnouncements(initialAnnouncements);
        } else {
          setAnnouncements(dbAnnouncements);
        }
      } catch (err) {
        console.warn("Supabase load error for announcements, falling back to initial data:", err);
        setAnnouncements([
          {
            id: "A1",
            title: "Thông báo ôn tập thi học kỳ II",
            content: "Các em hãy lưu ý tự học các tác phẩm truyền thuyết và cấu trúc thơ lục bát để kiểm tra đạt kết quả xuất sắc nhất nhé.",
            date: "25/03/2026"
          },
          {
            id: "A2",
            title: "Cập nhật đề trắc nghiệm chấm điểm tự động",
            content: "Cô đã đăng tải thêm bộ đề trắc nghiệm tương tác mới cho học sinh khối lớp 6 và khối 7 trong kho bài tập.",
            date: "12/03/2026"
          }
        ]);
      }

      // 2. Fetch & Seed Lessons
      try {
        const { data: dbLessons, error: lesError } = await supabase
          .from("lessons")
          .select("*")
          .order("id");
        
        if (lesError) throw lesError;
        if (!dbLessons || dbLessons.length === 0) {
          await supabase.from("lessons").insert(initialLessons.map(l => ({
            id: l.id,
            title: l.title,
            category: l.category,
            grade: l.grade,
            content: l.content,
            embed_url: l.embedUrl || "",
            author: l.author,
            downloads: l.downloads
          })));
          setLessons(initialLessons);
        } else {
          const mappedLessons: Lesson[] = dbLessons.map(dl => ({
            id: dl.id,
            title: dl.title,
            category: dl.category as any,
            grade: dl.grade,
            content: dl.content,
            embedUrl: dl.embed_url || "",
            author: dl.author || "Cô Võ Thị Kim Liên",
            downloads: dl.downloads || 0
          }));
          setLessons(mappedLessons);
        }
      } catch (err) {
        console.warn("Using local fallback for lessons:", err);
        const cached = localStorage.getItem("lms_lessons");
        setLessons(cached ? JSON.parse(cached) : initialLessons);
      }

      // 3. Fetch & Seed Students
      try {
        const { data: dbStudents, error: studError } = await supabase
          .from("students")
          .select("*")
          .order("id");
        
        if (studError) throw studError;
        if (!dbStudents || dbStudents.length === 0) {
          await supabase.from("students").insert(initialStudents.map(s => ({
            id: s.id,
            name: s.name,
            class: s.class,
            last_active: s.lastActive,
            lesson_count: s.lessonCount
          })));
          setStudents(initialStudents);
        } else {
          const mappedStudents: Student[] = dbStudents.map(ds => ({
            id: ds.id,
            name: ds.name,
            class: ds.class,
            lastActive: ds.last_active || "Vừa xong",
            lessonCount: ds.lesson_count || 0
          }));
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.warn("Using local fallback for students:", err);
        const cached = localStorage.getItem("lms_students");
        setStudents(cached ? JSON.parse(cached) : initialStudents);
      }

      // 4. Fetch & Seed Gradebook
      try {
        const { data: dbGrades, error: gradeError } = await supabase
          .from("gradebook")
          .select("*");
        
        if (gradeError) throw gradeError;
        if (!dbGrades || dbGrades.length === 0) {
          await supabase.from("gradebook").insert(initialGradebook.map(g => ({
            student_id: g.studentId,
            name: g.name,
            class: g.class,
            score_quiz1: g.scoreQuiz1,
            score_quiz2: g.scoreQuiz2,
            score_exam: g.scoreExam
          })));
          setGradebook(initialGradebook);
        } else {
          const mappedGrades: GradeRecord[] = dbGrades.map(dg => ({
            studentId: dg.student_id,
            name: dg.name,
            class: dg.class,
            scoreQuiz1: Number(dg.score_quiz1),
            scoreQuiz2: Number(dg.score_quiz2),
            scoreExam: Number(dg.score_exam)
          }));
          setGradebook(mappedGrades);
        }
      } catch (err) {
        console.warn("Using local fallback for gradebook:", err);
        const cached = localStorage.getItem("lms_gradebook");
        setGradebook(cached ? JSON.parse(cached) : initialGradebook);
      }
    };

    initDatabase();
  }, []);

  // --- SAVE DB UPDATES ---
  const updateLessonsState = (newLessons: Lesson[]) => {
    setLessons(newLessons);
    localStorage.setItem("lms_lessons", JSON.stringify(newLessons));
  };

  const updateStudentsState = (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem("lms_students", JSON.stringify(newStudents));
  };

  const updateGradebookState = (newGradebook: GradeRecord[]) => {
    setGradebook(newGradebook);
    localStorage.setItem("lms_gradebook", JSON.stringify(newGradebook));
  };

  // --- SAVE DYNAMIC METRICS FOR LOGGED IN USER ---
  const updatePointsAndProgress = async (username: string, additionalPoints: number, newProgress?: string) => {
    try {
      const { data: userRecord } = await supabase
        .from("users")
        .select("points, progress")
        .eq("username", username)
        .maybeSingle();

      const currentPoints = userRecord?.points || 0;
      const currentProgress = userRecord?.progress || "0%";
      const nextPoints = currentPoints + additionalPoints;
      const nextProgress = newProgress || currentProgress;

      await supabase
        .from("users")
        .update({ points: nextPoints, progress: nextProgress })
        .eq("username", username);

      setLoggedInUser(prev => prev && prev.username === username ? { ...prev, points: nextPoints, progress: nextProgress } : prev);
    } catch (err) {
      console.warn("Could not update points/progress in Supabase:", err);
      // Fallback local upgrade
      setLoggedInUser(prev => prev && prev.username === username ? { ...prev, points: prev.points + additionalPoints, progress: newProgress || prev.progress } : prev);
    }
  };

  // --- AUTHENTICATION & SESSION ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  
  // Form inputs
  const [authUsername, setAuthUsername] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [registerFullname, setRegisterFullname] = useState<string>("");
  const [registerClass, setRegisterClass] = useState<string>("6/1");

  // Mobile menu control
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  // --- INTERACTIVE ASSESSMENT QUIZ STATE ---
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [quizTimer, setQuizTimer] = useState<number>(900); // 15:00 minutes
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // --- "AI LÀ TRIỆU PHÚ" GAME STATE ---
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [currentGameIndex, setCurrentGameIndex] = useState<number>(0);
  const [gameLifelines, setGameLifelines] = useState<{ fiftyFifty: boolean; audience: boolean }>({
    fiftyFifty: true,
    audience: true
  });
  const [gameFadedIndices, setGameFadedIndices] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [gameSelectedAnswer, setGameSelectedAnswer] = useState<{ idx: number; isCorrect: boolean } | null>(null);

  // --- TOAST SYSTEMS ---
  interface Toast {
    id: string;
    text: string;
    type: "pink" | "orange" | "green" | "teal";
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const triggerToast = (text: string, type: "pink" | "orange" | "green" | "teal" = "pink") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Countdown timer for active Quiz
  useEffect(() => {
    let interval: any = null;
    if (quizActive && !quizCompleted && quizTimer > 0) {
      interval = setInterval(() => {
        setQuizTimer(prev => prev - 1);
      }, 1000);
    } else if (quizTimer === 0 && quizActive && !quizCompleted) {
      calculateQuizScore();
    }
    return () => clearInterval(interval);
  }, [quizActive, quizCompleted, quizTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs >= 10 ? secs : "0" + secs}`;
  };

  // --- ACTION CONTROLLERS ---
  const handleRoleChange = (role: string) => {
    if (isLoggedIn) {
      triggerToast("Bạn đang đăng nhập, hãy đăng xuất trước nếu muốn chuyển sang vai trò khác!", "orange");
      return;
    }
    
    if (role === "guest") {
      setActiveView("trang-chu");
      triggerToast("Đã chuyển đổi sang chế độ Khách xem tự do!", "teal");
    } else if (role === "student") {
      // Simulate defaults for guest/sandbox Student role
      setActiveView("cong-hoc-sinh");
      triggerToast("Chào mừng bạn học sinh! Đã kích hoạt không gian học tập.", "orange");
    } else if (role === "teacher") {
      // Prompt Teacher to use admin credentials
      setShowAuthModal(true);
      setAuthTab("login");
      setAuthUsername("admin");
      setAuthPassword("admin");
      triggerToast("Cần đăng nhập tài khoản Quản trị (admin/admin) để truy cập Cổng Giáo Viên!", "pink");
    }
  };

  // Perform administrative check for teacher-only space
  const verifyTeacherAccessAndSwitch = () => {
    if (isLoggedIn && loggedInUser?.role === "teacher") {
      setActiveView("cong-giao-vien");
    } else {
      setShowAuthModal(true);
      setAuthTab("login");
      // Default placeholder text to help users test admin access easily
      setAuthUsername("admin");
      setAuthPassword("admin");
      triggerToast("Vui lòng đăng nhập với tài khoản Quản trị: admin / admin", "pink");
    }
  };

  // --- SIGN IN / SIGN OUT SUBMIT ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authTab === "login") {
      try {
        const { data: dbUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", authUsername)
          .maybeSingle();

        if (error) throw error;

        if (dbUser) {
          if (dbUser.password === authPassword) {
            const matchedUser: User = {
              username: dbUser.username,
              name: dbUser.name,
              class: dbUser.class,
              role: dbUser.role as any,
              points: dbUser.points || 0,
              progress: dbUser.progress || "0%"
            };
            setLoggedInUser(matchedUser);
            setIsLoggedIn(true);
            setShowAuthModal(false);
            if (matchedUser.role === "teacher") {
              setActiveView("cong-giao-vien");
              triggerToast("Đăng nhập QUẢN TRỊ viên học đường thành công!", "pink");
            } else {
              setActiveView("cong-hoc-sinh");
              triggerToast(`Đăng nhập thành công! Xin chào ${matchedUser.name}.`, "green");
            }
          } else {
            triggerToast("Sai mật khẩu đăng nhập, vui lòng kiểm tra lại!", "orange");
          }
        } else {
          // If admin/admin fallback is used but not found in DB
          if (authUsername === "admin" && authPassword === "admin") {
            const adminTeacher: User = {
              username: "admin",
              name: "Cô Võ Thị Kim Liên",
              class: "Trần Quý Cáp",
              role: "teacher",
              points: 999,
              progress: "Quản trị"
            };
            try {
              await supabase.from("users").insert({
                username: "admin",
                password: "admin",
                name: "Cô Võ Thị Kim Liên",
                class: "Trần Quý Cáp",
                role: "teacher",
                points: 999,
                progress: "Quản trị"
              });
            } catch (insErr) {
              console.warn("Error autoinserting admin account:", insErr);
            }
            setLoggedInUser(adminTeacher);
            setIsLoggedIn(true);
            setShowAuthModal(false);
            setActiveView("cong-giao-vien");
            triggerToast("Đăng nhập QUẢN TRỊ viên học đường thành công!", "pink");
          } else {
            // Simulated fallback login for sandbox
            const simulatedStudent: User = {
              username: authUsername,
              name: authUsername.split("@")[0] || "Học sinh 1",
              class: "6/1",
              role: "student",
              points: 120,
              progress: "75%"
            };
            setLoggedInUser(simulatedStudent);
            setIsLoggedIn(true);
            setShowAuthModal(false);
            setActiveView("cong-hoc-sinh");
            triggerToast(`Đăng nhập (Chế độ mô phỏng tự do)! Chào ${simulatedStudent.name}.`, "green");
          }
        }
      } catch (err) {
        console.warn("Auth error with Supabase, falling back to local admin check:", err);
        if (authUsername === "admin" && authPassword === "admin") {
          const adminTeacher: User = {
            username: "admin",
            name: "Cô Võ Thị Kim Liên",
            class: "Trần Quý Cáp",
            role: "teacher",
            points: 999,
            progress: "Quản trị"
          };
          setLoggedInUser(adminTeacher);
          setIsLoggedIn(true);
          setShowAuthModal(false);
          setActiveView("cong-giao-vien");
          triggerToast("Đăng nhập QUẢN TRỊ viên học đường (Cục bộ) thành công!", "pink");
        } else {
          const simulatedStudent: User = {
            username: authUsername,
            name: authUsername.split("@")[0] || "Học sinh 1",
            class: "6/1",
            role: "student",
            points: 120,
            progress: "75%"
          };
          setLoggedInUser(simulatedStudent);
          setIsLoggedIn(true);
          setShowAuthModal(false);
          setActiveView("cong-hoc-sinh");
          triggerToast(`Đăng nhập thành công!`, "green");
        }
      }
    } else {
      // Register logic
      const fullName = registerFullname.trim() || "Thành viên mới";
      const simulatedStudent: User = {
        username: authUsername || "hocsinh_moi",
        name: fullName,
        class: registerClass,
        role: "student",
        points: 50,
        progress: "25%"
      };

      const newId = `HS0${students.length + 1}`;
      const newStudentEntry: Student = {
        id: newId,
        name: fullName,
        class: registerClass,
        lastActive: "Vừa đăng ký",
        lessonCount: 1
      };
      
      const newGradeEntry: GradeRecord = {
        studentId: newId,
        name: fullName,
        class: registerClass,
        scoreQuiz1: 0,
        scoreQuiz2: 0,
        scoreExam: 0
      };

      try {
        await supabase.from("users").insert({
          username: authUsername || "hocsinh_moi",
          password: authPassword,
          name: fullName,
          class: registerClass,
          role: "student",
          points: 50,
          progress: "25%"
        });

        await supabase.from("students").insert({
          id: newId,
          name: fullName,
          class: registerClass,
          last_active: "Vừa đăng ký",
          lesson_count: 1
        });

        await supabase.from("gradebook").insert({
          student_id: newId,
          name: fullName,
          class: registerClass,
          score_quiz1: 0,
          score_quiz2: 0,
          score_exam: 0
        });
      } catch (err) {
        console.warn("Supabase registration insert error:", err);
      }

      updateStudentsState([...students, newStudentEntry]);
      updateGradebookState([...gradebook, newGradeEntry]);

      setLoggedInUser(simulatedStudent);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setActiveView("cong-hoc-sinh");
      triggerToast(`Đăng ký tài khoản thành công cho em ${fullName}!`, "teal");
    }

    // Reset inputs
    setAuthUsername("");
    setAuthPassword("");
    setRegisterFullname("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setActiveView("trang-chu");
    triggerToast("Hệ thống đã đăng xuất tài khoản an toàn.", "orange");
  };

  // --- QUIZ GAME LOGIC ---
  const startQuiz = () => {
    setQuizActive(true);
    setCurrentQuizIndex(0);
    setStudentAnswers([null, null, null, null]);
    setQuizTimer(900);
    setQuizCompleted(false);
    setQuizScore(0);
    triggerToast("Bắt đầu bài kiểm tra 15 phút ôn tập trắc nghiệm!", "green");
  };

  const selectQuizAnswer = (optionIdx: number) => {
    const updatedAnswers = [...studentAnswers];
    updatedAnswers[currentQuizIndex] = optionIdx;
    setStudentAnswers(updatedAnswers);
  };

  const calculateQuizScore = async () => {
    let corrects = 0;
    quizQuestions.forEach((q, idx) => {
      if (studentAnswers[idx] === q.correctIndex) {
        corrects++;
      }
    });

    const score = parseFloat(((corrects / quizQuestions.length) * 10).toFixed(1));
    setQuizScore(score);
    setQuizCompleted(true);

    // Update loggedInUser points if applicable
    if (isLoggedIn && loggedInUser) {
      const awardedPoints = corrects * 20;
      updatePointsAndProgress(loggedInUser.username, awardedPoints);
    }

    // Register score for matching student
    let targetStudentId = "HS001";
    if (isLoggedIn && loggedInUser) {
      const match = students.find(s => s.name === loggedInUser.name);
      if (match) targetStudentId = match.id;
    }

    const updatedGradebook = gradebook.map(g => {
      if (g.studentId === targetStudentId) {
        return { ...g, scoreQuiz1: score };
      }
      return g;
    });

    try {
      await supabase
        .from("gradebook")
        .update({ score_quiz1: score })
        .eq("student_id", targetStudentId);
    } catch (err) {
      console.warn("Failed to update quiz1 score in Supabase:", err);
    }
    updateGradebookState(updatedGradebook);

    // Increment student's lesson tracker
    const updatedStudents = students.map(s => {
      if (s.id === targetStudentId) {
        return { ...s, lessonCount: s.lessonCount + 1, lastActive: "Hoàn tất bài kiểm tra" };
      }
      return s;
    });

    try {
      const matchStudent = students.find(s => s.id === targetStudentId);
      if (matchStudent) {
        await supabase
          .from("students")
          .update({
            lesson_count: matchStudent.lessonCount + 1,
            last_active: "Hoàn tất bài kiểm tra"
          })
          .eq("id", targetStudentId);
      }
    } catch (err) {
      console.warn("Failed to update student activity in Supabase:", err);
    }
    updateStudentsState(updatedStudents);

    triggerToast(`Đã chấm điểm! Bạn đạt được ${score} / 10 điểm trắc nghiệm.`, "green");
  };

  // --- "AI LÀ TRIỆU PHÚ" HUD PLAY LOGIC ---
  const startMillionaireGame = () => {
    setGameActive(true);
    setCurrentGameIndex(0);
    setGameLifelines({ fiftyFifty: true, audience: true });
    setGameFadedIndices([]);
    setGameCompleted(false);
    setGameSelectedAnswer(null);
    triggerToast("Chào mừng đến với cuộc chơi trí tuệ 'Ai Là Triệu Phú Ngữ Văn'!", "pink");
  };

  const handleGameAnswerSubmit = (optionIdx: number) => {
    if (gameSelectedAnswer !== null) return; // Prevent double click

    const currentQ = gameQuestions[currentGameIndex];
    const isCorrect = optionIdx === currentQ.correctIndex;
    setGameSelectedAnswer({ idx: optionIdx, isCorrect });

    if (isCorrect) {
      if (isLoggedIn && loggedInUser) {
        updatePointsAndProgress(loggedInUser.username, 50);
      }
      triggerToast("Lựa chọn hoàn toàn chính xác! Tiến vào câu hỏi tiếp theo.", "green");
      setTimeout(() => {
        if (currentGameIndex < gameQuestions.length - 1) {
          setCurrentGameIndex(prev => prev + 1);
          setGameSelectedAnswer(null);
          setGameFadedIndices([]);
        } else {
          // Final Victory!
          setGameCompleted(true);
          
          let targetStudentId = "HS001";
          if (isLoggedIn && loggedInUser) {
            const match = students.find(s => s.name === loggedInUser.name);
            if (match) targetStudentId = match.id;
          }

          const updatedG = gradebook.map(g => {
            if (g.studentId === targetStudentId) {
              return { ...g, scoreQuiz2: 10.0 };
            }
            return g;
          });

          supabase
            .from("gradebook")
            .update({ score_quiz2: 10.0 })
            .eq("student_id", targetStudentId)
            .then(({ error }) => {
              if (error) console.warn("Failed to save scoreQuiz2 in Supabase:", error);
            });

          updateGradebookState(updatedG);
          triggerToast("Bạn chính là Triệu Phú Trí Tuệ Ngữ Văn! Nhận 10.0 điểm giữa kỳ.", "pink");
        }
      }, 2000);
    } else {
      triggerToast("Rất tiếc! Câu trả lời không chính xác. Hãy ôn luyện bài và chơi lại nhé!", "orange");
      setTimeout(() => {
        setGameActive(false);
        setGameSelectedAnswer(null);
      }, 2500);
    }
  };

  const useGameLifeline = (type: "5050" | "audience") => {
    const currentQ = gameQuestions[currentGameIndex];
    if (type === "5050") {
      // Exclude the correct answer index from selection
      const wrongAnswerIndices: number[] = [];
      currentQ.options.forEach((_, idx) => {
        if (idx !== currentQ.correctIndex) {
          wrongAnswerIndices.push(idx);
        }
      });
      // Pick 2 wrong indices to fade out
      const shuffledWrong = wrongAnswerIndices.sort(() => 0.5 - Math.random());
      setGameFadedIndices([shuffledWrong[0], shuffledWrong[1]]);
      setGameLifelines(prev => ({ ...prev, fiftyFifty: false }));
      triggerToast("Hệ thống trợ giúp đã loại bỏ hai phương án không chính xác!", "pink");
    } else {
      triggerToast("Ý kiến khán giả: 87% biểu quyết đồng lòng cho phương án chính xác!", "teal");
      setGameLifelines(prev => ({ ...prev, audience: false }));
    }
  };

  // --- TEACHER SUB-SERVICES (CMS, Student Mgmt, Excel Output) ---
  const [cmsTitle, setCmsTitle] = useState("");
  const [cmsCategory, setCmsCategory] = useState<"DOC" | "VIET" | "NOI_NGHE">("DOC");
  const [cmsGrade, setCmsGrade] = useState("6");
  const [cmsContent, setCmsContent] = useState("");
  const [cmsEmbedUrl, setCmsEmbedUrl] = useState("");

  const handleLessonPublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsTitle.trim() || !cmsContent.trim()) {
      triggerToast("Vui lòng điền đầy đủ tiêu đề và nội dung bài học!", "orange");
      return;
    }

    const nextId = `L${lessons.length + 1}`;
    const newLesson: Lesson = {
      id: nextId,
      title: cmsTitle.trim(),
      category: cmsCategory,
      grade: cmsGrade,
      content: cmsContent.trim(),
      embedUrl: cmsEmbedUrl.trim(),
      author: loggedInUser?.name || "Cô Võ Thị Kim Liên",
      downloads: 0
    };

    try {
      await supabase.from("lessons").insert({
        id: nextId,
        title: cmsTitle.trim(),
        category: cmsCategory,
        grade: cmsGrade,
        content: cmsContent.trim(),
        embed_url: cmsEmbedUrl.trim(),
        author: loggedInUser?.name || "Cô Võ Thị Kim Liên",
        downloads: 0
      });
    } catch (err) {
      console.warn("Failed to insert new lesson in Supabase:", err);
    }

    updateLessonsState([...lessons, newLesson]);
    setCmsTitle("");
    setCmsContent("");
    setCmsEmbedUrl("");
    triggerToast("Học liệu mới đã được biên soạn và phân phối thành công!", "pink");
  };

  const handleDeleteLesson = async (id: string) => {
    const filter = lessons.filter(l => l.id !== id);
    try {
      await supabase
        .from("lessons")
        .delete()
        .eq("id", id);
    } catch (err) {
      console.warn("Failed to delete lesson in Supabase:", err);
    }
    updateLessonsState(filter);
    triggerToast("Đã gỡ bài học thành công khỏi kho lưu trữ.", "orange");
  };

  // Student list add and delete
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("6/1");
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);

  const handleNewStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newId = `HS0${students.length + 1}`;
    const newStudent: Student = {
      id: newId,
      name: newStudentName.trim(),
      class: newStudentClass,
      lastActive: "Mới đăng ký",
      lessonCount: 0
    };

    const newGrade: GradeRecord = {
      studentId: newId,
      name: newStudentName.trim(),
      class: newStudentClass,
      scoreQuiz1: 0,
      scoreQuiz2: 0,
      scoreExam: 0
    };

    try {
      await supabase.from("students").insert({
        id: newId,
        name: newStudentName.trim(),
        class: newStudentClass,
        last_active: "Mới đăng ký",
        lesson_count: 0
      });

      await supabase.from("gradebook").insert({
        student_id: newId,
        name: newStudentName.trim(),
        class: newStudentClass,
        score_quiz1: 0,
        score_quiz2: 0,
        score_exam: 0
      });
    } catch (err) {
      console.warn("Failed to save new student in Supabase:", err);
    }

    updateStudentsState([...students, newStudent]);
    updateGradebookState([...gradebook, newGrade]);
    setNewStudentName("");
    setShowAddStudentForm(false);
    triggerToast(`Đã thêm em học sinh ${newStudent.name} thành công.`, "green");
  };

  const handleDeleteStudent = async (id: string) => {
    const filterS = students.filter(s => s.id !== id);
    const filterG = gradebook.filter(g => g.studentId !== id);
    try {
      await supabase
        .from("gradebook")
        .delete()
        .eq("student_id", id);

      await supabase
        .from("students")
        .delete()
        .eq("id", id);
    } catch (err) {
      console.warn("Failed to delete student from Supabase:", err);
    }
    updateStudentsState(filterS);
    updateGradebookState(filterG);
    triggerToast("Đã xóa hồ sơ học sinh khỏi bảng lưu cứu lớp.", "orange");
  };

  // CSV Excel download exporter
  const downloadGradebookCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Họ và tên,Lớp,Đề số 1,Đề số 2,Học tập tích lũy,Trung bình\n";
    gradebook.forEach(r => {
      const avg = ((r.scoreQuiz1 + r.scoreQuiz2 + r.scoreExam) / 3).toFixed(1);
      csvContent += `"${r.name}","Lớp ${r.class}",${r.scoreQuiz1},${r.scoreQuiz2},${r.scoreExam},${avg}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bang_Diem_Nguy_Van_THCS_Co_Kim_Liên.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Sổ điểm lớp đã được tải xuống dưới dạng tệp CSV!", "teal");
  };

  // Helper avatar generator
  const getAvatarInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  // Filtering students dynamically
  const filteredStudents = students.filter(s => {
    const matchesClass = s.class === teacherStudentFilter;
    const matchesQuery = s.name.toLowerCase().includes(teacherStudentSearch.toLowerCase());
    return matchesClass && matchesQuery;
  });

  // Calculate stats for teachers
  const totalStudentsCombined = students.length + 156;
  const avgClassScoreDecimal = parseFloat(
    (
      gradebook.reduce((sum, r) => sum + (r.scoreQuiz1 + r.scoreQuiz2 + r.scoreExam) / 3, 0) /
      (gradebook.length || 1)
    ).toFixed(1)
  );

  const teacherTabs = [
    { id: "dash", name: "Bảng điều khiển", icon: TrendingUp },
    { id: "students", name: "Quản lý Lớp học", icon: Users },
    { id: "cms", name: "Soạn Bài giảng", icon: FilePen },
    { id: "gradebook", name: "Sổ điểm học sinh", icon: FileSpreadsheet }
  ];
  const [activeTeacherTab, setActiveTeacherTab] = useState("dash");

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased selection:bg-pink-100 selection:text-pink-600">
      
      {/* Dynamic Toast Wrapper */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none md:max-w-md w-full px-4">
        <AnimatePresence>
          {toasts.map(toast => {
            let colorStyling = "border-pink-500 text-pink-600 bg-white";
            if (toast.type === "orange") colorStyling = "border-orange-500 text-orange-600 bg-white";
            if (toast.type === "green") colorStyling = "border-emerald-500 text-emerald-600 bg-white";
            if (toast.type === "teal") colorStyling = "border-teal-500 text-teal-600 bg-white";

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, x: 100 }}
                transition={{ duration: 0.25 }}
                className={`border-l-4 shadow-xl p-4 rounded-xl text-xs font-bold flex items-start gap-3 pointer-events-auto border ${colorStyling}`}
              >
                <div className="mt-0.5"><Bell size={14} className="shrink-0 animate-bounce" /></div>
                <div className="flex-1 leading-snug">{toast.text}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 text-white relative overflow-hidden py-6 sm:py-8 shadow-md">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">Nền tảng Ngữ văn THCS thế hệ mới</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold heading-font leading-tight tracking-tight">KHO HỌC LIỆU NGỮ VĂN THCS - CÔ VÕ THỊ KIM LIÊN</h1>
            <p className="text-xs sm:text-sm font-semibold opacity-90 italic">Trường THCS Trần Quý Cáp • Thăng Bình • Thành phố Đà Nẵng</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner">
            <div className="text-center min-w-[100px]">
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-95 text-pink-100">Điểm tích lũy</span>
              <span className="text-3xl font-extrabold heading-font text-white">{isLoggedIn && loggedInUser ? loggedInUser.points : 0}</span>
            </div>
            <div className="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center text-white text-2xl shadow-sm animate-bounce">
              🚀
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar Navigation Container */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Title / Brand link */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveView("trang-chu")}>
              <BookOpen className="text-pink-600 shrink-0" size={22} />
              <span className="font-extrabold heading-font text-slate-800 text-lg">LMS Ngữ Văn THCS</span>
            </div>

            {/* Desktop Center Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => { setActiveView("trang-chu"); resetWorkspaces(); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeView === "trang-chu" ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:text-pink-600 hover:bg-slate-50"
                }`}
              >
                <House size={14} /> Trang chủ
              </button>
              <button
                onClick={() => { setActiveView("cong-hoc-sinh"); setSelectedLessonId(null); setQuizActive(false); setGameActive(false); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeView === "cong-hoc-sinh" && !quizActive && !gameActive ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:text-orange-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen size={14} /> Thư viện bài giảng
              </button>
              <button
                onClick={() => { setActiveView("cong-hoc-sinh"); startQuiz(); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  quizActive ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                }`}
              >
                <FilePen size={14} /> Ôn trắc nghiệm
              </button>
              <button
                onClick={() => { setActiveView("cong-hoc-sinh"); startMillionaireGame(); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  gameActive ? "bg-purple-50 text-purple-600" : "text-slate-600 hover:text-purple-600 hover:bg-slate-50"
                }`}
              >
                <Gamepad size={14} /> Khu vui chơi
              </button>
              <button
                onClick={verifyTeacherAccessAndSwitch}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeView === "cong-giao-vien" ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:text-pink-600 hover:bg-slate-50"
                }`}
              >
                <GraduationCap size={14} /> Cổng Giáo Viên
              </button>
            </nav>

            {/* Right Side Header controls */}
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                {loggedInUser?.role === "teacher" 
                  ? "Vai trò: Giáo viên" 
                  : loggedInUser?.role === "student" 
                  ? `Vai trò: Lớp ${loggedInUser.class}` 
                  : "Vai trò: Khách"}
              </span>

              {/* Simple quick role selective testing tool */}
              <select
                id="role-select"
                onChange={(e) => handleRoleChange(e.target.value)}
                value={loggedInUser?.role || "guest"}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer transition-all"
              >
                <option value="guest">Khách</option>
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
              </select>

              {/* Header Auth Button */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-xl hover:bg-rose-100 transition-all shadow-sm"
                >
                  <LogOut size={13} /> Thoát ({loggedInUser?.name || "User"})
                </button>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setAuthTab("login"); }}
                  className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                >
                  <UserCheck size={13} /> Đăng nhập / Đăng ký
                </button>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panel dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-inner animate-in slide-in-from-top duration-250">
            <button
              onClick={() => { setActiveView("trang-chu"); setShowMobileMenu(false); resetWorkspaces(); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
            >
              <House size={15} className="text-pink-600" /> Trang chủ
            </button>
            <button
              onClick={() => { setActiveView("cong-hoc-sinh"); setSelectedLessonId(null); setQuizActive(false); setGameActive(false); setShowMobileMenu(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
            >
              <BookOpen size={15} className="text-orange-500" /> Thư viện bài giảng
            </button>
            <button
              onClick={() => { setActiveView("cong-hoc-sinh"); startQuiz(); setShowMobileMenu(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
            >
              <FilePen size={15} className="text-emerald-500" /> Ôn trắc nghiệm
            </button>
            <button
              onClick={() => { setActiveView("cong-hoc-sinh"); startMillionaireGame(); setShowMobileMenu(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
            >
              <Gamepad size={15} className="text-purple-500" /> Khu vui chơi
            </button>
            <button
              onClick={() => { verifyTeacherAccessAndSwitch(); setShowMobileMenu(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
            >
              <GraduationCap size={15} className="text-pink-600" /> Cổng Giáo Viên
            </button>
            
            <div className="pt-2 border-t border-slate-100">
              {isLoggedIn ? (
                <button
                  onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                >
                  <LogOut size={14} /> Đăng xuất ({loggedInUser?.name || "User"})
                </button>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setAuthTab("login"); setShowMobileMenu(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                >
                  <UserCheck size={14} /> Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content grid workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Widget Panel (Sidebar profile + Announcements) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Dynamic visual Profile card */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-2xl text-white font-extrabold text-xl flex items-center justify-center shadow-md ${
                    loggedInUser?.role === "teacher" 
                      ? "bg-gradient-to-tr from-pink-500 to-orange-500" 
                      : "bg-pink-500"
                  }`}>
                    {loggedInUser ? getAvatarInitials(loggedInUser.name) : "KH"}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-800 text-sm heading-font truncate">
                    {loggedInUser ? loggedInUser.name : "Khách ghé thăm"}
                  </h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">
                    {loggedInUser?.role === "teacher" 
                      ? "Giáo viên Ngữ Văn" 
                      : loggedInUser?.role === "student" 
                      ? `Học sinh Lớp ${loggedInUser.class}` 
                      : "Khách xem tự do"}
                  </p>
                </div>
              </div>

              {/* Progress visualizer for student profiles */}
              {loggedInUser?.role !== "teacher" && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Tiến độ bài học</span>
                    <span>{loggedInUser ? loggedInUser.progress : "0%"}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: loggedInUser ? loggedInUser.progress : "0%" }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 block text-right">
                    {loggedInUser?.progress === "75%" ? "Đã học 3/4 bài giảng" : "Đã học 0/4 bài giảng"}
                  </span>
                </div>
              )}

              {loggedInUser?.role === "teacher" && (
                <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 text-pink-600">
                    <CheckCircle size={12} /> Đang quản lý THCS Trần Quý Cáp
                  </div>
                  <div className="text-[10px] text-slate-400">Quyền hạn: Biên kịch, Sổ điểm, Quản lý lớp</div>
                </div>
              )}
            </div>

            {/* Custom Category Navigator filter */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-3">
              <h3 className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest">Danh Mục Bài Học</h3>
              <div className="space-y-1 text-xs font-bold">
                <button 
                  onClick={() => { setActiveCategory("ALL"); if (activeView !== "cong-hoc-sinh") setActiveView("cong-hoc-sinh"); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeCategory === "ALL" && activeView === "cong-hoc-sinh" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">📚 Tất cả thư viện</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-500">{lessons.length}</span>
                </button>
                <button 
                  onClick={() => { setActiveCategory("DOC"); if (activeView !== "cong-hoc-sinh") setActiveView("cong-hoc-sinh"); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeCategory === "DOC" && activeView === "cong-hoc-sinh" ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2"><BookOpen size={14} className="text-pink-600" /> Đọc hiểu văn bản</span>
                  <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full text-[10px]">{lessons.filter(l => l.category === "DOC").length}</span>
                </button>
                <button 
                  onClick={() => { setActiveCategory("VIET"); if (activeView !== "cong-hoc-sinh") setActiveView("cong-hoc-sinh"); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeCategory === "VIET" && activeView === "cong-hoc-sinh" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2"><FilePen size={14} className="text-orange-500" /> Thực hành Viết</span>
                  <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full text-[10px]">{lessons.filter(l => l.category === "VIET").length}</span>
                </button>
                <button 
                  onClick={() => { setActiveCategory("NOI_NGHE"); if (activeView !== "cong-hoc-sinh") setActiveView("cong-hoc-sinh"); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeCategory === "NOI_NGHE" && activeView === "cong-hoc-sinh" ? "bg-teal-50 text-teal-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2"><Gamepad size={14} className="text-teal-600" /> Thực hành Nói & Nghe</span>
                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-[10px]">{lessons.filter(l => l.category === "NOI_NGHE").length}</span>
                </button>
              </div>
            </div>

            {/* School Announcements Card */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-2">
                <Bell size={14} className="text-pink-600 shrink-0" />
                <span className="heading-font text-xs uppercase tracking-wider">Thông báo học kỳ</span>
              </div>
              <div className="space-y-3 divide-y divide-slate-100 text-xs">
                {announcements.map(item => (
                  <div key={item.id} className="pt-2 first:pt-0 space-y-1">
                    <h5 className="font-extrabold text-slate-700 leading-snug">{item.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.content}</p>
                    <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10} /> {item.date}</p>
                  </div>
                ))}
              </div>
            </div>

          </aside>

          {/* Right Column Content Panel */}
          <div className="lg:col-span-9">
            
            <AnimatePresence mode="wait">
              
              {/* --- VIEW 1: TRANG CHỦ --- */}
              {activeView === "trang-chu" && (
                <motion.div
                  key="trang-chu"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  
                  {/* Grid 1: Học liệu tải nhiều */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-2.5">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500 heading-font flex items-center gap-2">
                        <Award size={16} className="text-pink-600" /> Học liệu tải nhiều nhất
                      </h3>
                      <button onClick={() => { setActiveView("cong-hoc-sinh"); setActiveCategory("ALL"); }} className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1">
                        Xem tất cả <ArrowRight size={12} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {lessons && [...lessons]
                        .sort((a, b) => b.downloads - a.downloads)
                        .slice(0, 4)
                        .map((lesson, idx) => {
                          const gradients = [
                            "from-teal-500 to-cyan-500",
                            "from-pink-500 to-rose-400",
                            "from-orange-500 to-amber-500",
                            "from-purple-500 to-indigo-500"
                          ];
                          const gradient = gradients[idx % gradients.length];
                          
                          return (
                            <div 
                              key={lesson.id} 
                              onClick={() => { setActiveView("cong-hoc-sinh"); setSelectedLessonId(lesson.id); }}
                              className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[210px] transform hover:-translate-y-1 duration-250"
                            >
                              <div className={`h-16 bg-gradient-to-r ${gradient} relative p-3 flex items-center justify-between text-white`}>
                                <span className="bg-white/95 text-[8px] font-black px-2 py-0.5 rounded-full text-slate-800 shadow-sm uppercase">
                                  {lesson.category === "DOC" ? "Đọc hiểu" : lesson.category === "VIET" ? "Luyện viết" : "Nói & Nghe"}
                                </span>
                                <BookOpen size={36} className="text-white/20 absolute -bottom-1 -right-2" />
                              </div>
                              <div className="p-3 flex-grow flex flex-col justify-between">
                                <h4 className="text-[11px] font-extrabold text-slate-800 leading-snug line-clamp-3 hover:text-pink-600 transition-colors">
                                  {lesson.title}
                                </h4>
                                <div className="flex justify-between items-center border-t border-slate-50 pt-2 mt-2">
                                  <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Download size={10} /> {lesson.downloads} lượt tải</span>
                                  <span className="text-pink-600 text-[9px] font-black flex items-center gap-0.5">Học ngay <ArrowRight size={10} /></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Grid 2: Học liệu mới cập nhật */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-2.5">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 heading-font flex items-center gap-2">
                        <Clock size={16} className="text-purple-600" /> Học liệu biên soạn mới nhất
                      </h3>
                      <button onClick={() => { setActiveView("cong-hoc-sinh"); setActiveCategory("ALL"); }} className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1">
                        Xem tất cả <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {lessons && [...lessons]
                        .slice()
                        .reverse()
                        .slice(0, 4)
                        .map((lesson, idx) => {
                          const gradients = [
                            "from-purple-500 to-indigo-500",
                            "from-orange-500 to-amber-500",
                            "from-pink-500 to-rose-400",
                            "from-teal-500 to-cyan-500"
                          ];
                          const gradient = gradients[idx % gradients.length];

                          return (
                            <div 
                              key={lesson.id} 
                              onClick={() => { setActiveView("cong-hoc-sinh"); setSelectedLessonId(lesson.id); }}
                              className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[210px] transform hover:-translate-y-1 duration-250"
                            >
                              <div className={`h-16 bg-gradient-to-r ${gradient} relative p-3 flex items-center justify-between text-white`}>
                                <span className="bg-white/95 text-[8px] font-black px-2 py-0.5 rounded-full text-slate-800 shadow-sm uppercase">
                                  {lesson.category === "DOC" ? "Đọc hiểu" : lesson.category === "VIET" ? "Luyện viết" : "Nói & Nghe"}
                                </span>
                                <Award size={36} className="text-white/20 absolute -bottom-1 -right-2" />
                              </div>
                              <div className="p-3 flex-grow flex flex-col justify-between">
                                <h4 className="text-[11px] font-extrabold text-slate-800 leading-snug line-clamp-3 hover:text-pink-600 transition-colors">
                                  {lesson.title}
                                </h4>
                                <div className="flex justify-between items-center border-t border-slate-50 pt-2 mt-2">
                                  <span className="text-[9px] text-pink-600 font-bold flex items-center gap-0.5">★★★★★</span>
                                  <span className="text-[9px] text-slate-400 font-bold">Khối {lesson.grade}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* BẢNG VÀNG THÀNH TÍCH PODIUM (Vinh danh đẹp đẽ, chuyên nghiệp) */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-base font-bold heading-font text-slate-800 flex items-center gap-2">
                          <Award size={20} className="text-amber-500 animate-bounce" /> Bảng vàng thành tích học tập thi đua
                        </h3>
                        <p class="text-xs font-bold text-slate-500">Bảng vàng xếp lớp và thống kê trung bình luyện đề đạt điểm tối đa</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={leaderboardClassFilter}
                          onChange={(e) => setLeaderboardClassFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl text-slate-700 focus:outline-none"
                        >
                          <option value="all">Tất cả lớp học</option>
                          <option value="6/1">Lớp 6/1</option>
                          <option value="6/2">Lớp 6/2</option>
                          <option value="7/1">Lớp 7/1</option>
                        </select>
                      </div>
                    </div>

                    {/* Premium Podium UI */}
                    <div className="grid grid-cols-3 gap-3 items-end pt-8 pb-4 max-w-sm mx-auto">
                      
                      {/* Left Podium (Top 2) */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full border-2 border-slate-300 bg-slate-50 flex items-center justify-center font-bold text-slate-700 shadow text-xs">
                            TA
                          </div>
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">2</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 text-center truncate w-full">Trần Đức An</span>
                        <span className="text-[9px] font-black text-pink-600">9.1đ</span>
                        <div className="bg-slate-200 w-full h-10 rounded-t-xl mt-2 flex items-center justify-center shadow-inner">
                          <span className="text-slate-500 text-[9px] font-black">🥈 Bạc</span>
                        </div>
                      </div>

                      {/* Center Podium (Top 1) */}
                      <div className="flex flex-col items-center transform -translate-y-2">
                        <div className="relative mb-2">
                          <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center font-bold text-amber-800 shadow text-sm">
                            KL
                          </div>
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">👑</span>
                        </div>
                        <span className="text-xs font-black text-slate-800 text-center truncate w-full">Khánh Linh</span>
                        <span className="text-[10px] font-black text-orange-500">9.8đ</span>
                        <div className="bg-amber-100 w-full h-14 rounded-t-xl mt-2 flex items-center justify-center shadow">
                          <span className="text-amber-600 text-[10px] font-black">🥇 Vàng</span>
                        </div>
                      </div>

                      {/* Right Podium (Top 3) */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <div className="w-10 h-10 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center font-bold text-amber-700 shadow text-[10px]">
                            VT
                          </div>
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">3</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 text-center truncate w-full">Vũ Thảo</span>
                        <span className="text-[9px] font-black text-pink-600">9.1đ</span>
                        <div className="bg-amber-100/50 w-full h-8 rounded-t-xl mt-2 flex items-center justify-center shadow-inner">
                          <span className="text-amber-700 text-[9px] font-black">🥉 Đồng</span>
                        </div>
                      </div>

                    </div>

                    {/* Data leader table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                            <th className="py-2 px-3">Hạng</th>
                            <th className="py-2 px-3">Họ và tên học sinh</th>
                            <th className="py-2 px-3">Lớp học</th>
                            <th className="py-2 px-3 text-right">Điểm trung bình cộng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {gradebook && gradebook
                            .map(g => ({
                              ...g,
                              avg: parseFloat(((g.scoreQuiz1 + g.scoreQuiz2 + g.scoreExam) / 3).toFixed(1))
                            }))
                            .filter(g => leaderboardClassFilter === "all" || g.class === leaderboardClassFilter)
                            .sort((a, b) => b.avg - a.avg)
                            .map((student, idx) => {
                              let rowClass = "hover:bg-slate-50 transition-colors duration-150";
                              let rankBadge = <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{idx + 1}</span>;
                              if (idx === 0) rankBadge = <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full">👑 1</span>;
                              if (idx === 1) rankBadge = <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full">🥈 2</span>;
                              if (idx === 2) rankBadge = <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full">🥉 3</span>;

                              return (
                                <tr key={student.studentId} className={rowClass}>
                                  <td className="py-2 px-4">{rankBadge}</td>
                                  <td className="py-2 px-3 text-slate-900 font-extrabold">{student.name}</td>
                                  <td className="py-2 px-3 text-slate-500">Lớp {student.class}</td>
                                  <td className="py-2 px-3 text-right text-pink-600 font-black text-xs">{student.avg}đ</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* --- VIEW 2: CỔNG HỌC SINH (LIBRARY & EXAMINATIONS & MULTIPLAYER GAME) --- */}
              {activeView === "cong-hoc-sink" || activeView === "cong-hoc-sinh" && (
                <motion.div
                  key="cong-hoc-sinh"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  
                  {/* Standard search header section */}
                  {!quizActive && !gameActive && selectedLessonId === null && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-lg font-bold heading-font text-slate-800">
                          {activeCategory === "ALL" ? "📚 Kho Học Liệu & Giáo Án Đầy Đủ" : `📚 Thư viện đề mục: ${activeCategory}`}
                        </h3>
                        
                        <div className="relative w-full sm:w-64">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm nội dung bài viết..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Lesson cards grid layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lessons && lessons
                          .filter(l => activeCategory === "ALL" || l.category === activeCategory)
                          .filter(l => searchQuery === "" || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.content.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((lesson) => {
                            let badgeStyle = "bg-pink-100 text-pink-700";
                            if (lesson.category === "VIET") badgeStyle = "bg-orange-100 text-orange-700";
                            if (lesson.category === "NOI_NGHE") badgeStyle = "bg-teal-100 text-teal-700";

                            return (
                              <div
                                key={lesson.id}
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-pink-300 transition-all flex flex-col justify-between space-y-4 cursor-pointer duration-200"
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className={`${badgeStyle} text-[9px] font-black px-2.5 py-1 rounded-full uppercase`}>
                                      {lesson.category === "DOC" ? "Đọc hiểu" : lesson.category === "VIET" ? "Luyện viết" : "Nói & Nghe"}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">Khối Lớp {lesson.grade}</span>
                                  </div>
                                  <h4 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2 hover:text-pink-600">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                    {lesson.content}
                                  </p>
                                </div>
                                
                                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                                  <span>Tác giả: {lesson.author}</span>
                                  <span className="text-pink-600 hover:underline flex items-center gap-0.5">Tìm hiểu kỹ bài <ArrowRight size={11} /></span>
                                </div>
                              </div>
                            );
                          })}

                        {lessons.filter(l => activeCategory === "ALL" || l.category === activeCategory).length === 0 && (
                          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3">
                            <Clock className="text-slate-300" size={40} />
                            <p className="text-xs font-bold text-slate-400">Không tìm thấy bài giảng mới nào trùng khớp.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active Lesson Content Viewer section */}
                  {selectedLessonId !== null && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
                      {(() => {
                        const lesson = lessons.find(l => l.id === selectedLessonId);
                        if (!lesson) return null;
                        return (
                          <>
                            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                              <div className="space-y-1">
                                <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                                  {lesson.category === "DOC" ? "Đọc hiểu" : lesson.category === "VIET" ? "Biên soạn đoạn văn" : "Nói & Nghe trình hỏi"}
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold heading-font text-slate-800 mt-1.5">{lesson.title}</h3>
                                <p className="text-xs font-bold text-slate-500">Khối lớp {lesson.grade} • Giáo viên: {lesson.author}</p>
                              </div>
                              <button
                                onClick={() => setSelectedLessonId(null)}
                                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            <div className="prose max-w-none text-xs text-slate-600 leading-relaxed whitespace-pre-line space-y-4">
                              {lesson.content}
                            </div>

                            {/* Multimedia video block */}
                            {lesson.embedUrl ? (
                              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                                <div className="text-indigo-600 font-bold text-xs flex items-center gap-1.5"><Eye size={14} /> Tư liệu trực quan đính kèm</div>
                                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-slate-200">
                                  <iframe
                                    className="w-full h-full"
                                    src={lesson.embedUrl}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center text-xs text-slate-400 font-semibold">
                                Bài giảng này không đính kèm đa phương tiện bên thứ ba.
                              </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                              <button
                                onClick={() => setSelectedLessonId(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200"
                              >
                                Quay lại danh sách học liệu
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Active Interactive Quiz Engine */}
                  {quizActive && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-2">
                        <div>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                            Trục trắc nghiệm tự động chấm điểm
                          </span>
                          <h3 className="text-base sm:text-lg font-bold heading-font text-slate-800 mt-1.5">
                            Ôn Tập Kiến Thức Tổng Hợp Lớp 6 - Đề kiểm tra số 1
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Thời gian còn lại</span>
                          <span className="text-sm font-black text-rose-500 select-none">
                            {formatTimer(quizTimer)}
                          </span>
                        </div>
                      </div>

                      {!quizCompleted ? (
                        <div className="space-y-6">
                          {/* Quiz progress */}
                          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                            <span>Câu hỏi {currentQuizIndex + 1} / {quizQuestions.length}</span>
                            <div className="w-1/3 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full transition-all duration-300" 
                                style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Problem display block */}
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed">
                              {quizQuestions[currentQuizIndex].q}
                            </h4>
                            <div className="grid grid-cols-1 gap-2.5">
                              {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                                const isSelected = studentAnswers[currentQuizIndex] === idx;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => selectQuizAnswer(idx)}
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                                      isSelected 
                                        ? "bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/60"
                                    }`}
                                  >
                                    <span>{option}</span>
                                    {isSelected ? (
                                      <CheckCircle className="text-emerald-500 shrink-0 ml-2" size={14} />
                                    ) : (
                                      <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 ml-2"></span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Nav links */}
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <button
                              onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                              disabled={currentQuizIndex === 0}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-250 disabled:opacity-50"
                            >
                              Trở lại
                            </button>

                            {currentQuizIndex === quizQuestions.length - 1 ? (
                              <button
                                onClick={calculateQuizScore}
                                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-md"
                              >
                                Kết thúc & Nộp bài
                              </button>
                            ) : (
                              <button
                                onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-md"
                              >
                                Câu tiếp theo
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Quiz Results Screen
                        <div className="text-center py-8 space-y-6 max-w-md mx-auto">
                          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
                            🏆
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-slate-800">Kết quả nỗ lực luyện đề của em</h4>
                            <p className="text-4xl font-black text-emerald-500 mt-2">{quizScore} / 10 Điểm</p>
                          </div>

                          <div className="bg-slate-50 py-3.5 px-4 rounded-xl border border-slate-100 text-xs text-slate-500 font-semibold leading-relaxed">
                            {quizScore >= 8 
                              ? "Xuất sắc! Em nắm rất chắc bài đọc hiểu Thánh Gióng." 
                              : quizScore >= 5 
                              ? "Khá đạt! Hãy ôn tập kỹ bài viết lục bát để cải thiện điểm số nhé." 
                              : "Cần cố gắng học hỏi thêm kiến thức cùng Cô Võ Thị Kim Liên."}
                            <p className="text-[10px] text-pink-600 mt-1.5 font-bold">★ Cộng điểm tích lũy: +{(quizScore * 10).toFixed(0)} điểm vào tài khoản!</p>
                          </div>

                          <div className="flex justify-center gap-2 pt-2">
                            <button
                              onClick={() => { setQuizActive(false); setSelectedLessonId(null); }}
                              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 transition"
                            >
                              Trở lại thư viện bài học
                            </button>
                            <button
                              onClick={startQuiz}
                              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition"
                            >
                              Trắc nghiệm lại
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active "Ai là triệu phú" Game Environment */}
                  {gameActive && (
                    <div className="bg-gradient-to-b from-slate-950 to-indigo-950 rounded-3xl p-6 shadow-2xl border border-indigo-500/30 text-white space-y-6">
                      <div className="flex justify-between items-center border-b border-indigo-900/40 pb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-purple-600 shadow-lg flex items-center justify-center text-white text-lg">
                            <Gamepad size={16} />
                          </div>
                          <div>
                            <h3 className="text-[9px] font-black text-purple-400 tracking-widest uppercase">Trò chơi Gamification</h3>
                            <h4 className="text-sm font-black heading-font text-white">Ai Là Triệu Phú Ngữ Văn 🏆</h4>
                          </div>
                        </div>

                        {/* Lifelines indicators */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => useGameLifeline("5050")}
                            disabled={!gameLifelines.fiftyFifty || gameSelectedAnswer !== null}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black border transition-all ${
                              gameLifelines.fiftyFifty 
                                ? "bg-slate-800 text-purple-300 border-purple-500/40 hover:bg-purple-900/30" 
                                : "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-40"
                            }`}
                          >
                            50:50
                          </button>
                          <button
                            onClick={() => useGameLifeline("audience")}
                            disabled={!gameLifelines.audience || gameSelectedAnswer !== null}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black border transition-all ${
                              gameLifelines.audience 
                                ? "bg-slate-800 text-teal-300 border-teal-500/40 hover:bg-teal-900/30" 
                                : "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-40"
                            }`}
                          >
                            Trợ giúp khán giả
                          </button>
                        </div>
                      </div>

                      {/* Milestone Prize Money table track */}
                      <div className="bg-indigo-950/50 p-3 rounded-xl border border-white/5 flex items-center justify-between overflow-x-auto gap-3 text-[10px] font-extrabold">
                        <span className="text-slate-400 uppercase tracking-wider block">Mốc vinh danh:</span>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          {["1. Khởi động", "2. Tập sự", "3. Thông thái", "4. Trí tuệ", "5. Triệu phú"].map((milestone, idx) => {
                            const isCurrent = currentGameIndex === idx;
                            return (
                              <span
                                key={milestone}
                                className={`px-2 py-0.5 rounded-full ${
                                  isCurrent 
                                    ? "bg-purple-600 text-white shadow-md animate-pulse font-black" 
                                    : "bg-slate-900 text-slate-400"
                                }`}
                              >
                                {milestone}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Millionaire questions board */}
                      {!gameCompleted ? (
                        <div className="space-y-6 pt-4 text-center max-w-2xl mx-auto">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">
                            CÂU HỎI SỐ {currentGameIndex + 1} / {gameQuestions.length}
                          </span>
                          
                          <div className="bg-slate-900/85 border border-indigo-500/10 p-5 rounded-2xl flex items-center justify-center min-h-[90px] shadow-inner">
                            <p className="text-xs sm:text-slate-200 font-extrabold leading-relaxed">
                              {gameQuestions[currentGameIndex].q}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs font-bold">
                            {gameQuestions[currentGameIndex].options.map((option, idx) => {
                              const isFaded = gameFadedIndices.includes(idx);
                              const isSelected = gameSelectedAnswer?.idx === idx;
                              let buttonStyle = "border-indigo-500/10 bg-slate-900 hover:bg-slate-850 hover:border-indigo-500/40 text-indigo-100";
                              
                              if (isSelected) {
                                buttonStyle = gameSelectedAnswer?.isCorrect 
                                  ? "border-emerald-500 bg-emerald-950/80 text-white shadow-emerald-500/20 shadow-lg scale-102"
                                  : "border-rose-500 bg-rose-950/80 text-white shadow-rose-500/20 shadow-md";
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={isFaded || gameSelectedAnswer !== null}
                                  onClick={() => handleGameAnswerSubmit(idx)}
                                  className={`w-full text-left p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${buttonStyle} ${
                                    isFaded ? "opacity-15 cursor-not-allowed border-transparent" : ""
                                  }`}
                                >
                                  <span className="text-orange-400">{String.fromCharCode(65 + idx)}.</span>
                                  <span>{option}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Game Victory Screen
                        <div className="text-center py-10 space-y-5 max-w-md mx-auto">
                          <div className="text-5xl animate-bounce">🏆⭐👑</div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-purple-400">CHÚC MỪNG BẠN LÀ TRIỆU PHÚ TRÍ TUỆ!</h4>
                            <p className="text-xs text-slate-350 leading-relaxed">
                              Bạn đã hoàn tất xuất sắc toàn bộ câu hỏi văn học kì khôi để bước lên đỉnh vinh quang.
                            </p>
                          </div>

                          <div className="bg-indigo-950 border border-white/5 p-4 rounded-2xl text-xs text-indigo-200">
                            Hệ thống đã tự động lưu trữ kết quả và cộng điểm tích lũy khổng lồ!
                            <p className="text-[10px] text-orange-400 mt-2 font-black flex items-center justify-center gap-1">
                              <Gift size={12} /> Bảng vàng ghi danh + Điểm 10 Luyên đề giữa kỳ!
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => { setGameActive(false); setSelectedLessonId(null); }}
                              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow transition-all"
                            >
                              Nhận thưởng & Quản lý thư viện
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-indigo-900/30 text-[10px] text-slate-500 font-bold">
                        <button onClick={() => setGameActive(false)} className="text-slate-400 hover:text-white transition">Thoát</button>
                        <span>Cơ chế học tập Gamification Ngữ văn</span>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}

              {/* --- VIEW 3: CỔNG GIÁO VIÊN (CMS & Student Management & Sổ điểm & KPI Charts) --- */}
              {activeView === "cong-giao-vien" && isLoggedIn && loggedInUser?.role === "teacher" && (
                <motion.div
                  key="cong-giao-vien"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  
                  {/* Administrative layout tabs */}
                  <div className="flex items-center border-b border-slate-200 overflow-x-auto whitespace-nowrap gap-2 scrollbar-none">
                    {teacherTabs.map(tab => {
                      const isActive = activeTeacherTab === tab.id;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTeacherTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
                            isActive 
                              ? "border-pink-600 text-pink-600" 
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Icon size={14} /> {tab.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* SUB-TAB 1: BẢNG ĐIỀU KHIỂN KPI */}
                  {activeTeacherTab === "dash" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-white">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold opacity-80 uppercase block">Học sinh đăng ký</span>
                            <span className="text-2xl font-black heading-font">{totalStudentsCombined}</span>
                          </div>
                          <Users size={32} className="opacity-25" />
                        </div>
                        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold opacity-80 uppercase block">ĐTB Luyện đề</span>
                            <span className="text-2xl font-black heading-font">{avgClassScoreDecimal} / 10</span>
                          </div>
                          <GraduationCap size={32} className="opacity-25" />
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold opacity-80 uppercase block">Tỷ lệ hoàn thành</span>
                            <span className="text-2xl font-black heading-font">82.5%</span>
                          </div>
                          <CheckCircle size={32} className="opacity-25" />
                        </div>
                      </div>

                      {/* Mock Chart Indicators */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
                          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Điểm luyện đề trung bình theo lớp</h3>
                          <div className="h-44 flex items-end justify-around pt-6 px-4">
                            <div className="flex flex-col items-center w-1/4">
                              <span className="text-[10px] font-bold text-slate-700 mb-1.5">8.9 đ</span>
                              <div className="bg-indigo-500 w-full rounded-t-lg transition-all h-28"></div>
                              <span className="text-[10px] font-black text-slate-600 mt-2 block">Lớp 6/1</span>
                            </div>
                            <div className="flex flex-col items-center w-1/4">
                              <span className="text-[10px] font-bold text-slate-700 mb-1.5">8.1 đ</span>
                              <div className="bg-teal-500 w-full rounded-t-lg transition-all h-24"></div>
                              <span className="text-[10px] font-black text-slate-600 mt-2 block">Lớp 6/2</span>
                            </div>
                            <div className="flex flex-col items-center w-1/4">
                              <span className="text-[10px] font-bold text-slate-700 mb-1.5">8.3 đ</span>
                              <div className="bg-pink-500 w-full rounded-t-lg transition-all h-26"></div>
                              <span className="text-[10px] font-black text-slate-600 mt-2 block">Lớp 7/1</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
                          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Phân loại học lực tập đề</h3>
                          <div className="flex flex-col space-y-3 justify-center h-44">
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                                <span>Xuất sắc & Giỏi (8.0 - 10)</span>
                                <span>65%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "65%" }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                                <span>Khá đạt (6.5 - 7.9)</span>
                                <span>25%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-teal-500 h-full rounded-full" style={{ width: "25%" }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                                <span>Cần cố gắng (Dưới 6.5)</span>
                                <span>10%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-rose-500 h-full rounded-full" style={{ width: "10%" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: STUDENTS SYSTEM (Management workspace) */}
                  {activeTeacherTab === "students" && (
                    <div className="space-y-6">
                      
                      {/* Search and selective filters row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <select
                            value={teacherStudentFilter}
                            onChange={(e) => setTeacherStudentFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="6/1">Học sinh lớp 6/1</option>
                            <option value="6/2">Học sinh lớp 6/2</option>
                            <option value="7/1">Học sinh lớp 7/1</option>
                          </select>
                          <span className="text-xs text-slate-400 font-bold">
                            Danh sách: {filteredStudents.length} em học sinh
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Tìm kiếm học sinh..."
                            value={teacherStudentSearch}
                            onChange={(e) => setTeacherStudentSearch(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none w-full sm:w-44 focus:ring-1 focus:ring-pink-500"
                          />
                          <button
                            onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                            className="bg-pink-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow hover:bg-pink-700 shrink-0"
                          >
                            <Plus size={14} /> Thêm HS
                          </button>
                        </div>
                      </div>

                      {/* Dropdown registration block for students */}
                      {showAddStudentForm && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-100/60 p-5 rounded-2xl border border-dashed border-slate-300 space-y-4"
                        >
                          <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1"><PlusCircle size={14} className="text-pink-600" /> Thêm hồ sơ Học Sinh Mới</h4>
                          <form onSubmit={handleNewStudentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Họ và tên của học sinh</label>
                              <input
                                type="text"
                                required
                                value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                placeholder="Ví dụ: Nguyễn Thị Hoài Lâm"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Chọn lớp học quản lý</label>
                              <select
                                value={newStudentClass}
                                onChange={(e) => setNewStudentClass(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                              >
                                <option value="6/1">Lớp 6/1</option>
                                <option value="6/2">Lớp 6/2</option>
                                <option value="7/1">Lớp 7/1</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
                              >
                                Xác nhận thêm học sinh
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}

                      {/* Students list data table */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
                              <tr>
                                <th className="py-3 px-4">Tài Khoản ID</th>
                                <th className="py-3 px-4">Họ và tên học sinh</th>
                                <th className="py-3 px-4">Lớp chính</th>
                                <th className="py-3 px-4">Đã học</th>
                                <th className="py-3 px-4">Hoạt động mới đây</th>
                                <th className="py-3 px-4 text-right">Thao tác quản lý</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                              {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50/60 transition">
                                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">{student.id}</td>
                                  <td className="py-3.5 px-4 text-slate-900 font-extrabold">{student.name}</td>
                                  <td className="py-3.5 px-4 text-slate-500">Lớp {student.class}</td>
                                  <td className="py-3.5 px-4">
                                    <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full">
                                      {student.lessonCount} lượt xem bài
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-400 text-[10px]">{student.lastActive}</td>
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      onClick={() => handleDeleteStudent(student.id)}
                                      className="text-rose-500 hover:text-rose-700 transition font-bold text-[10.5px] items-center gap-1 inline-flex"
                                    >
                                      <Trash2 size={12} /> Gỡ bỏ
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {filteredStudents.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                                    Không có dữ liệu học sinh phù hợp.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SUB-TAB 3: CMS LESSON AUTHORING WORKSPACE */}
                  {activeTeacherTab === "cms" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: Interactive Authoring form */}
                      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <FilePen size={15} className="text-pink-600" /> Biên soạn học liệu tương tác thế hệ mới
                        </h3>
                        <form onSubmit={handleLessonPublishSubmit} className="space-y-4">
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black text-slate-500 uppercase">Tên học liệu / Tiêu đề bài giảng</label>
                              <input
                                type="text"
                                required
                                placeholder="Ví dụ: Phân tích bài thơ Quê hương"
                                value={cmsTitle}
                                onChange={(e) => setCmsTitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black text-slate-500 uppercase">Chủ đề bài giảng</label>
                              <select
                                value={cmsCategory}
                                onChange={(e) => setCmsCategory(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                              >
                                <option value="DOC">📚 Đọc hiểu văn bản</option>
                                <option value="VIET">✍️ Thực hành Viết</option>
                                <option value="NOI_NGHE">🗣️ Thực hành Nói & Nghe</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black text-slate-500 uppercase">Khối lớp áp dụng học kỳ</label>
                              <select
                                value={cmsGrade}
                                onChange={(e) => setCmsGrade(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                              >
                                <option value="6">Cấp độ Lớp 6</option>
                                <option value="7">Cấp độ Lớp 7</option>
                                <option value="8">Cấp độ Lớp 8</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black text-slate-500 uppercase">URL đa phương tiện (Ví dụ YouTube embed)</label>
                              <input
                                type="url"
                                placeholder="Ví dụ: https://www.youtube.com/embed/..."
                                value={cmsEmbedUrl}
                                onChange={(e) => setCmsEmbedUrl(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase">Nội dung bài viết giảng dạy chi tiết</label>
                            <textarea
                              rows={6}
                              required
                              placeholder="Trình bày đầy đủ đại ý, phân tích đoạn văn ngữ liệu..."
                              value={cmsContent}
                              onChange={(e) => setCmsContent(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-pink-500"
                            ></textarea>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="submit"
                              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-pink-600 hover:bg-pink-700 shadow-sm transition"
                            >
                              Xuất bản giáo án
                            </button>
                          </div>

                        </form>
                      </div>

                      {/* Right: Existing lessons listing to manage delete operations */}
                      <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider block">Quản lý các bài hiện có ({lessons.length})</h3>
                        <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1">
                          {lessons && lessons.map(lesson => (
                            <div key={lesson.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                              <div className="min-w-0 pr-2">
                                <span className="text-slate-800 block truncate font-extrabold">{lesson.title}</span>
                                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Lớp {lesson.grade} • {lesson.category}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="text-rose-500 hover:text-rose-700 p-1.5 transition shrink-0"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SUB-TAB 4: GRADEBOOK SO DIEM (scores and CSV export) */}
                  {activeTeacherTab === "gradebook" && (
                    <div className="space-y-6">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div>
                          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider block">Bảng kết quả luyện tập của lớp học</h3>
                          <p className="text-[11px] font-bold text-slate-400">Các điểm số được cập nhật tự động khi học sinh hoàn tất bài ôn kiến thức.</p>
                        </div>
                        <button
                          onClick={downloadGradebookCSV}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition shrink-0"
                        >
                          <FileSpreadsheet size={14} /> Xuất bảng điểm CSV (Excel)
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-center">
                              <tr>
                                <th className="py-3 px-4 text-left">Học sinh</th>
                                <th className="py-3 px-4 text-left">Lớp học</th>
                                <th className="py-3 px-4">Đề số 1 (Biển)</th>
                                <th className="py-3 px-4">Giữa Kỳ (Triệu Phú)</th>
                                <th className="py-3 px-4">Điểm Tích Lũy chung</th>
                                <th className="py-3 px-4 text-right">Trung Bình Cộng</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-center">
                              {gradebook && gradebook.map(record => {
                                const avg = parseFloat(((record.scoreQuiz1 + record.scoreQuiz2 + record.scoreExam) / 3).toFixed(1));
                                let highlightClass = "text-emerald-600";
                                if (avg < 5.0) highlightClass = "text-rose-600";
                                else if (avg < 8.0) highlightClass = "text-slate-700";

                                return (
                                  <tr key={record.studentId} className="hover:bg-slate-50/65 transition duration-150">
                                    <td className="py-3.5 px-4 text-left text-slate-900 font-extrabold">{record.name}</td>
                                    <td className="py-3.5 px-4 text-left text-slate-500">Lớp {record.class}</td>
                                    <td className="py-3.5 px-4 text-emerald-600 font-extrabold">{record.scoreQuiz1}đ</td>
                                    <td className="py-3.5 px-4 text-orange-600 font-extrabold">{record.scoreQuiz2}đ</td>
                                    <td className="py-3.5 px-4 text-purple-600 font-extrabold">{record.scoreExam}đ</td>
                                    <td className={`py-3.5 px-4 text-right font-black text-sm ${highlightClass}`}>{avg}đ</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                </motion.div>
              )}

            </AnimatePresence>
            
          </div>
        </div>
      </main>

      {/* FOOTER BRYSTLE */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 font-bold">
        <p>© 2026 Cô Võ Thị Kim Liên - Giáo án & Học liệu điện tử Văn học THCS</p>
        <p className="mt-1 font-semibold text-[10px] text-slate-350 italic">Trường THCS Trần Quý Cáp • Thăng Bình • Thành phố Đà Nẵng</p>
      </footer>

      {/* --- AUTHENTICATION MODAL DIALOG --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black heading-font text-slate-800">
                {authTab === "login" ? "Đăng Nhập Hệ Thống LMS" : "Đăng Ký Tài Khoản Học Sinh"}
              </h3>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick switcher tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setAuthTab("login")}
                className={`flex-1 text-center py-2 text-[10.5px] font-black rounded-lg transition-all ${
                  authTab === "login" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setAuthTab("register")}
                className={`flex-1 text-center py-2 text-[10.5px] font-bold rounded-lg transition-all ${
                  authTab === "register" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Đăng ký mới
              </button>
            </div>

            {/* Simulated help hints to easily guide the users */}
            <div className="bg-slate-50 border border-pink-100 p-3 rounded-2xl text-[10.5px] text-pink-700 leading-relaxed font-bold">
              💡 <span className="font-extrabold text-pink-800">Kiểm thử viên lưu ý:</span><br />
              - Đăng nhập Giáo viên: tên là <span className="underline">admin</span> / mật khẩu <span className="underline">admin</span><br />
              - Đăng ký học sinh sẽ tự động đăng nhập & liên kết kết quả thi trắc nghiệm!
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-bold">
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase text-slate-400 font-extrabold">Tên đăng nhập / Email</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên tài khoản hoặc 'admin'..."
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {authTab === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase text-slate-400 font-extrabold">Họ và tên của em</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Hồng Phúc, Trần An..."
                      value={registerFullname}
                      onChange={(e) => setRegisterFullname(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase text-slate-400 font-extrabold">Lớp học hiện tại</label>
                    <select
                      value={registerClass}
                      onChange={(e) => setRegisterClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                    >
                      <option value="6/1">Lớp 6/1</option>
                      <option value="6/2">Lớp 6/2</option>
                      <option value="7/1">Lớp 7/1</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] uppercase text-slate-400 font-extrabold">Mật khẩu bảo mật</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu..."
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl font-black transition shadow-md mt-2"
              >
                {authTab === "login" ? "Xác nhận Đăng Nhập" : "Tạo Tài Khoản Mới"}
              </button>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );

  // Quick reset helper when shifting views
  function resetWorkspaces() {
    setSelectedLessonId(null);
    setQuizActive(false);
    setGameActive(false);
  }
}
