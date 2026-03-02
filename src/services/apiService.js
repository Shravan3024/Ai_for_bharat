const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Helper to get headers with token
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("lexilearn_token");
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  // --- Auth ---
  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }
    const data = await response.json();
    localStorage.setItem("lexilearn_token", data.access_token);
    localStorage.setItem("lexilearn_user", JSON.stringify(data.user));
    return data;
  },

  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }
    return response.json();
  },

  logout() {
    localStorage.removeItem("lexilearn_token");
    localStorage.removeItem("lexilearn_user");
  },

  getCurrentUser() {
    const user = localStorage.getItem("lexilearn_user");
    return user ? JSON.parse(user) : null;
  },

  // --- Users & Profile ---
  async getProfile() {
    const response = await fetch(`${API_URL}/users/me/profile`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

    async updateStudentProfile(profileData) {
      const response = await fetch(`${API_URL}/users/me/student-profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },

    async getMe() {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },

  // --- Text Processing ---
  async simplifyText(text, level = 5) {
    try {
      const response = await fetch(`${API_URL}/processing/simplify`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text, level }),
      });
      if (!response.ok) throw new Error("Backend unavailable");
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { simplified: `(Local Fallback) ${text}`, error: true };
    }
  },

    async generateQuiz(text, numQuestions = 3) {
      try {
        const response = await fetch(`${API_URL}/processing/quiz/generate`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ text, num_questions: numQuestions }),
        });
        if (!response.ok) throw new Error("Backend unavailable");
        return response.json();
      } catch (error) {
        console.error("API Error:", error);
        return { questions: [], error: true };
      }
    },

    async ragQuery(query, context) {
      try {
        const response = await fetch(`${API_URL}/processing/rag/query`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ query, context }),
        });
        if (!response.ok) throw new Error("Backend unavailable");
        return response.json();
      } catch (error) {
        console.error("API Error:", error);
        return { answer: "Could not retrieve answer.", error: true };
      }
    },

    async extractConcepts(text) {

    try {
      const response = await fetch(`${API_URL}/processing/concepts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Backend unavailable");
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { concepts: [], vocabulary: [], error: true };
    }
  },

  async uploadPDF(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/processing/upload`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData,
      });
      if (!response.ok) throw new Error("Backend unavailable");
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { text: "", error: true };
    }
  },

  // --- Learning Sessions & Quizzes ---
  async startSession(contentId, contentType) {
    const response = await fetch(`${API_URL}/sessions/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content_id: contentId, content_type: contentType }),
    });
    if (!response.ok) throw new Error("Failed to start session");
    return response.json();
  },

    async updateSessionMetrics(sessionId, metrics) {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(metrics),
      });
      if (!response.ok) throw new Error("Failed to update session");
      return response.json();
    },

    async calculateSessionAnalytics(sessionId, metrics) {
      const response = await fetch(`${API_URL}/analytics/sessions/${sessionId}/calculate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(metrics)
      });
      if (!response.ok) throw new Error("Failed to calculate analytics");
      return response.json();
    },

    async submitQuizResult(resultData) {
    const response = await fetch(`${API_URL}/quizzes/results`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(resultData),
    });
    if (!response.ok) throw new Error("Failed to submit quiz");
    return response.json();
  },

  // --- Analytics ---
  async getStudentSummary(studentId) {
    try {
      const response = await fetch(`${API_URL}/analytics/student/${studentId}/summary`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Backend unavailable");
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { error: true };
    }
  },

  async getClassStats(classId, teacherId) {
    try {
      const response = await fetch(`${API_URL}/analytics/class/${classId}/stats?teacher_id=${teacherId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Backend unavailable");
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { error: true };
    }
  },
};
