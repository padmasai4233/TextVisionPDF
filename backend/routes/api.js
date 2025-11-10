const express = require('express');
const axios = require('axios');
const router = express.Router();
const QuizAttempt = require('../models/QuizAttempt');

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

/**
 * ✅ Fallback content generator
 */
function fallbackGenerateContent(title, prompt) {
  const intro = `This document introduces "${title}". ${prompt || ''} It provides an overview, background, key ideas, and use cases.`;
  const description = `Description: ${title} is a topic that includes core concepts, typical applications, and pros/cons.`;
  const sections = [
    { heading: 'Background', body: `Background on ${title}: history, origin, and context.` },
    { heading: 'Key Concepts', body: `Key terms and concepts related to ${title}.` },
    { heading: 'Use Cases', body: `Where ${title} is used and why it's useful.` },
    { heading: 'Conclusion', body: `Summary and recommended next steps regarding ${title}.` }
  ];
  return { title, introduction: intro, description, sections };
}

/**
 * ✅ Fallback quiz generator
 */
function fallbackGenerateQuiz(title) {
  const questions = [];
  for (let i = 1; i <= 5; i++) {
    questions.push({
      q: `Question ${i}: Which statement best fits about "${title}" in context ${i}?`,
      options: [
        `Core correct idea about ${title}`,
        `Partially correct nuance about ${title}`,
        `Misleading or wrong statement`,
        `Unrelated distractor`
      ],
      correctIndex: 0
    });
  }
  return questions;
}

/**
 * ✅ Gemini 2.5 Content Generator
 */
async function geminiGenerateContent(title, prompt) {
  if (!GEMINI_KEY) throw new Error('No Gemini key configured');

  // ✅ Correct endpoint for your verified key
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

  const promptText = `
Write a JSON object with these fields:
"title", "description", "introduction", "sections" (array of {heading, body})
about the topic "${title}".
Include sections: Background, Key Concepts, Use Cases, Conclusion.
Prompt: ${prompt || ''}
Return only valid JSON.
`;

  const body = {
    contents: [
      {
        parts: [{ text: promptText }]
      }
    ]
  };

  const res = await axios.post(endpoint, body, {
    headers: { "Content-Type": "application/json" },
    timeout: 20000
  });

  const text =
    res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    '';

  if (!text) throw new Error('Empty response from Gemini');

  const maybe = text.match(/\{[\s\S]*\}/);
  if (!maybe) throw new Error('Gemini returned non-JSON');
  return JSON.parse(maybe[0]);
}

/**
 * ✅ /api/generate
 */
router.post('/generate', async (req, res) => {
  const { title, prompt } = req.body || {};
  console.log("🟢 /generate called with title:", title); // Add this
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    if (GEMINI_KEY) {
      try {
        // console.log("⚙️ Sending request to Gemini...");
        const out = await geminiGenerateContent(title, prompt);
        // console.log("✅ Gemini response received!");
        return res.json({ source: 'gemini', content: out });
      } catch (e) {
        console.warn('⚠️ Gemini failed, using fallback:', e.message);
      }
    }

    console.log("🟡 Using fallback content...");
    const out = fallbackGenerateContent(title, prompt);
    return res.json({ source: 'fallback', content: out });
  } catch (err) {
    console.error('❌ Generate error', err);
    return res.status(500).json({ error: 'Generation failed', detail: err.message });
  }
});

/**
 * ✅ /api/quiz
 */
router.post('/quiz', async (req, res) => {
  const { title, prompt } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    if (GEMINI_KEY) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
        const promptText = `
Generate EXACT JSON in the format:
{"questions":[{"q":"","options":["","","",""],"answer":<0-3>},...]}
with 5 multiple choice questions about "${title}". ${prompt || ''}
Return JSON only.
`;
        const body = {
          contents: [{ parts: [{ text: promptText }] }]
        };

        const r = await axios.post(endpoint, body, {
          headers: { "Content-Type": "application/json" },
          timeout: 20000
        });

        const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const maybe = text.match(/\{[\s\S]*\}/);

        if (maybe) {
          const parsed = JSON.parse(maybe[0]);

          // ✅ Normalize Gemini output
          const formattedQuestions = (parsed.questions || []).map((q) => {
            let correctIndex = q.correctIndex ?? q.answer ?? 0;

            // ✅ Safety check: ensure it's between 0–3
            if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
              correctIndex = 0;
            }

            return {
              q: q.q,
              options: q.options,
              correctIndex,
            };
          });

          return res.json({ source: 'gemini', questions: formattedQuestions });
        }
      } catch (e) {
        console.warn('Gemini quiz failed:', e.message);
      }
    }

    // Fallback if Gemini fails
    const questions = fallbackGenerateQuiz(title);
    return res.json({ source: 'fallback', questions });
  } catch (err) {
    console.error('Quiz generation error', err);
    return res.status(500).json({ error: err.message });
  }
});


/**
 * ✅ /api/saveAttempt
 */
router.post('/saveAttempt', async (req, res) => {
  const { title, questions, score } = req.body || {};
  if (!title || !questions) return res.status(400).json({ error: 'Missing fields' });

  if (!process.env.MONGO_URI) {
    return res.json({ saved: false, message: 'MONGO_URI not configured. Skipping save.' });
  }

  try {
    const doc = new QuizAttempt({ title, questions, score });
    await doc.save();
    res.json({ saved: true, id: doc._id });
  } catch (err) {
    console.error('Save attempt error', err);
    res.status(500).json({ error: 'Failed to save attempt' });
  }
});

module.exports = router;
