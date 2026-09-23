const copy = {
  en: {
    heading: 'Answers you can understand and verify.',
    text: 'SupportAI uses information from the organization&apos;s support knowledge base and provides limited supporting evidence with relevant answers.',
    badges: ['Source document', 'Relevant section', 'Supporting evidence'],
  },
  hi: {
    heading: 'ऐसे उत्तर जिन्हें आप समझ और सत्यापित कर सकें।',
    text: 'SupportAI संगठन की सपोर्ट नॉलेज बेस से जानकारी उपयोग करता है और प्रासंगिक उत्तरों के साथ सीमित सहायक प्रमाण देता है।',
    badges: ['स्रोत दस्तावेज़', 'प्रासंगिक सेक्शन', 'सहायक प्रमाण'],
  },
  mr: {
    heading: 'असे उत्तरे जे तुम्ही समजू शकाल आणि पडताळू शकाल.',
    text: 'SupportAI संस्थेच्या सपोर्ट नॉलेज बेसमधील माहिती वापरतो आणि प्रासंगिक उत्तरांसह मर्यादित साहाय्यक पुरावे देतो.',
    badges: ['स्त्रोत दस्तऐवज', 'संबंधित विभाग', 'सहायक पुरावा'],
  },
}

export default function TrustSection({ language = 'en' }) { const text = copy[language] || copy.en; return <section className="relative border-t border-indigo-100/60 py-16" id="trust"><div className="mx-auto max-w-3xl px-6 text-center"><h2 className="mb-2.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{text.heading}</h2><p className="mx-auto mb-8 max-w-xl text-[14px] leading-relaxed text-slate-600">{text.text}</p><div className="flex flex-wrap items-center justify-center gap-4 text-[13.5px] font-medium text-slate-700"><Badge text={text.badges[0]} /><Badge text={text.badges[1]} /><Badge text={text.badges[2]} /></div></div></section> }
function Badge({ text }) { return <div className="flex items-center gap-2 rounded-xl border border-indigo-100/90 bg-white/90 px-3.5 py-2 shadow-sm"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[13px] text-white">✓</span><strong className="text-slate-800">{text}</strong></div> }