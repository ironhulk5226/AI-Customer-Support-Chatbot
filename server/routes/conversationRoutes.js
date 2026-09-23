import express from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import { getTemporaryUserId } from '../utils/devUser.js';

const router = express.Router();
const memoryConversations = [];

const createMemoryConversationId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `conv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const normalizeMessages = (messages = []) => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.map((message) => ({
    role: message.role || 'user',
    content: message.content || '',
    language: ['en', 'hi', 'mr'].includes(message.language) ? message.language : 'en',
    timestamp: message.timestamp || new Date().toISOString(),
    sources: Array.isArray(message.sources) ? message.sources : [],
    feedback: message.feedback || null,
  }));
};

const buildMemoryConversation = (data = {}) => {
  const now = new Date();
  const conversation = {
    _id: data._id || createMemoryConversationId(),
    userId: data.userId || getTemporaryUserId(),
    title: data.title || 'New conversation',
    messages: normalizeMessages(data.messages),
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  };

  return conversation;
};

const sortMemoryConversations = (items = []) => [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

const findMemoryConversation = ({ _id, userId }) => {
  if (_id) {
    return memoryConversations.find((conversation) => conversation._id === _id && conversation.userId === userId);
  }

  return memoryConversations.filter((conversation) => conversation.userId === userId);
};

const saveMemoryConversation = (conversationData) => {
  const normalizedConversation = buildMemoryConversation(conversationData);
  const existingIndex = memoryConversations.findIndex((conversation) => conversation._id === normalizedConversation._id);

  if (existingIndex >= 0) {
    memoryConversations[existingIndex] = normalizedConversation;
    return memoryConversations[existingIndex];
  }

  memoryConversations.push(normalizedConversation);
  return normalizedConversation;
};

const getTitleFromMessage = (message) => {
  const raw = (message || '').trim();
  if (!raw) return 'New conversation';
  return raw.length > 60 ? `${raw.slice(0, 57).trim()}...` : raw;
};

const buildConversationPayload = (conversation) => ({
  _id: conversation._id,
  userId: conversation.userId,
  title: conversation.title,
  messages: conversation.messages || [],
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

router.get('/', async (req, res) => {
  try {
    const userId = getTemporaryUserId();

    if (mongoose.connection.readyState !== 1) {
      const conversations = sortMemoryConversations(findMemoryConversation({ userId })).slice(0, 20);
      return res.json({ conversations: conversations.map(buildConversationPayload) });
    }

    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(20);
    return res.json({ conversations: conversations.map(buildConversationPayload) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load conversations.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = getTemporaryUserId();

    if (mongoose.connection.readyState !== 1) {
      const conversation = findMemoryConversation({ _id: req.params.id, userId });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found.' });
      }

      return res.json({ conversation: buildConversationPayload(conversation) });
    }

    const conversation = await Conversation.findOne({ _id: req.params.id, userId });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    return res.json({ conversation: buildConversationPayload(conversation) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load conversation.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = getTemporaryUserId();
    const { messages = [], conversationId } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Conversation messages are required.' });
    }

    const firstUserMessage = messages.find((message) => message.role === 'user')?.content || 'New conversation';
    const title = getTitleFromMessage(firstUserMessage);

    let conversation;

    if (mongoose.connection.readyState !== 1) {
      const payload = {
        userId,
        title,
        messages: normalizeMessages(messages),
      };

      if (conversationId) {
        const existing = findMemoryConversation({ _id: conversationId, userId });

        if (!existing) {
          return res.status(404).json({ message: 'Conversation not found.' });
        }

        conversation = saveMemoryConversation({
          ...existing,
          title,
          messages: normalizeMessages(messages),
          updatedAt: new Date(),
        });

        return res.status(200).json({ conversation: buildConversationPayload(conversation) });
      }

      conversation = saveMemoryConversation({
        ...payload,
        _id: createMemoryConversationId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json({ conversation: buildConversationPayload(conversation) });
    }

    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found.' });
      }

      conversation.title = title;
      conversation.messages = messages;
      conversation.updatedAt = new Date();
      await conversation.save();

      return res.status(200).json({ conversation: buildConversationPayload(conversation) });
    }

    conversation = new Conversation({ userId, title, messages });
    await conversation.save();

    return res.status(201).json({ conversation: buildConversationPayload(conversation) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save conversation.' });
  }
});

export default router;
