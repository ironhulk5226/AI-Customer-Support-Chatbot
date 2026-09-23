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

const getAllowedLanguage = (language) => {
    const allowed = ['en', 'hi', 'mr'];
    return allowed.includes(language) ? language : 'en';
};

const localizedAnswerMap = {
    en: {
        invoice: 'You can find your billing receipts, invoices, and VAT summaries under Account Settings -> Billing History.',
        contact: 'Our support team is available from the Help Center -> Contact Support page. Include your account email so we can help quickly.',
        update: 'Open Account Settings -> Profile to update your account details, then select Save changes.',
        reset: 'To reset your password, open Account Settings and select the Password Recovery option. A secure reset link will be sent to your registered email address.',
    },
    hi: {
        invoice: 'आप अपने बिलिंग रसीदें, इनवॉइस और VAT सारांश Account Settings -> Billing History के अंतर्गत पा सकते हैं।',
        contact: 'हमारा सपोर्ट टीम Help Center -> Contact Support पेज से उपलब्ध है। कृपया अपना account email शामिल करें ताकि हम जल्दी मदद कर सकें।',
        update: 'अपने account details अपडेट करने के लिए Account Settings -> Profile खोलें और Save changes चुनें।',
        reset: 'अपना पासवर्ड रीसेट करने के लिए Account Settings खोलें और Password Recovery विकल्प चुनें। आपके रजिस्टर्ड ईमेल पर सुरक्षित रीसेट लिंक भेजा जाएगा।',
    },
    mr: {
        invoice: 'तुम्ही Account Settings -> Billing History अंतर्गत तुमचे बिलिंग रसीद, इनव्हॉइस आणि VAT सारांश शोधू शकता.',
        contact: 'आमची सपोर्ट टीम Help Center -> Contact Support पेजवर उपलब्ध आहे. कृपया तुमचा account email समाविष्ट करा, जेणेकरून आम्ही जलद मदत करू शकू.',
        update: 'तुमचे account details अपडेट करण्यासाठी Account Settings -> Profile उघडा आणि Save changes निवडा.',
        reset: 'तुमचा पासवर्ड रीसेट करण्यासाठी Account Settings उघडा आणि Password Recovery पर्याय निवडा. तुमच्या नोंदणीकृत ईमेलवर सुरक्षित रीसेट लिंक पाठवला जाईल.',
    },
};

const getLocalizedAnswer = (result, language) => {
    const key = result.matches?.find((match) => ['invoice', 'contact', 'update'].includes(match)) || 'reset';
    return localizedAnswerMap[language]?.[key] || localizedAnswerMap.en[key] || result.answer;
};

router.post('/', (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const selectedLanguage = getAllowedLanguage(typeof req.body?.language === 'string' ? req.body.language.trim().toLowerCase() : 'en');

    if (!message) {
        return res.status(400).json({ message: 'A message is required.' });
    }

    const normalizedMessage = message.toLowerCase();
    const result = answers.find(({ matches }) => matches.some((term) => normalizedMessage.includes(term))) || defaultAnswer;
    const answer = getLocalizedAnswer(result, selectedLanguage);

    return res.json({
        answer,
        language: selectedLanguage,
        sources: [{ name: result.source, section: result.section, evidence: result.evidence }],
        source: result.source,
        section: result.section,
        evidence: result.evidence,
    });
});

export default router;