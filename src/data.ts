import { Lesson, Student, GradeRecord, QuizQuestion, GameQuestion } from "./types";

export const initialLessons: Lesson[] = [
  {
    id: "L1",
    title: "Thánh Gióng - Thể loại Truyền thuyết kì ảo lớp 6",
    category: "DOC",
    grade: "6",
    content: "Văn bản 'Thánh Gióng' ca ngợi người anh hùng đánh giặc cứu nước, mang tính chất thần kỳ. Biểu tượng của ý chí tự cường, sức mạnh đoàn kết chống ngoại xâm của nhân dân ta từ buổi bình minh lịch sử.\n\nPhân tích chi tiết khóa học:\n1. Sự sinh nở kỳ lạ: Mẹ dẫm vào vết chân lạ, mang thai 12 tháng.\n2. Tiếng nói đầu tiên đòi đi đánh giặc: Khát vọng cứu nước quật cường của nhân dân.\n3. Gióng lớn nhanh như thổi: Sức mạnh toàn dân tụ hội trong người anh hùng.\n4. Trận đánh giặc và sự bay về trời: Tượng trưng cho tinh thần xả thân vì đại nghĩa, hóa thân vào bất tử.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    author: "Cô Võ Thị Kim Liên",
    downloads: 412
  },
  {
    id: "L2",
    title: "Thực hành Viết: Đoạn văn chia sẻ cảm xúc về một bài thơ lục bát",
    category: "VIET",
    grade: "6",
    content: "Để viết một đoạn văn biểu cảm về bài thơ lục bát, học sinh cần tuân thủ cấu trúc 3 phần chặt chẽ:\n- Mở đoạn: Giới thiệu bài thơ lục bát, tác giả và nêu cảm xúc chung nhất.\n- Thân đoạn: Phân tích từ ngữ, hình ảnh đặc sắc tuôn trào cảm xúc; làm rõ nghệ thuật dung dị của thể lục bát (vần, nhịp, điệp từ).\n- Kết đoạn: Khẳng định ý nghĩa bài thơ đối với tâm hồn bản thân.\n\nGợi ý thực hành: Hãy chọn một bài thơ lục bát viết về tình cảm gia đình hoặc quê hương đất nước để viết bài.",
    embedUrl: "",
    author: "Cô Võ Thị Kim Liên",
    downloads: 295
  },
  {
    id: "L3",
    title: "Nói & Nghe: Bày tỏ ý kiến về một hiện tượng đời sống học đường",
    category: "NOI_NGHE",
    grade: "6",
    content: "Kỹ năng nói đòi hỏi học sinh biết chuẩn bị đề cương, lập dàn ý, chọn lọc luận điểm rõ ràng.\n\nCác nguyên tắc nói & nghe thành công:\n1. Chuẩn bị: Viết các từ khóa quan trọng ra thẻ nhớ.\n2. Tác phong: Sử dụng ngôn ngữ cơ thể, cử chỉ điệu bộ linh hoạt, duy trì giao tiếp bằng mắt (eye contact).\n3. Lắng nghe chủ động: Khi bạn nói, người nghe cần chú ý ghi chép nhanh và tôn trọng ý kiến khác biệt, đặt câu hỏi phản biện lịch sự.",
    embedUrl: "",
    author: "Cô Võ Thị Kim Liên",
    downloads: 187
  },
  {
    id: "L4",
    title: "Sọ Dừa - Thể loại truyện cổ tích và bài học nhân sinh sâu sắc",
    category: "DOC",
    grade: "6",
    content: "Truyện Sọ Dừa đề cập đến những con người bất hạnh trong xã hội cũ nhưng ẩn chứa nhân cách cao quý và nội tâm phong phú.\n\nÝ nghĩa nhân văn:\n1. Đề cao vẻ đẹp tinh thần tiềm ẩn bên trong hình hài dị dạng.\n2. Khẳng định chân lý sống đẹp đẽ: Ở hiền gặp lành, nhân quả luân hồi.\n3. Ca ngợi ước mơ đổi đời và công lý xã hội của người lao động xưa.",
    embedUrl: "",
    author: "Cô Võ Thị Kim Liên",
    downloads: 356
  }
];

export const initialStudents: Student[] = [
  { id: "HS001", name: "Nguyễn Khánh Linh", class: "6/1", lastActive: "Vừa xong", lessonCount: 14 },
  { id: "HS002", name: "Trần Đức An", class: "6/1", lastActive: "10 phút trước", lessonCount: 12 },
  { id: "HS003", name: "Vũ Phương Thảo", class: "6/1", lastActive: "1 giờ trước", lessonCount: 10 },
  { id: "HS004", name: "Phạm Minh Hoàng", class: "6/1", lastActive: "Hôm qua", lessonCount: 8 },
  { id: "HS005", name: "Lê Thị Hồng Ngát", class: "6/2", lastActive: "2 giờ trước", lessonCount: 11 },
  { id: "HS006", name: "Ngô Văn Bảo", class: "6/2", lastActive: "Vừa xong", lessonCount: 15 },
  { id: "HS007", name: "Đặng Tiến Dũng", class: "7/1", lastActive: "3 ngày trước", lessonCount: 5 },
  { id: "HS008", name: "Trương Quỳnh Chi", class: "7/1", lastActive: "Hôm qua", lessonCount: 13 }
];

