import mongoose from 'mongoose';
import KnowledgeGap from '../models/KnowledgeGap.js';
import { findSimilarKnowledgeGap } from './knowledgeGapGroupingService.js';

const memoryKnowledgeGaps = [];
const defaultRecurrenceThreshold = 3;

export const getRecurrenceThreshold = () => {
  const configuredThreshold = Number.parseInt(process.env.KNOWLEDGE_GAP_RECURRENCE_THRESHOLD, 10);
  return Number.isInteger(configuredThreshold) && configuredThreshold > 0
    ? configuredThreshold
    : defaultRecurrenceThreshold;
};

const updateRecurrenceStatus = (gap) => {
  gap.recurrenceStatus = gap.occurrenceCount >= getRecurrenceThreshold() ? 'recurring' : 'emerging';
  return gap;
};

const normalizeGapPayload = (payload = {}) => ({
  originalQuestion: typeof payload.originalQuestion === 'string' ? payload.originalQuestion.trim() : '',
  normalizedQuestion: typeof payload.normalizedQuestion === 'string' ? payload.normalizedQuestion.trim() : '',
  language: ['en', 'hi', 'mr'].includes(payload.language) ? payload.language : 'en',
});

const recordInMemory = ({ originalQuestion, normalizedQuestion, language }) => {
  const now = new Date();
  const existing = findSimilarKnowledgeGap(memoryKnowledgeGaps, normalizedQuestion);

  if (existing) {
    existing.occurrenceCount += 1;
    existing.lastDetectedAt = now;
    existing.questionHistory.push(originalQuestion);
    return updateRecurrenceStatus(existing);
  }

  const gap = {
    _id: `gap_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    originalQuestion,
    normalizedQuestion,
    language,
    occurrenceCount: 1,
    status: 'candidate',
    recurrenceStatus: 'emerging',
    firstDetectedAt: now,
    lastDetectedAt: now,
    questionHistory: [originalQuestion],
  };

  memoryKnowledgeGaps.push(gap);
  return updateRecurrenceStatus(gap);
};

export const recordKnowledgeGap = async (payload) => {
  const normalized = normalizeGapPayload(payload);
  if (!normalized.originalQuestion || !normalized.normalizedQuestion) {
    throw new Error('Original and normalized questions are required.');
  }

  if (mongoose.connection.readyState !== 1) {
    return recordInMemory(normalized);
  }

  const existingGaps = await KnowledgeGap.find({});
  const existing = findSimilarKnowledgeGap(existingGaps, normalized.normalizedQuestion);
  if (!existing) {
    return KnowledgeGap.create({
      ...normalized,
      occurrenceCount: 1,
      status: 'candidate',
      recurrenceStatus: 'emerging',
      questionHistory: [normalized.originalQuestion],
    });
  }

  existing.occurrenceCount += 1;
  existing.lastDetectedAt = new Date();
  existing.questionHistory = [...(existing.questionHistory || []), normalized.originalQuestion];
  updateRecurrenceStatus(existing);
  await existing.save();
  return existing;
};

export const listKnowledgeGaps = async ({ status } = {}) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryKnowledgeGaps
      .filter((gap) => !status || gap.status === status)
      .map(updateRecurrenceStatus)
      .sort((a, b) => new Date(b.lastDetectedAt) - new Date(a.lastDetectedAt));
  }

  const filter = ['candidate', 'reviewed', 'resolved'].includes(status) ? { status } : {};
  const gaps = await KnowledgeGap.find(filter).sort({ lastDetectedAt: -1 }).limit(100);
  return Promise.all(gaps.map(async (gap) => {
    const recurrenceStatus = gap.occurrenceCount >= getRecurrenceThreshold() ? 'recurring' : 'emerging';
    if (gap.recurrenceStatus !== recurrenceStatus) {
      gap.recurrenceStatus = recurrenceStatus;
      await gap.save();
    }

    return gap.toObject();
  }));
};
