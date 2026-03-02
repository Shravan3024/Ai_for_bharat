const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function runPrompt(prompt) {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API Key missing!");
    return "⚠️ AI service configuration missing.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `System: You are a helpful assistant for dyslexic students. Use simple language. User: ${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API error:", data.error);
      return "⚠️ AI service error. Please try again.";
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error("Gemini response empty:", data);
      return "⚠️ AI service error. No response.";
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini fetch error:", error);
    return "⚠️ AI service error. Please try again.";
  }
}

// --------------------
// EXPLAIN CONCEPT
// --------------------
export async function explainConcept(text) {
  return runPrompt(
    `Explain this sentence like I am 10 years old:\n${text}`
  );
}

// --------------------
// VISUAL LEARNING
// --------------------
export async function suggestMedia(text) {
  return runPrompt(
    `Suggest:\n1. Image idea\n2. Animation idea\n3. YouTube search query\n\nSentence:\n${text}`
  );
}

// --------------------
// QUIZ GENERATION
// --------------------
export async function generateQuiz(text) {
  return runPrompt(
    `Create 3 simple multiple-choice questions.\nEach has 3 options.\nMark the correct answer.\n\nText:\n${text}`
  );
}
