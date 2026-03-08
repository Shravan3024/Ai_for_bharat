import { useState, useEffect, useRef } from "react";
import { useAuthStore, useAccessibilityStore } from "../stores/authStore";
import { apiService } from "../services/apiService";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Headphones,
  Brain,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Star,
  BookMarked,
  BarChart3,
  Clock,
  Target,
  MessageCircle,
  Loader2,
  AlertCircle,
  Bot,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [studentSummary, setStudentSummary] = useState(null);
  const [libraryData, setLibraryData] = useState({ texts: [], vocabulary: [] });
  const [demoData, setDemoData] = useState({ weeklyProgress: [], quizzes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const profile = await apiService.getProfile();
        if (profile && profile.id) {
          const summary = await apiService.getStudentSummary(profile.id);
          setStudentSummary(summary);
        }
        
        // Fetch library content from API
        const library = await apiService.getLibrary();
        if (library && library.texts) {
          setLibraryData(library);
        }

        // Fetch remaining hardcoded mock data for the demo
        const demo = await apiService.getStudentProgressDemo();
        if (demo && !demo.error) {
          setDemoData(demo);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load your progress data.");
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const tabs = [
    { key: "home", label: "Home", icon: BookOpen },
    { key: "read", label: "Read", icon: FileText },
    { key: "quiz", label: "Quiz", icon: Brain },
    { key: "vocab", label: "Vocabulary", icon: BookMarked },
    { key: "progress", label: "Progress", icon: BarChart3 },
    { key: "chat", label: "LexiBot", icon: Bot },
  ];

  if (loading && !studentSummary) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Greeting */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-text">
              Hey, {user?.full_name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-text-secondary mt-1">
              {studentSummary?.at_risk 
                ? "Let's take it slow today. You're doing great!" 
                : "Ready to read and learn today?"}
            </p>
          </div>
          {studentSummary?.at_risk && (
            <div className="bg-peach/20 border border-peach text-accent px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Recommendation: Shorter reading sessions
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? "bg-primary text-white shadow-card"
                  : "bg-surface text-text-secondary hover:bg-surface-dim border border-border"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

          {/* Tab Content */}
          {activeTab === "home" && <HomeTab summary={studentSummary} libraryTexts={libraryData.texts} weeklyProgress={demoData.weeklyProgress} onTabChange={setActiveTab} />}
          {activeTab === "read" && <ReadTab summary={studentSummary} libraryTexts={libraryData.texts} />}
          {activeTab === "quiz" && <QuizTab summary={studentSummary} quizzes={demoData.quizzes} />}
          {activeTab === "vocab" && <VocabTab summary={studentSummary} vocabulary={libraryData.vocabulary} />}
          {activeTab === "progress" && <ProgressTab summary={studentSummary} weeklyProgress={demoData.weeklyProgress} />}
          {activeTab === "chat" && <ChatTab navigate={navigate} />}
      </div>
    </div>
  );
}

/* ========== HOME TAB ========== */
function HomeTab({ summary, libraryTexts = [], weeklyProgress = [], onTabChange }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Streak"
          value={`5 days`}
          color="accent"
        />
        <StatCard
          icon={Clock}
          label="Reading Time"
          value={`${Math.round(summary?.total_words_read / 100) || 12} min`}
          color="primary"
        />
        <StatCard
          icon={BookMarked}
          label="Words Learned"
          value={summary?.mastered_vocabulary_count || 0}
          color="success"
        />
        <StatCard
          icon={Target}
          label="Comprehension"
          value={`${Math.round(summary?.avg_accuracy) || 0}%`}
          color="secondary"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          icon={BookOpen}
          title="Start Reading"
          desc="Read and get AI explanations"
          color="primary"
          bg="bg-lavender"
          onClick={() => onTabChange("read")}
        />
        <ActionCard
          icon={Brain}
          title="Today's Quiz"
          desc="Test your knowledge"
          color="accent"
          bg="bg-peach"
          onClick={() => onTabChange("quiz")}
        />
        <ActionCard
          icon={Bot}
          title="Ask LexiBot"
          desc="Chat with your AI assistant"
          color="success"
          bg="bg-mint"
          onClick={() => onTabChange("chat")}
        />
      </div>

      {/* Recent Texts */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Recent Texts</h2>
        <div className="space-y-3">
          {libraryTexts.map((text) => (
            <div
              key={text.id}
              className="flex items-center justify-between p-4 rounded-xl bg-surface-dim hover:bg-cream transition-colors cursor-pointer"
              onClick={() => onTabChange("read")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text">{text.title}</p>
                  <p className="text-sm text-text-muted">
                    {text.readCount} sessions completed
                  </p>
                </div>
              </div>
              <span className="text-sm text-primary font-medium">Read</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          This Week's Reading
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip />
            <Bar dataKey="minutes" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ========== READ TAB ========== */
function ReadTab({ summary, libraryTexts = [] }) {
  const { readingPace } = useAccessibilityStore();
  const fileInputRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [ragInput, setRagInput] = useState("");
  const [ragOutput, setRagOutput] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [metrics, setMetrics] = useState([]);

  const startReading = async () => {
    const text = inputText.trim();
    if (!text) return;
    
    try {
      const session = await apiService.startSession("manual_input", "text");
      setSessionId(session.id);
      
      const split = text.match(/[^.!?]+[.!?]+/g) || [text];
      setSentences(split.map((s) => s.trim()));
      setCurrentIndex(0);
      setAiOutput("");
      setMetrics([]);
    } catch (err) {
      console.error("Failed to start session:", err);
      const split = text.match(/[^.!?]+[.!?]+/g) || [text];
      setSentences(split.map((s) => s.trim()));
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    try {
      const res = await apiService.uploadPDF(file);
      if (res.text) {
        setInputText(res.text);
      } else {
        alert("Could not extract text from this PDF.");
      }
    } catch (err) {
      alert("Failed to upload PDF.");
    } finally {
      setPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExplain = async () => {
    if (!sentences[currentIndex]) return;
    setAiLoading(true);
    try {
      const res = await apiService.simplifyText(sentences[currentIndex], 5);
      setAiOutput(res.simplified);
      
      const newMetric = {
        timestamp: new Date().toISOString(),
        reading_speed_wpm: 60,
        accuracy_percentage: 100,
        simplification_level_requested: 5,
        reread_count: 0,
        pauses_detected: 0,
        fatigue_score: 0
      };
      setMetrics(prev => [...prev, newMetric]);
    } catch (err) {
      setAiOutput("Sorry, I couldn't simplify this right now.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskAI = async () => {
    if (!ragInput.trim()) return;
    setRagLoading(true);
    try {
      const res = await apiService.ragQuery(ragInput, sentences.join(" "));
      setRagOutput(res.answer);
    } catch (err) {
      setRagOutput("Sorry, I couldn't find an answer in the text.");
    } finally {
      setRagLoading(false);
    }
  };

  const finishSession = async () => {
    if (!sessionId) return;
    try {
      await apiService.updateSessionMetrics(sessionId, {
        metrics: metrics,
        end_time: new Date().toISOString()
      });
      await apiService.calculateSessionAnalytics(sessionId, metrics);
      alert("Session saved! Your progress has been updated.");
      setSentences([]);
    } catch (err) {
      console.error("Failed to finish session:", err);
    }
  };

  const speakSentence = () => {
    if (!sentences.length) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);
    utterance.rate = readingPace;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Panel */}
      <div className="bg-surface rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Paste or Upload Text
        </h2>
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text here..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none reading-text"
        />

        {/* PDF Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePDFUpload}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm font-medium text-text-secondary cursor-pointer hover:border-primary hover:text-primary transition-colors ${pdfLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {pdfLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {pdfLoading ? "Extracting text..." : "Upload PDF"}
          </label>
        </div>

        <button
          onClick={startReading}
          disabled={!inputText.trim()}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          Start Reading
        </button>

        {/* Sample Texts */}
        <div className="pt-2">
          <p className="text-sm text-text-muted mb-2">Or try a sample:</p>
          <div className="space-y-2">
            {libraryTexts.map((t) => (
              <button
                key={t.id}
                onClick={() => setInputText(t.originalText)}
                className="w-full text-left px-3 py-2 rounded-lg bg-cream hover:bg-lavender transition-colors text-sm"
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reading Panel */}
      <div className="lg:col-span-2 space-y-4">
        {sentences.length === 0 ? (
          <div className="bg-surface rounded-2xl shadow-card p-12 text-center">
            <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">
              Ready to Read
            </h3>
            <p className="text-text-secondary">
              Paste text or upload a PDF on the left, then click "Start Reading".
            </p>
          </div>
        ) : (
          <>
            <div className="bg-surface rounded-xl p-3 shadow-card">
              <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
                <span>
                  Sentence {currentIndex + 1} of {sentences.length}
                </span>
                <span>
                  {Math.round(((currentIndex + 1) / sentences.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-dim rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / sentences.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-surface rounded-2xl shadow-card p-8 min-h-[150px] flex items-center">
              <p className="text-2xl leading-relaxed reading-text text-text">
                {sentences[currentIndex]}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setCurrentIndex(Math.max(0, currentIndex - 1));
                  setAiOutput("");
                }}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-dim transition-colors font-medium disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={speakSentence}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors font-medium"
              >
                <Volume2 className="w-4 h-4" />
                Listen
              </button>

              <button
                onClick={handleExplain}
                disabled={aiLoading}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors font-medium"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Explain
              </button>

              {currentIndex === sentences.length - 1 ? (
                <button
                  onClick={finishSession}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors font-medium"
                >
                  Finish Session
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setCurrentIndex(currentIndex + 1);
                    setAiOutput("");
                  }}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {aiOutput && (
              <div className="bg-lavender rounded-2xl p-6 border border-primary/10">
                <h3 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  AI Explanation
                </h3>
                <p className="text-text-secondary leading-relaxed reading-text">
                  {aiOutput}
                </p>
              </div>
            )}

            {/* RAG Section */}
            <div className="bg-mint/30 rounded-2xl p-6 border border-success/10 mt-6">
              <h3 className="font-semibold text-text mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-success" />
                Ask about the text
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={ragInput}
                  onChange={(e) => setRagInput(e.target.value)}
                  placeholder="e.g., What is the main idea?"
                  className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-success/30"
                />
                <button
                  onClick={handleAskAI}
                  disabled={ragLoading || !ragInput.trim()}
                  className="px-4 py-2 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success-dark transition-colors disabled:opacity-50"
                >
                  {ragLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
                </button>
              </div>
              {ragOutput && (
                <div className="bg-white/50 rounded-xl p-4 text-sm text-text-secondary italic">
                  {ragOutput}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


/* ========== QUIZ TAB ========== */
function QuizTab({ summary, quizzes = [] }) {
  const [currentQuiz, setCurrentQuiz] = useState(quizzes[0] || null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    try {
      const res = await apiService.generateQuiz("The water cycle is the path that all water follows as it moves around Earth in different states. Liquid water finds its way into oceans, lakes, and rivers. Water evaporates into the air. It then condenses into clouds.", 3);
      if (res.questions && res.questions.length > 0) {
        setCurrentQuiz({
          title: "AI Generated Quiz",
          questions: res.questions.map(q => ({
            id: q.id,
            text: q.question,
            options: q.options,
            correctAnswer: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0,
            explanation: "Based on the text provided."
          }))
        });
        resetQuiz();
      }
    } catch (err) {
      console.error("Quiz gen failed:", err);
    } finally {
      setGenerating(false);
    }
  };

    const question = currentQuiz?.questions?.[currentQ];

    // Guard: if no question available yet, show generate button
    if (!question) {
      return (
        <div className="max-w-xl mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-dim flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text">No Questions Available</h2>
          <p className="text-text-secondary mt-2 mb-6">Generate a new quiz to test your knowledge.</p>
          <button
            onClick={handleGenerateQuiz}
            disabled={generating}
            className="px-6 py-3 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-dark transition-all flex items-center justify-center gap-2 shadow-card mx-auto"
          >
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate New Quiz with AI
          </button>
        </div>
      );
    }

    const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
      if (currentQ < currentQuiz.questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setFinished(true);
        // Pass the final score directly to avoid stale closure
        const finalScore = selected === question.correctAnswer ? score + 1 : score;
        submitResult(finalScore, currentQuiz);
      }
    };

    const submitResult = async (finalScore, quiz) => {
      try {
        await apiService.submitQuizResult({
          student_id: 0, // Backend uses current_user anyway
          quiz_title: quiz.title,
          score: finalScore,
          total_questions: quiz.questions.length,
          details: {}
        });
      } catch (err) {
        console.error("Failed to submit result:", err);
      }
    };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  if (!currentQuiz) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-surface-dim flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-text">No Quizzes Active</h2>
        <p className="text-text-secondary mt-2 mb-6">You can generate a new quiz to test your knowledge.</p>
        <button 
          onClick={handleGenerateQuiz}
          disabled={generating}
          className="px-6 py-3 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-dark transition-all flex items-center justify-center gap-2 shadow-card mx-auto"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Generate New Quiz with AI
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Great Job!</h2>
          <p className="text-text-secondary mb-4">
            You scored <span className="font-bold text-primary">{score}/{currentQuiz.questions.length}</span>
          </p>
          <button
            onClick={resetQuiz}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!answered && currentQ === 0 && (
        <button 
          onClick={handleGenerateQuiz}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-secondary text-white font-bold hover:bg-secondary-dark transition-all flex items-center justify-center gap-2 shadow-card"
        >
          {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          Generate New Quiz with AI
        </button>
      )}

      <div className="bg-surface rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">{currentQuiz.title}</h2>
          <span className="text-sm text-text-muted">
            {currentQ + 1} / {currentQuiz.questions.length}
          </span>
        </div>

        <div className="w-full h-2 bg-surface-dim rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / currentQuiz.questions.length) * 100}%` }}
          />
        </div>

        <p className="text-lg text-text mb-6 reading-text">{question.text}</p>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            let classes = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all ";
            if (answered) {
              if (i === question.correctAnswer) classes += "border-success bg-success-light text-success";
              else if (i === selected) classes += "border-error bg-error-light text-error";
              else classes += "border-border bg-surface-dim text-text-muted";
            } else {
              classes += selected === i ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/30";
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} className={classes}>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </div>
              </button>
            );
          })}
        </div>

        {answered && (
          <button
            onClick={nextQuestion}
            className="mt-6 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            {currentQ < currentQuiz.questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ========== VOCABULARY TAB ========== */
function VocabTab({ summary, vocabulary = [] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">My Vocabulary</h2>
        <span className="text-sm text-text-muted">{vocabulary.length} words</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vocabulary.map((word) => (
          <div key={word.id} className="bg-surface rounded-2xl shadow-card p-5">
            <h3 className="text-lg font-semibold text-text">{word.word}</h3>
            <p className="text-text-secondary text-sm mb-3">{word.definition}</p>
            <div className="w-full h-2 bg-surface-dim rounded-full">
              <div className="h-full bg-success rounded-full" style={{ width: `${word.mastery}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== PROGRESS TAB ========== */
function ProgressTab({ summary, weeklyProgress = [] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Reading Level"
          value={summary?.overall_reading_level || "Grade 4"}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Accuracy"
          value={`${Math.round(summary?.avg_accuracy) || 0}%`}
          color="success"
        />
        <StatCard
          icon={Target}
          label="Progress"
          value={`+${summary?.weekly_improvement_percentage || 0}%`}
          color="secondary"
        />
        <StatCard
          icon={Flame}
          label="Status"
          value={summary?.at_risk ? "At Risk" : "On Track"}
          color={summary?.at_risk ? "accent" : "success"}
        />
      </div>

      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Reading Accuracy Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ========== CHAT TAB ========== */
function ChatTab({ navigate }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi${user?.full_name ? ", " + user.full_name.split(" ")[0] : ""}! I'm LexiBot. Ask me anything about reading, words, or learning!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const history = newMessages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const res = await apiService.chat(userText, history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    "Help me understand a word",
    "Give me a reading tip",
    "What is dyslexia?",
    "I'm feeling frustrated",
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3 bg-surface rounded-2xl shadow-card px-5 py-4">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-text">LexiBot</h2>
          <p className="text-sm text-text-muted">Your personal AI reading assistant</p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">Online</span>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => sendMessage(p)} disabled={loading}
            className="px-3 py-1.5 rounded-full border border-border bg-surface text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-40">
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="bg-surface rounded-2xl shadow-card p-4 space-y-4 overflow-y-auto max-h-[400px] min-h-[280px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-secondary/10" : "bg-primary/10"}`}>
              {msg.role === "assistant" ? <Bot className="w-4 h-4 text-secondary" /> : <MessageCircle className="w-4 h-4 text-primary" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed reading-text whitespace-pre-wrap ${msg.role === "assistant" ? "bg-lavender text-text rounded-tl-none" : "bg-primary text-white rounded-tr-none"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-secondary" />
            </div>
            <div className="bg-lavender rounded-2xl rounded-tl-none px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-secondary" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask LexiBot anything..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors reading-text"
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="px-4 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

/* ========== SHARED COMPONENTS ========== */
function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-success bg-success/10",
    accent: "text-accent bg-accent/10",
  };
  
  return (
    <div className="bg-surface rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-base font-bold text-text">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, desc, color, bg, onClick }) {
  const colorMap = {
    primary: "text-primary bg-primary/20",
    secondary: "text-secondary bg-secondary/20",
    success: "text-success bg-success/20",
    accent: "text-accent bg-accent/20",
  };

  return (
    <div onClick={onClick} className={`${bg} rounded-2xl p-6 hover:shadow-card-hover transition-shadow cursor-pointer border border-transparent hover:border-white/50`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      <p className="text-sm text-text-secondary">{desc}</p>
    </div>
  );
}
