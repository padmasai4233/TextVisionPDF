import React, { useState } from "react";
import axios from "axios";
import Generator from "./components/Generator";
import PdfPreview from "./components/PdfPreview";
import Quiz from "./components/Quiz";
import "./styles.css";

function App() {
  const [pdfData, setPdfData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const handleGenerate = (data) => setPdfData(data);

  const handleAskQuestions = async () => {
    if (!pdfData?.title) return;
    setLoadingQuiz(true);

    try {
      const res = await axios.post("/api/quiz", {
        title: pdfData.title,
        prompt: pdfData.description || "",
      });

      const questions = res.data.questions || [];
      if (questions.length === 0) {
        alert("No quiz questions received.");
      } else {
        setQuizData(questions);
        setShowQuiz(true);
      }
    } catch (err) {
      console.error("❌ Quiz fetch failed:", err);
      alert("Error generating quiz questions");
    } finally {
      setLoadingQuiz(false);
    }
  };

  return (
    <div className="app-container">
      <header className="hero-header">
        <h1 className="hero-title">📘 TextVision PDF</h1>
        <p className="hero-subtitle">
          Generate beautiful PDFs & smart quizzes using AI ✨
        </p>
      </header>

      <main className="main-content fade-in">
        {!pdfData && <Generator onGenerate={handleGenerate} />}

        {pdfData && !showQuiz && (
          <PdfPreview
            data={pdfData}
            onRegenerate={() => setPdfData(null)}
            onAskQuestions={handleAskQuestions}
          />
        )}

        {loadingQuiz && (
          <div className="loading-card fade-in">
            <div className="spinner"></div>
            <h3>Generating quiz questions...</h3>
          </div>
        )}

        {showQuiz && quizData && quizData.length > 0 && (
          <div className="fade-in">
            <Quiz
              title={pdfData?.title}
              questions={quizData}
              onClose={() => setShowQuiz(false)}
            />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built by Padma Sai 💡 | Powered by Gemini AI</p>
      </footer>
    </div>
  );
}

export default App;
