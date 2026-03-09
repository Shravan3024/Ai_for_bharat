import { Link } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Sparkles,
  Brain,
  BarChart3,
  GraduationCap,
  Users,
  Heart,
  ArrowRight,
  Volume2,
  FileText,
  Target,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-cream to-mint py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Reading Support
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text leading-tight">
              Reading Made{" "}
              <span className="text-primary">Kind</span>,{" "}
              <span className="text-secondary">Simple</span>, and{" "}
              <span className="text-success">Personal</span>
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-lg reading-text">
              LexiLearn helps students with dyslexia read, understand, and grow
              with confidence. Designed with care, powered by AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-lg"
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-semibold hover:bg-primary/5 transition-colors text-lg"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Right - illustration card */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-surface rounded-2xl shadow-elevated p-8 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">Reading Mode</p>
                    <p className="text-sm text-text-muted">Sentence by sentence</p>
                  </div>
                </div>
                <div className="bg-cream rounded-xl p-4">
                  <p className="text-lg leading-relaxed reading-text">
                    Water moves around in a <span className="bg-primary/20 px-1 rounded">circle</span>. The sun makes water warm.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" /> Listen
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Simplify
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> Explain
                  </span>
                </div>
              </div>
              {/* Decorative dot */}
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-accent/30" />
              <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhoItsFor() {
  const roles = [
    {
      icon: GraduationCap,
      title: "Students",
      color: "primary",
      bg: "bg-lavender",
      desc: "Read at your own pace with AI that simplifies, explains, and encourages you every step of the way.",
    },
    {
      icon: Users,
      title: "Teachers",
      color: "success",
      bg: "bg-mint",
      desc: "Track every student's progress, assign reading tasks, and get insights into who needs extra support.",
    },
    {
      icon: Heart,
      title: "Parents",
      color: "secondary",
      bg: "bg-peach",
      desc: "See your child's growth in plain language. Know what they're reading, learning, and mastering.",
    },
  ];

  return (
    <section className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text">
          Built for Everyone in the Learning Journey
        </h2>
        <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
          Whether you're a student, teacher, or parent — LexiLearn meets you where you are.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {roles.map((r) => (
            <div
              key={r.title}
              className={`${r.bg} rounded-2xl p-8 text-left hover:shadow-card-hover transition-shadow`}
            >
              <div className={`w-12 h-12 rounded-xl bg-${r.color}/20 flex items-center justify-center mb-4`}>
                <r.icon className={`w-6 h-6 text-${r.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">{r.title}</h3>
              <p className="text-text-secondary leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload or Paste",
      desc: "Drop a PDF or paste any text you want to read.",
      color: "primary",
    },
    {
      icon: Sparkles,
      title: "AI Simplifies",
      desc: "Text is broken into sentences and simplified to your level.",
      color: "secondary",
    },
    {
      icon: Brain,
      title: "Understand Deeply",
      desc: "Get explanations, listen aloud, take quizzes, and learn vocabulary.",
      color: "success",
    },
    {
      icon: BarChart3,
      title: "Track Growth",
      desc: "See your progress, earn badges, and watch your reading improve.",
      color: "accent",
    },
  ];

  return (
    <section id="how-it-works" className="bg-cream py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text">
          How LexiLearn Works
        </h2>
        <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
          Four simple steps to better reading
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="bg-surface rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow h-full">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-4 mx-auto">
                  {i + 1}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${s.color}/10 flex items-center justify-center mx-auto mb-4`}>
                  <s.icon className={`w-6 h-6 text-${s.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-5 h-5 text-text-muted" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Text Simplification",
      desc: "Multiple levels of simplification — from original to very simple. You choose what works.",
      color: "primary",
    },
    {
      icon: Volume2,
      title: "Listen Mode",
      desc: "Every sentence can be read aloud with adjustable speed. Learn by listening.",
      color: "success",
    },
    {
      icon: Brain,
      title: "AI Explanations",
      desc: "Tap any sentence and get a simple, friendly explanation from our AI tutor.",
      color: "secondary",
    },
    {
      icon: Target,
      title: "Smart Quizzes",
      desc: "Auto-generated quizzes that match your reading. MCQ, fill-in-the-blank, true/false.",
      color: "accent",
    },
    {
      icon: BookOpen,
      title: "Vocabulary Notebook",
      desc: "Save words, see definitions, hear pronunciations, and track mastery.",
      color: "primary",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      desc: "Beautiful charts showing reading time, comprehension scores, and vocabulary growth.",
      color: "success",
    },
  ];

  return (
    <section id="features" className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="uppercase text-sm text-primary tracking-widest font-medium">
          Features
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-text mt-2">
          Everything You Need to Read Better
        </h2>
        <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
          Tools designed with dyslexic learners in mind, backed by AI.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-surface border border-border-light rounded-2xl p-6 text-left hover:shadow-card-hover transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-${f.color}/10 flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 text-${f.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">{f.title}</h3>
              <p className="text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const reviews = [
    {
      name: "Aditi's Mom",
      role: "Parent",
      text: "My daughter actually looks forward to reading now. The sentence-by-sentence mode and listen feature have been life-changing.",
      stars: 5,
    },
    {
      name: "Mrs. Sharma",
      role: "Teacher",
      text: "I can finally see which students need help and which are thriving. The progress reports save me hours of work.",
      stars: 5,
    },
    {
      name: "Rohan",
      role: "Student, Grade 5",
      text: "I like that I can make the words bigger and listen to them. The quizzes are fun and not scary.",
      stars: 5,
    },
  ];

  return (
    <section className="bg-lavender py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text">
          Loved by Learners and Educators
        </h2>
        <p className="mt-4 text-text-secondary text-lg">
          Here's what our community says
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-surface rounded-2xl p-6 shadow-card text-left"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-text leading-relaxed mb-4">"{r.text}"</p>
              <div>
                <p className="font-semibold text-text">{r.name}</p>
                <p className="text-sm text-text-muted">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-primary to-secondary py-20">
      <div className="max-w-4xl mx-auto px-6 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Make Reading Easier?
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          Join thousands of students, teachers, and parents who trust LexiLearn
          to support their reading journey.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-colors text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-white/70 text-sm">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> No credit card needed
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 100% free for students
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Dyslexia-first design
          </span>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#111827] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                <img
                  src="/with white bg logo (1).png"
                  alt="LexiLearn Logo"
                  className="w-10 h-10 object-contain rounded-lg"
                />
                LexiLearn
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered reading support designed with empathy for dyslexic learners.
              </p>
            </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Users</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Student Login</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Teacher Login</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Parent Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Accessibility</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>WCAG 2.1 AA Compliant</li>
              <li>Keyboard Navigable</li>
              <li>Screen Reader Friendly</li>
              <li>Dyslexia-Friendly Fonts</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 LexiLearn. Made with care for every learner.</p>
        </div>
      </div>
    </footer>
  );
}
