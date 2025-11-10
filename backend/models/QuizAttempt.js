const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: { type: Array, required: true }, // [{q, options, correctIndex, chosenIndex}]
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
