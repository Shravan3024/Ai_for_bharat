import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import {
  mockStudents,
  mockWeeklyProgress,
  mockMonthlyProgress,
  mockVocabulary,
  mockQuizzes,
  mockMessages,
} from "../data/mockData";
import Navbar from "../components/Navbar";
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Flame,
  BookMarked,
  MessageCircle,
  BarChart3,
  Calendar,
  Send,
  Star,
  CheckCircle2,
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// The parent sees their child's (Aditi) data
const child = mockStudents[0];

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "reading", label: "Reading", icon: BookOpen },
    { key: "vocabulary", label: "Vocabulary", icon: BookMarked },
    { key: "quizzes", label: "Quizzes", icon: Target },
    { key: "messages", label: "Messages", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text">
            Hello, {user?.name?.split(" ")[0] || "Parent"}
          </h1>
          <p className="text-text-secondary mt-1">
            Here's how {child.name.split(" ")[0]} is doing this week
          </p>
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

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "reading" && <ReadingTab />}
        {activeTab === "vocabulary" && <VocabularyTab />}
        {activeTab === "quizzes" && <QuizzesTab />}
        {activeTab === "messages" && <MessagesTab />}
      </div>
    </div>
  );
}

/* ========== OVERVIEW TAB ========== */
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Weekly Reading"
          value={`${child.weeklyReadingMinutes} min`}
          color="primary"
        />
        <StatCard
          icon={BookMarked}
          label="Words Mastered"
          value={child.vocabularyMastered}
          color="success"
        />
        <StatCard
          icon={Target}
          label="Comprehension"
          value={`${child.comprehensionScore}%`}
          color="secondary"
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={`${child.streak} days`}
          color="accent"
        />
      </div>

      {/* Plain Language Summary */}
      <div className="bg-mint rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success" />
          Progress Summary
        </h2>
        <div className="space-y-2 text-text-secondary leading-relaxed">
          <p>
            <span className="font-medium text-text">{child.name.split(" ")[0]}</span> has been reading for{" "}
            <span className="font-medium text-primary">{child.weeklyReadingMinutes} minutes</span> this week, which is above average.
          </p>
          <p>
            Their comprehension score is{" "}
            <span className="font-medium text-success">{child.comprehensionScore}%</span> and they're currently reading at{" "}
            <span className="font-medium text-text">{child.readingLevel}</span> level.
          </p>
          <p>
            They've mastered{" "}
            <span className="font-medium text-secondary">{child.vocabularyMastered} vocabulary words</span> and have a{" "}
            <span className="font-medium text-accent">{child.streak}-day reading streak</span>!
          </p>
          {child.trend === "improving" && (
            <p className="text-success font-medium mt-2">
              Overall trend: Improving! Keep encouraging them.
            </p>
          )}
        </div>
      </div>

      {/* Child Profile Card */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {child.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">{child.name}</h2>
            <p className="text-text-secondary">
              Grade {child.grade} | {child.readingLevel} | {child.readingSpeed}
            </p>
          </div>
          <div className="ml-auto">
            <TrendBadge trend={child.trend} />
          </div>
        </div>
      </div>

      {/* Weekly Reading Chart */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Daily Reading This Week
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockWeeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
            />
            <Bar dataKey="minutes" fill="#6366F1" radius={[6, 6, 0, 0]} name="Minutes" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Progress Trends */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Monthly Growth Trends
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={mockMonthlyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="vocabulary"
              stroke="#10B981"
              strokeWidth={2}
              name="Vocabulary"
              dot={{ fill: "#10B981", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="comprehension"
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Comprehension %"
              dot={{ fill: "#8B5CF6", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ========== READING TAB ========== */
function ReadingTab() {
  const readingActivity = [
    { date: "Feb 6", text: "The Water Cycle", duration: "32 min", sentences: 12, rereads: 2 },
    { date: "Feb 5", text: "The Water Cycle", duration: "45 min", sentences: 12, rereads: 3 },
    { date: "Feb 4", text: "Friendly Letter", duration: "28 min", sentences: 8, rereads: 1 },
    { date: "Feb 3", text: "Our Solar System", duration: "38 min", sentences: 15, rereads: 4 },
    { date: "Feb 2", text: "Friendly Letter", duration: "25 min", sentences: 8, rereads: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Reading Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={BookOpen}
          label="Reading Level"
          value={child.readingLevel}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="This Week"
          value={`${child.weeklyReadingMinutes} min`}
          color="success"
        />
        <StatCard
          icon={Target}
          label="Avg Rereads"
          value={`${child.avgRereads}x`}
          color="accent"
        />
      </div>

      {/* Explanation */}
      <div className="bg-lavender rounded-2xl p-5">
        <p className="text-text-secondary leading-relaxed">
          <span className="font-medium text-text">What does this mean?</span>{" "}
          Your child reads each sentence about {child.avgRereads} times on average before moving on.
          They use <span className="font-medium">{child.simplificationLevel}</span> text simplification
          and read at {child.readingSpeed}. These are healthy patterns for their level.
        </p>
      </div>

      {/* Reading Timeline */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Reading Activity
        </h2>
        <div className="space-y-3">
          {readingActivity.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-surface-dim hover:bg-cream transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text">{a.text}</p>
                  <p className="text-sm text-text-muted">
                    {a.sentences} sentences | {a.rereads} rereads
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-text">{a.duration}</p>
                <p className="text-xs text-text-muted">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Reading Chart */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Reading Minutes This Week
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockWeeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
            />
            <Bar dataKey="minutes" fill="#6366F1" radius={[6, 6, 0, 0]} name="Minutes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ========== VOCABULARY TAB ========== */
function VocabularyTab() {
  const mastered = mockVocabulary.filter((v) => v.mastery >= 80);
  const learning = mockVocabulary.filter((v) => v.mastery >= 50 && v.mastery < 80);
  const needsWork = mockVocabulary.filter((v) => v.mastery < 50);

  const pieData = [
    { name: "Mastered", value: mastered.length, color: "#10B981" },
    { name: "Learning", value: learning.length, color: "#F59E0B" },
    { name: "Needs Work", value: needsWork.length, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Mastered"
          value={mastered.length}
          color="success"
        />
        <StatCard
          icon={Star}
          label="Learning"
          value={learning.length}
          color="accent"
        />
        <StatCard
          icon={BookMarked}
          label="Total Words"
          value={mockVocabulary.length}
          color="primary"
        />
      </div>

      {/* Pie Chart */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Vocabulary Breakdown
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={200} className="max-w-xs">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-text-secondary">
                  {d.name}: <span className="font-medium text-text">{d.value} words</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Vocabulary Growth */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Vocabulary Growth Over Time
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mockMonthlyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
            />
            <Line
              type="monotone"
              dataKey="vocabulary"
              stroke="#10B981"
              strokeWidth={2}
              name="Words Learned"
              dot={{ fill: "#10B981", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Word List */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          All Words
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mockVocabulary.map((word) => (
            <div
              key={word.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-dim"
            >
              <div>
                <p className="font-medium text-text">{word.word}</p>
                <p className="text-xs text-text-muted">{word.definition}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  word.mastery >= 80
                    ? "bg-success/10 text-success"
                    : word.mastery >= 50
                    ? "bg-accent/10 text-accent"
                    : "bg-error/10 text-error"
                }`}
              >
                {word.mastery}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== QUIZZES TAB ========== */
function QuizzesTab() {
  const quiz = mockQuizzes[0];
  const scorePercentage = Math.round((quiz.bestScore / quiz.totalQuestions) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Quiz Performance
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <MiniStat label="Total Quizzes" value={mockQuizzes.length} />
          <MiniStat label="Best Score" value={`${quiz.bestScore}/${quiz.totalQuestions}`} />
          <MiniStat label="Attempts" value={quiz.attempts} />
        </div>

        {/* Quiz Cards */}
        <div className="space-y-3">
          {mockQuizzes.map((q) => {
            const pct = Math.round((q.bestScore / q.totalQuestions) * 100);
            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-surface-dim"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text">{q.title}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      pct >= 80
                        ? "bg-success/10 text-success"
                        : pct >= 50
                        ? "bg-accent/10 text-accent"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-border-light rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pct >= 80
                        ? "bg-success"
                        : pct >= 50
                        ? "bg-accent"
                        : "bg-error"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Best: {q.bestScore}/{q.totalQuestions} | Attempts: {q.attempts}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehension Trend */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Comprehension Score Trend
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mockWeeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Score"
              dot={{ fill: "#8B5CF6", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation */}
      <div className="bg-peach rounded-2xl p-5">
        <p className="text-text-secondary leading-relaxed">
          <span className="font-medium text-text">What does this mean?</span>{" "}
          Quiz scores show how well {child.name.split(" ")[0]} understands what they read.
          A score above 70% means they're grasping the main ideas well. Scores are
          improving over time, which is a great sign!
        </p>
      </div>
    </div>
  );
}

/* ========== MESSAGES TAB ========== */
function MessagesTab() {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // In a real app this would POST to the API
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Messages with Teacher
        </h2>

        {/* Messages list */}
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {mockMessages.map((m) => {
            const isFromTeacher = m.fromRole === "teacher";
            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl ${
                  isFromTeacher ? "bg-lavender" : "bg-mint"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text text-sm">{m.from}</span>
                  <span className="text-xs text-text-muted">
                    {new Date(m.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {m.message}
                </p>
              </div>
            );
          })}
        </div>

        {/* Compose */}
        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message to the teacher..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <button
            onClick={handleSend}
            className="px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== SHARED COMPONENTS ========== */
function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    success: { bg: "bg-success/10", text: "text-success" },
    secondary: { bg: "bg-secondary/10", text: "text-secondary" },
    accent: { bg: "bg-accent/10", text: "text-accent" },
    error: { bg: "bg-error/10", text: "text-error" },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-surface rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="text-lg font-bold text-text">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-surface-dim rounded-xl p-3 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-bold text-text mt-1">{value}</p>
    </div>
  );
}

function TrendBadge({ trend }) {
  const config = {
    improving: { label: "Improving", cls: "bg-success/10 text-success" },
    strong: { label: "Strong", cls: "bg-primary/10 text-primary" },
    steady: { label: "Steady", cls: "bg-accent/10 text-accent" },
    "needs-support": { label: "Needs Support", cls: "bg-error/10 text-error" },
  };
  const c = config[trend] || config.steady;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${c.cls}`}
    >
      <TrendingUp className="w-3 h-3" />
      {c.label}
    </span>
  );
}
