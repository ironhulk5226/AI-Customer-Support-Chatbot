import express from 'express';

const router = express.Router();

const allowedFeedbackValues = new Set(['helpful', 'not_helpful']);

router.post('/', (req, res) => {
    const { messageId, feedback } = req.body || {};

    if (!messageId || typeof messageId !== 'string' || !messageId.trim()) {
        return res.status(400).json({ message: 'A valid messageId is required.' });
    }

    if (!allowedFeedbackValues.has(feedback)) {
        return res.status(400).json({ message: 'Feedback must be helpful or not_helpful.' });
    }

    return res.json({
        success: true,
        messageId,
        feedback,
        receivedAt: new Date().toISOString(),
    });
});

export default router;
