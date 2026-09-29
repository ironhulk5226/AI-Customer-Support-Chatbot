import express from 'express';
import { listKnowledgeGaps, recordKnowledgeGap } from '../services/knowledgeGapService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
    const gaps = await listKnowledgeGaps({ status });
    return res.json({ knowledgeGaps: gaps });
  } catch (error) {
    console.error('Knowledge gaps could not be loaded:', error.message);
    return res.status(500).json({ message: 'Unable to load knowledge gaps.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const gap = await recordKnowledgeGap(req.body || {});
    return res.status(201).json({ knowledgeGap: gap });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to record knowledge gap.' });
  }
});

export default router;
