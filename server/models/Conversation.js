import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sources: {
    type: [
      {
        name: String,
        document: String,
        section: String,
        evidence: String,
      },
    ],
    default: [],
  },
  feedback: {
    type: String,
    enum: ['helpful', 'not_helpful', null],
    default: null,
  },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;
