import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <section id="features" className="bg-gray-200 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <p className="uppercase text-sm text-gray-500 tracking-wide">
          Key Features
        </p>

        <h2 className="text-4xl font-bold text-gray-900 mt-2">
          A Smarter Way to Learn
        </h2>

        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          LexiLearn AI provides intelligent tools that support students with
          dyslexia by simplifying content, improving comprehension, and
          tracking progress.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <FeatureCard
            icon="📘"
            title="Universal Text Simplification"
            description="Simplifies any text or PDF into easy-to-read content."
          />

          <FeatureCard
            icon="🧠"
            title="Concept Extraction"
            description="Identifies key ideas and explains them in simple terms."
          />

          <FeatureCard
            icon="❓"
            title="Auto Quiz Generator"
            description="Creates short quizzes to check understanding."
          />

          <FeatureCard
            icon="🔊"
            title="Text-to-Speech Support"
            description="Reads content aloud to support different learning styles."
          />

          <FeatureCard
            icon="📊"
            title="Progress Tracking"
            description="Shows learning progress for students, teachers, and parents."
          />

          <FeatureCard
            icon="🎯"
            title="Adaptive Difficulty"
            description="Adjusts reading level based on student performance."
          />
        </div>

      </div>
    </section>
  );
}