export const initialGradebook: GradeRecord[] = [
  { studentId: "HS001", name: "Nguyễn Khánh Linh", class: "6/1", scoreQuiz1: 10.0, scoreQuiz2: 9.5, scoreExam: 9.8 },
  { studentId: "HS002", name: "Trần Đức An", class: "6/1", scoreQuiz1: 9.5, scoreQuiz2: 8.8, scoreExam: 9.0 },
  { studentId: "HS003", name: "Vũ Phương Thảo", class: "6/1", scoreQuiz1: 9.2, scoreQuiz2: 9.0, scoreExam: 9.2 },
  { studentId: "HS004", name: "Phạm Minh Hoàng", class: "6/1", scoreQuiz1: 7.5, scoreQuiz2: 7.0, scoreExam: 8.0 },
  { studentId: "HS005", name: "Lê Thị Hồng Ngát", class: "6/2", scoreQuiz1: 8.2, scoreQuiz2: 8.5, scoreExam: 8.0 },
  { studentId: "HS006", name: "Ngô Văn Bảo", class: "6/2", scoreQuiz1: 8.8, scoreQuiz2: 9.0, scoreExam: 8.5 },
  { studentId: "HS007", name: "Đặng Tiến Dũng", class: "7/1", scoreQuiz1: 6.5, scoreQuiz2: 7.0, scoreExam: 6.8 },
  { studentId: "HS008", name: "Trương Quỳnh Chi", class: "7/1", scoreQuiz1: 9.0, scoreQuiz2: 8.5, scoreExam: 9.2 }
];

export const quizQuestions: QuizQuestion[] = [
  {
    q: "Chi tiết nào thể hiện sự kỳ lạ trong sự sinh nở của Thánh Gióng?",
    options: [
      "A. Người mẹ đi giẫm vào một vết chân to ngoài đồng dắt về rồi mang thai.",
      "B. Người mẹ mang thai 12 tháng mới sinh ra cậu bé.",
      "C. Cả A và B đều đúng.",
      "D. Đứa bé sinh ra đã lập tức biết đi biết nói cười ngay lập tức."
    ],
    correctIndex: 2
  },
  {
    q: "Tiếng nói đầu tiên của Thánh Gióng là đòi nhà vua đáp ứng yêu cầu gì?",
    options: [
      "A. Đòi mẹ cho ăn cơm thật nhiều và mượn đồ của xóm làng.",
      "B. Đòi đi đánh giặc cứu nước xâm lăng.",
      "C. Đòi đúc một chiếc roi sắt, một chiếc giáp sắt và một con ngựa sắt.",
      "D. Đòi rủ các bạn cùng trang lứa đi chăn trâu cắt cỏ."
    ],
    correctIndex: 1
  },
  {
    q: "Truyền thuyết Thánh Gióng đại diện cho đại ý quật khởi và phản ánh mong ước gì của nhân dân ta thời xưa?",
    options: [
      "A. Sức mạnh đoàn kết toàn dân và ý thức bảo vệ độc lập tự chủ bờ cõi.",
      "B. Ước mơ về ruộng đất phì nhiêu màu mỡ quanh năm.",
      "C. Tìm kiếm các phương thuốc tiên dược giúp bách niên giai lão.",
      "D. Xây dựng các thành trì kiên cố từ kim loại dẻo bọc đồng."
    ],
    correctIndex: 0
  },
  {
    q: "Chi tiết Thánh Gióng cởi giáp sắt bay về trời sau khi quét sạch bóng giặc Ân biểu thị ý nghĩa sâu sắc nào?",
    options: [
      "A. Người anh hùng vô tư không màng của cải tước vị, hóa thân vào cõi bất tử.",
      "B. Gióng muốn quay về trời để chất vấn ngọc hoàng vì nhà vua không phong chức tước.",
      "C. Gióng muốn lập tức tìm lại cha mẹ thần tiên của mình ở sơn đỉnh.",
      "D. Chỉ là một chi tiết phóng đại ngẫu nhiên để câu chuyện có kết thúc kỳ khôi."
    ],
    correctIndex: 0
  }
];

export const gameQuestions: GameQuestion[] = [
  {
    q: "Thể loại truyện dân gian nào thường nhằm giải thích hiện tượng tự nhiên và nguồn gốc di tích lịch sử?",
    options: ["A. Truyện cười", "B. Truyền thuyết", "C. Thơ lục bát cổ", "D. Truyện ngụ ngôn"],
    correctIndex: 1
  },
  {
    q: "Từ nào không phải là một từ láy chính xác trong tiếng Việt hiện đại?",
    options: ["A. Xinh xắn", "B. Gần gũi", "C. Học hành", "D. Khập khiễng"],
    correctIndex: 2
  },
  {
    q: "Thể loại chính của tác phẩm dân ca nổi tiếng 'Kho tàng tục ngữ Ca dao Việt Nam' chứa vần điệu gì phổ biến nhất?",
    options: ["A. Thể lục bát", "B. Thể song thất lục bát", "C. Thể đường luật thất ngôn", "D. Thơ tự do"],
    correctIndex: 0
  },
  {
    q: "Ai là nhân vật trung tâm trong truyền thuyết hào hùng Lê Lợi hoàn trả gươm thần cho Rùa Vàng tại Hồ Tả Vọng?",
    options: ["A. Nguyễn Huệ", "B. Lê Lợi", "C. Đinh Bộ Lĩnh", "D. An Dương Vương"],
    correctIndex: 1
  },
  {
    q: "Biện pháp tu từ nào được sử dụng chính trong câu: 'Trẻ em như búp trên cành'?",
    options: ["A. Nhân hóa", "B. Liệt kê", "C. Nói quá", "D. So sánh"],
    correctIndex: 3
  }
];
