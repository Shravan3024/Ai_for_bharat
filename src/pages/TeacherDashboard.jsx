import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { apiService } from "../services/apiService";
import Navbar from "../components/Navbar";
import {
  Users,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Eye,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ArrowUpDown,
  MessageCircle,
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
} from "recharts";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [demoData, setDemoData] = useState({
    students: [],
    assignments: [],
    monthlyProgress: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await apiService.getTeacherDemoData();
      if (data && !data.error) {
        setDemoData(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "students", label: "Students", icon: Users },
    { key: "assignments", label: "Assignments", icon: ClipboardList },
    { key: "messages", label: "Messages", icon: MessageCircle },
  ];

  const atRiskStudents = demoData.students.filter(
    (s) => s.trend === "needs-support"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-secondary font-medium">Loading teacher dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text">
            Hello, {user?.full_name?.split(" ")[0] || "Teacher"}
          </h1>
          <p className="text-text-secondary mt-1">
            {user?.classes?.join(", ") || "Your class overview"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setSelectedStudent(null);
              }}
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

        {activeTab === "overview" && (
          <OverviewTab atRiskStudents={atRiskStudents} demoData={demoData} />
        )}
        {activeTab === "students" && (
          <StudentsTab
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            students={demoData.students}
            weeklyProgress={demoData.weeklyProgress}
          />
        )}
        {activeTab === "assignments" && <AssignmentsTab assignments={demoData.assignments} />}
        {activeTab === "messages" && <MessagesTab messages={demoData.messages} />}
      </div>
    </div>
  );
}

