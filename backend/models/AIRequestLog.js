const mongoose = require('mongoose');

const aiRequestLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gemini', 'openai'],
      required: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    errorMessage: {
      type: String,
    },
    latencyMs: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIRequestLog', aiRequestLogSchema);
