import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAuthStore } from "../stores/authStore";
import { apiService } from "../services/apiService";
import Navbar from "../components/Navbar";
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Volume2,
  BookOpen,
} from "lucide-react";

const QUICK_PROMPTS = [
  "Can you help me understand what I just read?",
  "What is dyslexia?",
  "Give me a tip for reading faster",
  "Help me break down a hard word",
  "I'm feeling frustrated. Any advice?",
];

export default function ChatAssistant() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi${user?.full_name ? ", " + user.full_name.split(" ")[0] : ""}! I'm LexiBot, your reading assistant. I'm here to help you understand texts, learn new words, and make reading easier. What would you like help with today?`,
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
      // Build history in the format the backend expects
      const history = newMessages.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await apiService.chat(userText, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I had trouble connecting. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: `Hi${user?.full_name ? ", " + user.full_name.split(" ")[0] : ""}! I'm LexiBot. How can I help you today?`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text flex items-center gap-2">
                LexiBot
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                  Online
                </span>
              </h1>
              <p className="text-sm text-text-muted">Your AI reading assistant</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface border border-border transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New chat
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-border bg-surface text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message List */}
        <div className="flex-1 bg-surface rounded-2xl shadow-card p-4 space-y-4 overflow-y-auto min-h-[400px] max-h-[520px]">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              onSpeak={() => handleSpeak(msg.content)}
            />
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask LexiBot anything about reading..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors reading-text"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 flex items-center gap-2 font-semibold"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-text-muted flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Powered by AI. Use simple questions for the best answers.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onSpeak }) {
  const isBot = msg.role === "assistant";

  return (
    <div className={`flex items-start gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot ? "bg-secondary/10" : "bg-primary/10"
        }`}
      >
        {isBot ? (
          <Bot className="w-4 h-4 text-secondary" />
        ) : (
          <User className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Bubble */}
      <div className={`group relative max-w-[80%] ${isBot ? "" : "items-end"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed reading-text whitespace-pre-wrap ${
            isBot
              ? "bg-lavender text-text rounded-tl-none"
              : "bg-primary text-white rounded-tr-none"
          }`}
        >
          {isBot ? (
            <ReactMarkdown className="prose prose-sm max-w-none text-text">
              {msg.content}
            </ReactMarkdown>
          ) : (
            msg.content
          )}
        </div>

        {/* Speak button (bot messages only) */}
        {isBot && (
          <button
            onClick={onSpeak}
            className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-text-muted hover:text-primary px-1"
            title="Listen"
          >
            <Volume2 className="w-3 h-3" />
            Listen
          </button>
        )}
      </div>
    </div>
  );
}
