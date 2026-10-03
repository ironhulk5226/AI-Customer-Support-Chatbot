import mongoose from 'mongoose';

const knowledgeGapSchema = new mongoose.Schema({
  originalQuestion: {
    type: String,
    required: true,
    trim: true,
  },
  normalizedQuestion: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  questionHistory: {
    type: [String],
    default: [],
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en',
  },
  occurrenceCount: {
    type: Number,
    default: 1,
    min: 1,
  },
  status: {
    type: String,
    enum: ['candidate', 'reviewed', 'resolved'],
    default: 'candidate',
  },
  recurrenceStatus: {
    type: String,
    enum: ['emerging', 'recurring'],
    default: 'emerging',
  },
  firstDetectedAt: {
    type: Date,
    default: Date.now,
  },
  lastDetectedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: false });

const KnowledgeGap = mongoose.models.KnowledgeGap || mongoose.model('KnowledgeGap', knowledgeGapSchema);

export default KnowledgeGap;
