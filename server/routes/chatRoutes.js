import express from 'express';

const router = express.Router();

const answers = [
    {
        matches: ['invoice'],
        answer: 'You can find your billing receipts, invoices, and VAT summaries under Account Settings -> Billing History.',
        source: 'Billing Guide.pdf',
        section: 'Billing History',
        evidence: 'Invoices are available under Account Settings -> Billing History.',
    },
    {
        matches: ['contact'],
        answer: 'Our support team is available from the Help Center -> Contact Support page. Include your account email so we can help quickly.',
        source: 'Support Guide.pdf',
        section: 'Contact Support',
        evidence: 'Contact options are listed in the Help Center.',
    },
    {
        matches: ['update'],
        answer: 'Open Account Settings -> Profile to update your account details, then select Save changes.',
        source: 'Account Help Guide.pdf',
        section: 'Profile Settings',
        evidence: 'Profile details can be changed from Account Settings.',
    },
];

const defaultAnswer = {
    answer: 'To reset your password, open Account Settings and select the Password Recovery option. A secure reset link will be sent to your registered email address.',
    source: 'Account Help Guide.pdf',
    section: 'Password Reset',
    evidence: 'Password reset instructions are available under Account Settings -> Security & Access.',
};

router.post('/', (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
        return res.status(400).json({ message: 'A message is required.' });
    }

    const normalizedMessage = message.toLowerCase();
    const result = answers.find(({ matches }) => matches.some((term) => normalizedMessage.includes(term))) || defaultAnswer;

    return res.json({
        answer: result.answer,
        sources: [{ name: result.source, section: result.section, evidence: result.evidence }],
        source: result.source,
        section: result.section,
        evidence: result.evidence,
    });
});

export default router;