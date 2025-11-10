import React, { useState } from "react";
import axios from "axios";

const Generator = ({ onGenerate }) => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/generate", { title, prompt });
      const generated = res.data.content || res.data;
      onGenerate(generated);
    } catch (err) {
      console.error(err);
      alert("Error generating content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-card fade-in">
      <h2 className="generator-title">Generate Your AI PDF</h2>
      <p className="generator-subtext">
        Enter a topic and optional details to generate a full AI-powered PDF.
      </p>

      <form onSubmit={handleGenerate} className="generator-form">
        <div className="input-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Artificial Intelligence"
            required
          />
        </div>

        <div className="input-group">
          <label>Prompt (optional)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Add any details or context for better results..."
            rows={3}
          />
        </div>

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? (
            <div className="btn-loader"></div>
          ) : (
            <>
              <span>⚡ Generate PDF</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Generator;
