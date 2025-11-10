import React, { useState, useEffect } from "react";

export default function Quiz({ title, questions, onClose, onFinish }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0); // for animated score bar

  function choose(qidx, optidx) {
    const copy = [...answers];
    copy[qidx] = optidx;
    setAnswers(copy);
  }

  function handleSubmit() {
    let s = 0;
    const annotated = questions.map((q, i) => {
      const chosenIndex = answers[i];
      if (chosenIndex === q.correctIndex) s += 1;
      return {
        q: q.q,
        options: q.options,
        correctIndex: q.correctIndex,
        chosenIndex,
      };
    });
    setScore(s);
    setSubmitted(true);
    if (onFinish) onFinish({ score: s, questions: annotated });
  }

  // animate score bar after submission
  useEffect(() => {
    if (submitted) {
      let start = 0;
      const interval = setInterval(() => {
        if (start < (score / questions.length) * 100) {
          start += 2;
          setProgress(start);
        } else {
          clearInterval(interval);
        }
      }, 20);
    }
  }, [submitted, score, questions.length]);

  return (
    <div className="quiz-overlay fade-in">
      <div className="quiz-box">
        <div className="quiz-header">
          <h2>🧠 Quiz: {title}</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="quiz-body">
          {questions.map((q, i) => (
            <div key={i} className="quiz-item slide-up">
              <p className="quiz-question">
                <strong>{i + 1}. </strong> {q.q}
              </p>
              <div className="options">
                {q.options.map((opt, j) => {
                  const isChosen = answers[i] === j;
                  const showCorrect = submitted && q.correctIndex === j;
                  const showWrong =
                    submitted && isChosen && q.correctIndex !== j;
                  return (
                    <label
                      key={j}
                      className={`option 
                        ${isChosen ? "chosen" : ""} 
                        ${showCorrect ? "correct" : ""} 
                        ${showWrong ? "wrong" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q-${i}`}
                        checked={isChosen || false}
                        onChange={() => choose(i, j)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-footer">
          {!submitted && (
            <button className="submit-btn" onClick={handleSubmit}>
              ✅ Submit Quiz
            </button>
          )}

          {submitted && (
            <div className="result-section fade-in">
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="result-text">
                Your Score: <strong>{score}</strong> / {questions.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
