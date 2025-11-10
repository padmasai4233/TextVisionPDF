import React from "react";
import jsPDF from "jspdf";

const PdfPreview = ({ data, onRegenerate, onAskQuestions }) => {
  if (!data || !data.sections) {
    return (
      <div className="card fade-in">
        <h3>Generating content...</h3>
        <p>Please wait a few seconds while we prepare your document.</p>
      </div>
    );
  }

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(data.title, 10, 20);

    doc.setFontSize(12);
    let y = 30;
    doc.text(data.introduction || "", 10, y);
    y += 10;
    doc.text(data.description || "", 10, y);
    y += 10;

    data.sections.forEach((s) => {
      y += 10;
      doc.setFontSize(14);
      doc.text(s.heading, 10, y);
      y += 8;
      doc.setFontSize(12);
      const split = doc.splitTextToSize(s.body, 180);
      doc.text(split, 10, (y += 6));
      y += split.length * 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`${data.title || "document"}.pdf`);
  };

  return (
    <div className="pdf-preview fade-in">
      <div className="pdf-header">
        <h2>📄 AI Document Preview</h2>
        <p>Here’s your auto-generated content powered by Gemini AI.</p>
      </div>

      <div className="pdf-body glass-box">
        <h2 className="pdf-title">{data.title}</h2>
        <p className="pdf-desc">{data.description}</p>

        <div className="pdf-sections">
          <h3 className="intro-heading">Introduction</h3>
          <p className="intro-text">{data.introduction}</p>

          {data.sections.map((s, i) => (
            <div key={i} className="pdf-section fade-slide">
              <h4>{s.heading}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pdf-buttons">
        <button className="btn-primary" onClick={downloadPdf}>
          💾 Download PDF
        </button>
        <button className="btn-secondary" onClick={onRegenerate}>
          🔁 Regenerate
        </button>
        <button className="btn-accent" onClick={onAskQuestions}>
          🧠 Ask Questions
        </button>
      </div>
    </div>
  );
};

export default PdfPreview;