/* ========== OVERVIEW ========== */
function OverviewTab({ atRiskStudents, demoData }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Total Students"
          value={demoData.students.length}
          color="primary"
        />
        <MetricCard
          icon={BookOpen}
          label="Avg Reading Level"
          value="Grade 4"
          color="success"
        />
        <MetricCard
          icon={ClipboardList}
          label="Active Assignments"
          value={demoData.assignments.length}
          color="secondary"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Need Support"
          value={atRiskStudents.length}
          color="accent"
        />
      </div>

      {/* At Risk Alert */}
      {atRiskStudents.length > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5">
          <h3 className="font-semibold text-text flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Students Needing Support
          </h3>
          <div className="space-y-2">
            {atRiskStudents.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-surface rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">{s.name}</p>
                    <p className="text-xs text-text-muted">
                      Comprehension: {s.comprehensionScore}% | Rereads:{" "}
                      {s.avgRereads}x
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                  Needs Help
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Progress Chart */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Class Monthly Progress
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={demoData.monthlyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="readingTime"
              stroke="#6366F1"
              name="Reading Time (min)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="comprehension"
              stroke="#10B981"
              name="Comprehension %"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Assignment Status */}
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">
          Assignment Status
        </h2>
        <div className="space-y-3">
          {demoData.assignments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-4 rounded-xl bg-surface-dim"
            >
              <div>
                <p className="font-medium text-text">{a.title}</p>
                <p className="text-sm text-text-muted">
                  {a.subject} | Due: {a.dueDate}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {a.submitted}
                </span>
                <span className="text-accent flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {a.pending}
                </span>
                {a.overdue > 0 && (
                  <span className="text-error flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> {a.overdue}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== STUDENTS ========== */
function StudentsTab({ selectedStudent, setSelectedStudent, students = [], weeklyProgress = [] }) {
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedStudent) {
    const s = students.find((st) => st.id === selectedStudent);
    return (
      <StudentDetail student={s} weeklyProgress={weeklyProgress} goBack={() => setSelectedStudent(null)} />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>

      {/* Student List */}
      <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-surface-dim text-sm font-medium text-text-secondary border-b border-border">
          <span className="col-span-2">Student</span>
          <span>Level</span>
          <span>Comprehension</span>
          <span>Trend</span>
          <span>Action</span>
        </div>
        {filtered.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-surface-dim transition-colors border-b border-border-light last:border-0"
          >
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {s.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-text text-sm">{s.name}</p>
                <p className="text-xs text-text-muted">Grade {s.grade}</p>
              </div>
            </div>
            <span className="text-sm text-text">{s.readingLevel}</span>
            <span className="text-sm text-text">{s.comprehensionScore}%</span>
            <TrendBadge trend={s.trend} />
            <button
              onClick={() => setSelectedStudent(s.id)}
              className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
            >
              <Eye className="w-4 h-4" /> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentDetail({ student, weeklyProgress = [], goBack }) {
  if (!student) return null;
  return (
    <div className="space-y-6">
      <button
        onClick={goBack}
        className="text-sm text-primary hover:underline font-medium"
      >
        &larr; Back to Students
      </button>

      <div className="bg-surface rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text">{student.name}</h2>
            <p className="text-text-secondary">
              Grade {student.grade} | {student.readingLevel} | Last active:{" "}
              {student.lastActive}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="Comprehension" value={`${student.comprehensionScore}%`} />
          <MiniStat label="Reading Speed" value={student.readingSpeed} />
          <MiniStat label="Avg Rereads" value={`${student.avgRereads}x`} />
          <MiniStat label="Vocabulary" value={student.vocabularyMastered} />
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Weekly Reading Progress
        </h3>
          <ResponsiveContainer width="100%" height={220}>
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

/* ========== ASSIGNMENTS ========== */
function AssignmentsTab({ assignments = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [localAssignments, setLocalAssignments] = useState(assignments);
  const [form, setForm] = useState({ title: "", subject: "", difficulty: "Easy", dueDate: "" });
  const [content, setContent] = useState("");

  const handleCreate = () => {
    if (!form.title.trim() || !form.dueDate) return;
    const newAssignment = {
      id: `local-${Date.now()}`,
      title: form.title,
      subject: form.subject || "General",
      difficulty: form.difficulty,
      dueDate: form.dueDate,
      assignedTo: "Class 5A",
      submitted: 0,
      pending: 0,
      overdue: 0,
      totalStudents: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLocalAssignments((prev) => [...prev, newAssignment]);
    setForm({ title: "", subject: "", difficulty: "Easy", dueDate: "" });
    setContent("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">All Assignments</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-2xl shadow-card p-6 space-y-4">
          <h3 className="font-semibold text-text">Create Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <select
              value={form.difficulty}
              onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-border bg-surface-dim text-text"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-border bg-surface-dim text-text"
            />
          </div>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Assignment content or instructions..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={!form.title.trim() || !form.dueDate}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors text-sm disabled:opacity-40"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl bg-surface-dim text-text-secondary font-medium hover:bg-border transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {localAssignments.map((a) => {
          const completionPct = Math.round(
            (a.submitted / a.totalStudents) * 100
          );
          return (
            <div
              key={a.id}
              className="bg-surface rounded-2xl shadow-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-text">{a.title}</h3>
                  <p className="text-sm text-text-muted">
                    {a.subject} | {a.assignedTo} | Difficulty: {a.difficulty}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-text-muted">
                  <Calendar className="w-4 h-4" />
                  Due {a.dueDate}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-surface-dim rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-success">
                  {a.submitted} submitted
                </span>
                <span className="text-accent">{a.pending} pending</span>
                {a.overdue > 0 && (
                  <span className="text-error">{a.overdue} overdue</span>
                )}
                <span className="ml-auto text-text-muted">
                  {completionPct}% complete
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== MESSAGES ========== */
function MessagesTab({ messages = [] }) {
  const [localMessages, setLocalMessages] = useState(messages);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        from: "You (Teacher)",
        fromRole: "teacher",
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: true,
      },
    ]);
    setNewMessage("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text">Parent Messages</h2>
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
          {localMessages.map((m) => {
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

        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message to parents..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors text-sm disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== SHARED ========== */
function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-surface rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 text-${color}`} />
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
    improving: {
      icon: TrendingUp,
      label: "Improving",
      cls: "bg-success/10 text-success",
    },
    strong: {
      icon: TrendingUp,
      label: "Strong",
      cls: "bg-primary/10 text-primary",
    },
    steady: { icon: Minus, label: "Steady", cls: "bg-accent/10 text-accent" },
    "needs-support": {
      icon: TrendingDown,
      label: "Needs Help",
      cls: "bg-error/10 text-error",
    },
  };
  const c = config[trend] || config.steady;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${c.cls}`}
    >
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}
