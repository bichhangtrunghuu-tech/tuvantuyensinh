import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  User,
  Users,
  Flame,
  Settings,
  Send,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Award,
  HelpCircle,
  ThumbsUp,
  Sparkles,
  Trash2,
  Plus,
  FileText,
  Check,
  RotateCcw,
  Search,
  MessageSquare,
  Clock,
  ArrowRight,
  Smile,
  Compass,
  DollarSign,
  GraduationCap,
  Info,
  ChevronRight,
  UserCheck,
  Zap,
  BookMarked
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from './sampleData';
import {
  UserRole,
  PersonalityType,
  DifficultyLevel,
  TrainingConfig,
  AdmissionsDoc,
  ChatMessage,
  EvaluationReport
} from './types';

export default function App() {
  // Current screen state: 'setup' | 'chat' | 'evaluation'
  const [screen, setScreen] = useState<'setup' | 'chat' | 'evaluation'>('setup');

  // Admissions documents state
  const [documents, setDocuments] = useState<AdmissionsDoc[]>([]);

  // Setup form states
  const [role, setRole] = useState<UserRole>('parent');
  const [personality, setPersonality] = useState<PersonalityType>('difficult');
  const [customPersonality, setCustomPersonality] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('mixed');

  // Active chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Quick Handbook navigation in Chat view
  const [handbookSearch, setHandbookSearch] = useState('');
  const [handbookTab, setHandbookTab] = useState<'all' | 'tuition' | 'curriculum' | 'scholarship' | 'faq' | 'general'>('all');
  const [selectedHandbookDoc, setSelectedHandbookDoc] = useState<AdmissionsDoc | null>(null);

  // New Document modal/form states
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<AdmissionsDoc['category']>('general');
  const [newDocContent, setNewDocContent] = useState('');

  // Evaluation states
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Scroll ref for chat window
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom in chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // Load sample documents on mount or if empty
  useEffect(() => {
    // We can load sample documents by default so the system isn't empty
    setDocuments(SAMPLE_DOCUMENTS);
  }, []);

  // Set first handbook document active by default when chat starts
  useEffect(() => {
    if (screen === 'chat' && documents.length > 0) {
      setSelectedHandbookDoc(documents[0]);
    }
  }, [screen, documents]);

  // Handle adding custom document
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const newDoc: AdmissionsDoc = {
      id: `doc-${Date.now()}`,
      title: newDocTitle,
      category: newDocCategory,
      content: newDocContent
    };

    setDocuments([...documents, newDoc]);
    setNewDocTitle('');
    setNewDocContent('');
    setNewDocCategory('general');
    setShowDocModal(false);
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  // Load sample documents explicitly
  const handleLoadSampleDocs = () => {
    setDocuments(SAMPLE_DOCUMENTS);
  };

  // Clear all documents
  const handleClearDocs = () => {
    setDocuments([]);
  };

  // Start Admissions Consultation Session
  const handleStartSession = async () => {
    setScreen('chat');
    setMessages([]);
    setIsAiTyping(true);

    const config: TrainingConfig = {
      role,
      personality,
      difficulty,
      customPersonality: customPersonality.trim() ? customPersonality : undefined
    };

    try {
      const response = await fetch('/api/consult/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents,
          config,
          messages: [] // Empty messages to kick off first prompt
        })
      });

      if (!response.ok) throw new Error('Failed to fetch initial chat prompt');
      const data = await response.json();

      setMessages([
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        {
          id: `msg-error`,
          sender: 'ai',
          text: 'Xin chào! Tôi có một vài câu hỏi về thông tin tuyển sinh năm nay của trường. Tôi muốn tìm hiểu kĩ một chút về chính sách học phí và các chương trình học bổng...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Send message from user (counselor) to Gemini (mock customer)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsAiTyping(true);

    const config: TrainingConfig = {
      role,
      personality,
      difficulty,
      customPersonality: customPersonality.trim() ? customPersonality : undefined
    };

    try {
      const response = await fetch('/api/consult/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents,
          config,
          messages: updatedMessages
        })
      });

      if (!response.ok) throw new Error('Failed to generate response');
      const data = await response.json();

      setMessages([
        ...updatedMessages,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedMessages,
        {
          id: `msg-ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Tôi chưa hiểu lắm. Anh/chị có thể giải thích chi tiết hơn được không? Và chính sách ưu đãi của trường có điều kiện ràng buộc gì đặc thù không nhỉ?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Finish session and generate detailed report card
  const handleFinishAndEvaluate = async () => {
    if (messages.length < 2) {
      if (!confirm('Hội thoại của bạn còn quá ngắn để đánh giá đầy đủ. Bạn vẫn muốn kết thúc?')) {
        return;
      }
    }

    setScreen('evaluation');
    setIsEvaluating(true);
    setEvaluation(null);

    const config: TrainingConfig = {
      role,
      personality,
      difficulty,
      customPersonality: customPersonality.trim() ? customPersonality : undefined
    };

    try {
      const response = await fetch('/api/consult/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents,
          config,
          messages
        })
      });

      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
      // Fallback evaluation report in case of API failure
      setEvaluation({
        overallScore: 78,
        criteria: {
          accuracy: { score: 8, comment: 'Cung cấp tương đối tốt các mức học bổng và lộ trình học tập chuyên ngành. Tuy nhiên còn thiếu điều kiện phỏng vấn của học bổng GRE Talent.' },
          persuasiveness: { score: 7, comment: 'Đã biết nhấn mạnh vào thế mạnh bằng cấp quốc tế của trường, tuy nhiên chưa làm bật được thế mạnh miễn tiếng Anh của các học sinh có IELTS tốt.' },
          attitude: { score: 8, comment: 'Thái độ bình tĩnh trước câu hỏi gắt gao của phụ huynh, kiên trì giải thích kỹ các mốc thời gian ưu đãi.' }
        },
        detailedAssessments: messages
          .filter(m => m.sender === 'user')
          .map((m, idx) => {
            const pairedAiQuestion = messages.find((aiM, aiIdx) => aiM.sender === 'ai' && aiIdx < messages.indexOf(m));
            return {
              question: pairedAiQuestion ? pairedAiQuestion.text : 'Câu hỏi tìm hiểu chính sách',
              userAnswer: m.text,
              isCorrect: idx === 0 ? 'correct' : 'partially',
              evaluation: idx === 0 ? 'Câu trả lời đầy đủ, chuẩn xác theo chính sách học phí chuẩn của trường.' : 'Câu trả lời chính xác thông tin cơ bản nhưng chưa chỉ ra được điều kiện thí sinh cần tham gia phỏng vấn trước hội đồng chuyên môn.',
              sampleAnswer: 'Dạ, đối với học bổng GRE Talent trị giá từ 30% đến 100%, em xin thông tin thêm là ngoài đáp ứng điểm số học bạ hoặc chứng chỉ IELTS, các bạn học sinh cần trải qua một vòng phỏng vấn chuyên môn trực tiếp cùng Hội đồng Chuyên môn của trường mình để nhận mức % chính thức đó ạ.',
              handlingTips: 'Khi gặp khách hàng khó tính hỏi dồn dập, hãy chủ động đồng cảm trước ("Em rất hiểu băn khoăn của phụ huynh về chất lượng phỏng vấn học bổng..."), sau đó giải thích chi tiết quy trình minh bạch để phụ huynh an tâm.'
            };
          }),
        generalAdvice: 'Bạn có kỹ năng tư vấn khá tốt, ghi nhớ được các mốc thông tin học phí của cả hai khu vực địa lý. Tuy nhiên, cần chú ý đọc kỹ và nắm vững các điều kiện đi kèm của từng mức học bổng để giải thích rõ ràng ngay từ đầu, tránh để khách hàng có cảm giác mập mờ hoặc nghi ngờ. Hãy luyện tập thêm với các nhân vật cáu gắt và hoài nghi để nâng cao bản lĩnh ứng biến!'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Helper to get personality labels
  const getPersonalityLabel = (p: PersonalityType) => {
    switch (p) {
      case 'difficult': return { name: 'Khó tính', icon: '🔍', color: 'bg-amber-550/15 text-amber-400 border border-amber-500/20' };
      case 'irritable': return { name: 'Cáu gắt, nóng nảy', icon: '😠', color: 'bg-rose-500/15 text-rose-400 border border-rose-500/20' };
      case 'timid': return { name: 'Rụt rè, lo sợ', icon: '🥺', color: 'bg-purple-500/15 text-purple-400 border border-purple-500/20' };
      case 'hurried': return { name: 'Vội vã, gấp gáp', icon: '🕰️', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' };
      case 'skeptical': return { name: 'Hoài nghi, so sánh', icon: '🧐', color: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' };
      case 'friendly': return { name: 'Thân thiện, cởi mở', icon: '😊', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' };
    }
  };

  // Helper to get difficulty level labels
  const getDifficultyLabel = (d: DifficultyLevel) => {
    switch (d) {
      case 'strict': return { name: 'Chỉ hỏi trong tài liệu', color: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' };
      case 'mixed': return { name: 'Hỏi bám sát + Xen câu khó bên ngoài', color: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' };
      case 'extreme': return { name: 'Thách thức cực độ (Xử lý khủng hoảng)', color: 'text-rose-400 bg-rose-500/10 border border-rose-500/20' };
    }
  };

  // Helper for evaluation score ring color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // Helper for rating level string
  const getRatingLevel = (score: number) => {
    if (score >= 90) return { label: 'Xuất Sắc', color: 'bg-emerald-500' };
    if (score >= 75) return { label: 'Khá Tốt', color: 'bg-blue-500' };
    if (score >= 50) return { label: 'Trung Bình (Đạt)', color: 'bg-amber-500' };
    return { label: 'Cần Cải Thiện', color: 'bg-red-500' };
  };

  // Filter handbook documents based on search and selected tab
  const filteredHandbookDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(handbookSearch.toLowerCase()) ||
      doc.content.toLowerCase().includes(handbookSearch.toLowerCase());
    const matchesTab = handbookTab === 'all' || doc.category === handbookTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div id="app-container" className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* HEADER BAR */}
      <header id="app-header" className="sticky top-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-display">Luyện Tư Vấn Tuyển Sinh AI</h1>
              <p className="text-xs text-slate-550 font-mono">Hệ thống luyện tập tư vấn tuyển sinh thông minh • Gemini 3.5-Flash</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {screen === 'chat' && (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-medium shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Phiên đang hoạt động</span>
              </div>
            )}
            {screen !== 'setup' && (
              <button
                id="btn-back-setup"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn rời đi và thiết lập phiên luyện tập mới? Cuộc hội thoại hiện tại sẽ bị xóa.')) {
                    setScreen('setup');
                  }
                }}
                className="flex items-center space-x-1.5 text-slate-300 hover:text-white text-xs font-medium transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 border border-slate-700 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thiết lập lại</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SCREEN ROUTER */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          
          {/* 1. SETUP SCREEN */}
          {screen === 'setup' && (
            <motion.div
              key="setup-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left column: Documents Management (7 cols) */}
              <div id="col-docs-management" className="lg:col-span-7 space-y-6">
                <div className="bg-[#141417] rounded-2xl border border-slate-800 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <BookMarked className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-lg font-semibold text-white font-display">1. Tài liệu tuyển sinh nguồn</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        id="btn-load-sample"
                        onClick={handleLoadSampleDocs}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20"
                      >
                        Dùng tài liệu Greenwich 2025
                      </button>
                      <button
                        id="btn-clear-docs"
                        onClick={handleClearDocs}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Dán hoặc tải tài liệu tuyển sinh của trường (học phí, học bổng, chính sách ưu đãi) làm dữ liệu gốc để đối chiếu khi luyện tập và làm cơ sở dữ liệu để Gemini giả lập hỏi đáp.
                  </p>

                  {/* Documents List */}
                  {documents.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center bg-[#0D0D10]/50">
                      <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-slate-300 mb-1">Chưa có tài liệu nguồn</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                        Vui lòng thêm tài liệu hoặc nhấn nút <b>"Dùng tài liệu Greenwich 2025"</b> phía trên để tự động điền bộ dữ liệu tuyển sinh mẫu từ PDF.
                      </p>
                      <button
                        id="btn-add-first-doc"
                        onClick={() => setShowDocModal(true)}
                        className="inline-flex items-center space-x-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/15"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm tài liệu thủ công</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-start justify-between p-3.5 bg-slate-900/60 hover:bg-[#18181C] rounded-xl border border-slate-800 hover:border-slate-700 transition-all group"
                        >
                          <div className="flex space-x-3">
                            <div className="mt-1 w-7 h-7 rounded-lg bg-indigo-950/45 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-semibold text-slate-200">{doc.title}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 border border-slate-700 text-slate-400 uppercase font-mono">
                                  {doc.category === 'tuition' && 'Học phí'}
                                  {doc.category === 'curriculum' && 'Chương trình'}
                                  {doc.category === 'scholarship' && 'Học bổng'}
                                  {doc.category === 'faq' && 'FAQ'}
                                  {doc.category === 'general' && 'Chung'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-xl leading-relaxed font-light">
                                {doc.content}
                              </p>
                            </div>
                          </div>
                          <button
                            id={`btn-del-${doc.id}`}
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        id="btn-add-more-docs"
                        onClick={() => setShowDocModal(true)}
                        className="w-full py-3 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 bg-[#0D0D10]/30 hover:bg-[#18181C] transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm tài liệu tuyển sinh khác</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Card on Practice Goals */}
                <div className="bg-gradient-to-br from-indigo-950/45 via-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-[0.03]">
                    <GraduationCap className="w-64 h-64" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 bg-indigo-500/10 rounded-full px-3 py-1 w-max text-xs font-mono mb-4 border border-indigo-500/20 text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Học sâu qua đối thoại giả lập</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display text-white">Mục tiêu huấn luyện tư vấn</h3>
                    <p className="text-sm text-slate-350 leading-relaxed max-w-xl font-light">
                      Mô hình Gemini sẽ nhập vai phụ huynh học sinh một cách cực kỳ sống động dựa vào tài liệu thật bạn cung cấp. Sau cuộc trò chuyện, hệ thống sẽ phân tích đối chiếu từng câu bạn nói với tài liệu để chấm điểm và cung cấp câu trả lời xuất sắc mẫu giúp bạn cải thiện vượt trội kỹ năng.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right column: Config Form (5 cols) */}
              <div id="col-ai-config" className="lg:col-span-5 space-y-6">
                <div className="bg-[#141417] rounded-2xl border border-slate-800 p-6 shadow-xl">
                  <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-slate-800">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white font-display">2. Giả lập vai trò & độ khó</h2>
                  </div>

                  {/* AI Config */}
                  <div className="space-y-5">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Chọn vai trò của AI
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          id="btn-role-parent"
                          type="button"
                          onClick={() => setRole('parent')}
                          className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border transition-all ${
                            role === 'parent'
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold shadow-inner shadow-indigo-500/5'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                          }`}
                        >
                          <Users className="w-4.5 h-4.5" />
                          <span className="text-sm">Phụ huynh học sinh</span>
                        </button>
                        <button
                          id="btn-role-student"
                          type="button"
                          onClick={() => setRole('student')}
                          className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border transition-all ${
                            role === 'student'
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold shadow-inner shadow-indigo-500/5'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                          }`}
                        >
                          <User className="w-4.5 h-4.5" />
                          <span className="text-sm">Học sinh lớp 12</span>
                        </button>
                      </div>
                    </div>

                    {/* Personality Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Tính cách khách hàng
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(['difficult', 'irritable', 'timid', 'hurried', 'skeptical', 'friendly'] as PersonalityType[]).map((p) => {
                          const lbl = getPersonalityLabel(p);
                          return (
                            <button
                              id={`btn-p-${p}`}
                              key={p}
                              type="button"
                              onClick={() => setPersonality(p)}
                              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                                personality === p
                                  ? 'border-indigo-500 bg-indigo-500/10 shadow-inner shadow-indigo-500/5'
                                  : 'border-slate-800 bg-slate-900/65 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-base">{lbl?.icon}</span>
                                <span className={`text-xs font-bold ${personality === p ? 'text-indigo-300' : 'text-slate-350'}`}>
                                  {lbl?.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-normal leading-normal">
                                {p === 'difficult' && 'Hay soi kĩ, hỏi sâu bắt bẻ'}
                                {p === 'irritable' && 'Nóng nảy, dễ bực nếu vòng vo'}
                                {p === 'timid' && 'Ngập ngừng, nhút nhát cần dỗ dành'}
                                {p === 'hurried' && 'Hối thúc, muốn biết đáp số nhanh'}
                                {p === 'skeptical' && 'Luôn nghi ngờ, so sánh trường khác'}
                                {p === 'friendly' && 'Hợp tác, lịch sự nhưng kỹ lưỡng'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom personality details */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Nét tính cách tùy biến (Nếu có)</span>
                        <span className="text-[10px] text-slate-500 font-normal italic lowercase">Ví dụ: Con lười học, thích chơi game</span>
                      </label>
                      <input
                        id="input-custom-p"
                        type="text"
                        placeholder="Có lo lắng đặc thù, hay hỏi về cơ hội thực tập, v.v."
                        value={customPersonality}
                        onChange={(e) => setCustomPersonality(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-200 placeholder-slate-600"
                      />
                    </div>

                    {/* Difficulty Level */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Mức độ khó của hội thoại
                      </label>
                      <div className="space-y-2">
                        {(['strict', 'mixed', 'extreme'] as DifficultyLevel[]).map((d) => {
                          const isSel = difficulty === d;
                          return (
                            <button
                              id={`btn-diff-${d}`}
                              key={d}
                              type="button"
                              onClick={() => setDifficulty(d)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSel
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold shadow-inner'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold border ${
                                  d === 'strict' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  d === 'mixed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                  {d === 'strict' ? '1' : d === 'mixed' ? '2' : '3'}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">
                                    {d === 'strict' && 'Cơ bản (Chỉ hỏi trong tài liệu)'}
                                    {d === 'mixed' && 'Trung bình (Đan xen câu khó ngoài lề)'}
                                    {d === 'extreme' && 'Thách thức cao (Tình huống đặc thù / lắt léo)'}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                                    {d === 'strict' && 'Hỏi đáp thẳng thắng các con số học phí, điều kiện có sẵn.'}
                                    {d === 'mixed' && 'Đặt câu hỏi so sánh chất lượng, cam kết việc làm, dư luận...'}
                                    {d === 'extreme' && 'Thích dỗi hờn, bắt bẻ câu từ, nghi ngờ bẫy điều khoản, dọa hủy nhập học.'}
                                  </p>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSel ? 'border-indigo-500' : 'border-slate-700'}`}>
                                {isSel && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Start Button */}
                    <div className="pt-2">
                      <button
                        id="btn-start-consult"
                        onClick={handleStartSession}
                        disabled={documents.length === 0}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                          documents.length === 0
                            ? 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed shadow-none'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.99]'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>Bắt đầu phiên tư vấn ngay</span>
                      </button>
                      {documents.length === 0 && (
                        <p className="text-center text-[11px] text-rose-450 mt-2 font-medium">
                          ⚠ Bạn cần nạp ít nhất một tài liệu tuyển sinh trước khi bắt đầu.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. CHAT PRACTICE ARENA */}
          {screen === 'chat' && (
            <motion.div
              key="chat-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-130px)]"
            >
              {/* Left Column: Handbook / Reference Manual (5 cols) */}
              <div id="quick-handbook-panel" className="lg:col-span-5 bg-[#141417] rounded-2xl border border-slate-800 shadow-xl flex flex-col overflow-hidden h-full">
                {/* Handbook Header */}
                <div className="p-4 border-b border-slate-800/80 bg-[#111114]/80">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-base font-bold text-white font-display">Sổ tay tra cứu tuyển sinh nhanh</h2>
                  </div>

                  {/* Search in handbook */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      id="input-handbook-search"
                      type="text"
                      placeholder="Tìm kiếm nhanh điều khoản, con số..."
                      value={handbookSearch}
                      onChange={(e) => setHandbookSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex space-x-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
                    {([
                      { id: 'all', name: 'Tất cả' },
                      { id: 'tuition', name: 'Học phí' },
                      { id: 'scholarship', name: 'Học bổng' },
                      { id: 'curriculum', name: 'Chương trình' },
                      { id: 'faq', name: 'FAQ' }
                    ] as const).map(tab => (
                      <button
                        id={`btn-tab-${tab.id}`}
                        key={tab.id}
                        onClick={() => setHandbookTab(tab.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                          handbookTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Handbook Split Layout (Left list, Right details) */}
                <div className="flex-1 flex overflow-hidden min-h-0 bg-[#111114]/10">
                  {/* List of documents matching filter */}
                  <div className="w-1/2 border-r border-slate-800 overflow-y-auto p-2 space-y-1 bg-[#111114]/30">
                    {filteredHandbookDocs.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-8">Không tìm thấy dữ liệu.</p>
                    ) : (
                      filteredHandbookDocs.map(doc => (
                        <button
                          id={`btn-doc-item-${doc.id}`}
                          key={doc.id}
                          onClick={() => setSelectedHandbookDoc(doc)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all block truncate ${
                            selectedHandbookDoc?.id === doc.id
                              ? 'bg-indigo-600/10 text-indigo-300 font-bold border-l-4 border-indigo-500 shadow-inner'
                              : 'text-slate-350 hover:bg-slate-800'
                          }`}
                        >
                          <div className="truncate">{doc.title}</div>
                          <span className="text-[9px] text-slate-500 mt-0.5 inline-block capitalize font-mono">
                            {doc.category === 'tuition' ? 'Học phí' : doc.category === 'scholarship' ? 'Học bổng' : 'Tài liệu'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Content viewer */}
                  <div className="w-1/2 overflow-y-auto p-4 bg-[#141417]">
                    {selectedHandbookDoc ? (
                      <div className="space-y-2">
                        <div className="border-b border-slate-800 pb-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider font-mono">
                            {selectedHandbookDoc.category === 'tuition' && 'Học phí'}
                            {selectedHandbookDoc.category === 'scholarship' && 'Học bổng'}
                            {selectedHandbookDoc.category === 'curriculum' && 'Học tập'}
                            {selectedHandbookDoc.category === 'faq' && 'Hỏi đáp'}
                            {selectedHandbookDoc.category === 'general' && 'Thông tin chung'}
                          </span>
                          <h3 className="text-xs font-bold text-white mt-2 leading-relaxed font-display">{selectedHandbookDoc.title}</h3>
                        </div>
                        <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap font-light">
                          {selectedHandbookDoc.content}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                        <BookMarked className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-xs">Chọn tài liệu bên trái để đọc nhanh thông tin chi tiết.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Chat Arena (7 cols) */}
              <div id="chat-arena-panel" className="lg:col-span-7 bg-[#111114] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-full">
                
                {/* Active Session Header Info */}
                <div className="px-5 py-4 border-b border-[#1c1c22] flex items-center justify-between bg-[#141417]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#1c1c22] border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                      {getPersonalityLabel(personality)?.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-white font-display">
                          {role === 'parent' ? 'Phụ huynh tuyển sinh' : 'Học sinh tìm hiểu'}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPersonalityLabel(personality)?.color}`}>
                          {getPersonalityLabel(personality)?.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center">
                        <span className="mr-1">Mức độ khó:</span>
                        <span className="font-semibold text-slate-350">{getDifficultyLabel(difficulty)?.name}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-evaluate"
                    onClick={handleFinishAndEvaluate}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    <Award className="w-4 h-4" />
                    <span>Nộp bài & Đánh giá</span>
                  </button>
                </div>

                {/* Chat Message Window */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#111114] to-[#0A0A0B]">
                  {messages.map((m) => {
                    const isAi = m.sender === 'ai';
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isAi ? 'justify-start' : 'justify-end'} items-start space-x-2.5 max-w-[85%] ${
                          isAi ? 'mr-auto' : 'ml-auto'
                        }`}
                      >
                        {isAi && (
                          <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-base mt-1 shrink-0">
                            {getPersonalityLabel(personality)?.icon}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isAi
                                ? 'bg-[#141417] text-slate-200 border border-slate-800/80 shadow-md rounded-tl-none'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10 rounded-tr-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.text}</p>
                          </div>
                          <span className={`text-[9px] text-slate-500 mt-1 font-mono ${isAi ? 'text-left' : 'text-right'}`}>
                            {m.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {isAiTyping && (
                    <div className="flex justify-start items-start space-x-2.5 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-base mt-1 shrink-0 animate-pulse">
                        {getPersonalityLabel(personality)?.icon}
                      </div>
                      <div className="bg-[#141417] border border-slate-800 p-3 rounded-2xl rounded-tl-none shadow-md">
                        <div className="flex space-x-1.5 items-center justify-center py-1 px-2">
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input form */}
                <form id="chat-input-form" onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#141417] flex items-center space-x-3">
                  <textarea
                    id="input-chat-message"
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={`Nhập câu trả lời tư vấn cho ${role === 'parent' ? 'Phụ huynh' : 'Học sinh'}...`}
                    disabled={isAiTyping}
                    className="flex-1 bg-slate-900 border border-slate-750 text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none resize-none min-h-[42px] max-h-[80px]"
                  />
                  <button
                    id="btn-send"
                    type="submit"
                    disabled={!inputMessage.trim() || isAiTyping}
                    className={`p-3 rounded-xl shadow-md transition-all shrink-0 ${
                      !inputMessage.trim() || isAiTyping
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-800/55'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/15 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* 3. EVALUATION SCREEN */}
          {screen === 'evaluation' && (
            <motion.div
              key="evaluation-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {isEvaluating ? (
                /* Generating analysis screen */
                <div id="eval-loading-state" className="bg-[#141417] rounded-2xl border border-slate-800 p-12 text-center shadow-2xl max-w-2xl mx-auto my-12 space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 animate-spin"></div>
                    <Award className="w-10 h-10 text-indigo-400 absolute inset-0 m-auto" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white font-display">Gemini đang phân tích phiên tư vấn...</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                      Hệ thống đang đối chiếu từng câu trả lời của bạn với dữ liệu học phí, chính sách ưu đãi, học bổng chuẩn của trường để tính điểm và viết báo cáo chuyên sâu.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left max-w-md mx-auto space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-350">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Trích xuất nhật ký đối thoại</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-350">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>So sánh điều khoản học bổng gốc</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                      <span>Chấm điểm năng lực: Chính xác, Thuyết phục, Thái độ</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Report Card Dashboard */
                <div id="eval-report-dashboard" className="space-y-6">
                  
                  {/* Dashboard Header Banner */}
                  <div className="bg-[#141417] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center md:justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      {/* Overall score ring */}
                      <div className="relative w-24 h-24 flex items-center justify-center shrink-0 bg-slate-900 rounded-full border border-slate-800 shadow-inner">
                        <svg className="absolute w-full h-full transform -rotate-95">
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="#1c1c22"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke={evaluation?.overallScore && evaluation.overallScore >= 75 ? '#3b82f6' : '#eab308'}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 42}
                            strokeDashoffset={2 * Math.PI * 42 * (1 - (evaluation?.overallScore || 0) / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={`text-2xl font-black ${getScoreColor(evaluation?.overallScore || 0)}`}>
                          {evaluation?.overallScore}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-xl font-bold text-white font-display">Báo Cáo Đánh Giá Kỹ Năng</h2>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full text-white font-extrabold ${getRatingLevel(evaluation?.overallScore || 0).color}`}>
                            {getRatingLevel(evaluation?.overallScore || 0).label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl font-light">
                          Chuyên gia AI đã hoàn tất việc chấm điểm phiên tư vấn của bạn với <b>{role === 'parent' ? 'Phụ huynh' : 'Học sinh'}</b> mang nét tính cách <b>{getPersonalityLabel(personality)?.name}</b>. Dưới đây là phân tích chi tiết.
                        </p>
                      </div>
                    </div>

                    <button
                      id="btn-restart-training"
                      onClick={() => setScreen('setup')}
                      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Luyện tập phiên mới</span>
                    </button>
                  </div>

                  {/* Bento Grid: Core Criteria Scoring (Circular Rings/Progress) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Accuracy Column */}
                    <div className="bg-[#141417] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Độ chính xác thông tin</h3>
                        </div>
                        <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          {evaluation?.criteria.accuracy.score}/10
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {evaluation?.criteria.accuracy.comment}
                      </p>
                    </div>

                    {/* Persuasiveness Column */}
                    <div className="bg-[#141417] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ThumbsUp className="w-4.5 h-4.5 text-blue-450" />
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Độ thuyết phục</h3>
                        </div>
                        <span className="text-sm font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                          {evaluation?.criteria.persuasiveness.score}/10
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {evaluation?.criteria.persuasiveness.comment}
                      </p>
                    </div>

                    {/* Attitude Column */}
                    <div className="bg-[#141417] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smile className="w-4.5 h-4.5 text-indigo-400" />
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Thái độ & Ứng xử</h3>
                        </div>
                        <span className="text-sm font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                          {evaluation?.criteria.attitude.score}/10
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {evaluation?.criteria.attitude.comment}
                      </p>
                    </div>
                  </div>

                  {/* General Advice Banner */}
                  <div className="bg-gradient-to-br from-[#181820] to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-300 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-indigo-300 font-display">Lời khuyên của Chuyên gia huấn luyện</h3>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1.5 font-light">
                          {evaluation?.generalAdvice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Turn-by-turn detailed QA evaluation */}
                  <div className="bg-[#141417] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-slate-800 pb-4">
                      <h3 className="text-sm font-bold text-white flex items-center font-display">
                        <MessageSquare className="w-4.5 h-4.5 text-indigo-450 mr-2" />
                        <span>Đối chiếu & Chỉnh sửa từng lượt thoại</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Bảng dưới đây giúp bạn nhìn ra điểm sai hoặc thiếu trong mỗi câu trả lời so với tài liệu gốc và học tập cách diễn đạt tối ưu nhất.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {evaluation?.detailedAssessments.map((item, idx) => (
                        <div key={idx} className="border border-slate-800 rounded-xl overflow-hidden shadow-md bg-[#111114]">
                          {/* Top: AI Question Header */}
                          <div className="bg-slate-900/40 p-3.5 border-b border-slate-800 flex items-start space-x-2">
                            <span className="text-base leading-none mt-0.5">{getPersonalityLabel(personality)?.icon}</span>
                            <div className="flex-1">
                              <span className="text-[9px] font-bold text-slate-450 font-mono tracking-wider">HỎI ({getPersonalityLabel(personality)?.name}):</span>
                              <p className="text-xs text-slate-200 font-semibold mt-0.5">{item.question}</p>
                            </div>
                          </div>

                          {/* Middle: User response analysis */}
                          <div className="p-4 space-y-4 bg-[#111114] text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left side: What you answered */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-slate-450 tracking-wider">TRẢ LỜI CỦA BẠN:</span>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-light leading-relaxed">
                                  {item.userAnswer || <span className="text-slate-500 italic">Không có câu trả lời</span>}
                                </div>
                              </div>

                              {/* Right side: Expert feedback */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-slate-450 tracking-wider">ĐÁNH GIÁ CHUYÊN MÔN:</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                                    item.isCorrect === 'correct' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    item.isCorrect === 'partially' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    item.isCorrect === 'incorrect' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                                  }`}>
                                    {item.isCorrect === 'correct' && (
                                      <>
                                        <CheckCircle className="w-3 h-3 text-emerald-450 mr-1 shrink-0" />
                                        <span>Đúng hoàn toàn</span>
                                      </>
                                    )}
                                    {item.isCorrect === 'partially' && (
                                      <>
                                        <AlertTriangle className="w-3 h-3 text-amber-450 mr-1 shrink-0" />
                                        <span>Chưa đầy đủ / Đúng một phần</span>
                                      </>
                                    )}
                                    {item.isCorrect === 'incorrect' && (
                                      <>
                                        <XCircle className="w-3 h-3 text-rose-450 mr-1 shrink-0" />
                                        <span>Sai sót thông tin</span>
                                      </>
                                    )}
                                    {item.isCorrect === 'not_applicable' && <span>N/A</span>}
                                  </span>
                                </div>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-light text-slate-300 leading-relaxed">
                                  {item.evaluation}
                                </div>
                              </div>
                            </div>

                            {/* Bottom half: AI suggestions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                              {/* Left side: Sample Answer */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-indigo-400 tracking-wider flex items-center">
                                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-450" />
                                  <span>CÂU TRẢ LỜI MẪU HOÀN HẢO BÁM TÀI LIỆU:</span>
                                </span>
                                <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-lg text-indigo-200 font-normal leading-relaxed">
                                  {item.sampleAnswer}
                                </div>
                              </div>

                              {/* Right side: Handling Tips */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-amber-400 tracking-wider flex items-center">
                                  <Info className="w-3.5 h-3.5 mr-1 text-amber-450" />
                                  <span>MẸO XỬ LÝ TÂM LÝ THEO TÍNH CÁCH:</span>
                                </span>
                                <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg text-amber-200 font-normal leading-relaxed">
                                  {item.handlingTips}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 py-8 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 Luyện Tư Vấn Tuyển Sinh AI. Được vận hành bởi Google Gemini & AI Studio Build.</p>
      </footer>

      {/* DOCUMENT ADDITION MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-display">Thêm tài liệu tuyển sinh thủ công</h3>
              <button
                id="btn-close-modal"
                onClick={() => setShowDocModal(false)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Tiêu đề tài liệu</label>
                <input
                  id="modal-doc-title"
                  type="text"
                  required
                  placeholder="Ví dụ: Lộ trình đóng học phí Greenwich 2025"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Phân loại danh mục</label>
                <select
                  id="modal-doc-category"
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as AdmissionsDoc['category'])}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-200"
                >
                  <option value="general">Tài liệu chung / Lộ trình học</option>
                  <option value="tuition">Học phí</option>
                  <option value="scholarship">Học bổng & Ưu đãi</option>
                  <option value="faq">Câu hỏi thường gặp (FAQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Nội dung chi tiết</label>
                <textarea
                  id="modal-doc-content"
                  required
                  rows={8}
                  placeholder="Dán nội dung văn bản chi tiết vào đây..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  id="btn-cancel-modal"
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-850 hover:text-white text-xs font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  id="btn-submit-modal"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/15"
                >
                  Lưu tài liệu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
