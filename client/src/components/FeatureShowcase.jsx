import Icon from './Icon'

const baseFeatures = [
  ['RAG-Grounded Answers', 'Relevant information is retrieved from the knowledge base before the AI generates its response.', 'RAG Powered', 'Question → Retrieve Knowledge → Grounded Answer', 'indigo'],
  ['Source Evidence', 'See the source document, relevant section, and short supporting evidence with relevant answers.', 'Traceable', 'Account Help Guide.pdf · § Password Reset', 'violet'],
  ['Local AI & Privacy', 'Responses use locally controlled organization knowledge for a more private support experience.', 'Private', 'Knowledge Base → Local RAG → Answer', 'cyan'],
  ['Voice & Multilingual Support', 'Ask questions using voice input and supported languages for accessible assistance.', 'English · हिंदी · मराठी', 'Listening... → Transcribing... → Ready', 'violet'],
  ['Conversation History & Feedback', 'Revisit previous support conversations and provide simple feedback on AI responses.', 'Rated', 'Password Reset · Account Settings', 'indigo'],
  ['Knowledge Base Improvement', 'Repeated unanswered questions become visible knowledge gaps for candidate FAQ content.', 'Continuous Learning', 'Unanswered Q → Recurring Gap → AI FAQ Draft', 'amber'],
  ['Admin-Controlled Knowledge', 'FAQ drafts are reviewed and approved before becoming searchable knowledge.', 'Human Review', 'FAQ Draft → Admin Review → Re-indexed Knowledge', 'indigo'],
]

const localizations = {
  en: {
    badge: 'Feature Showcase',
    heading: ['Everything you need for ', 'reliable AI support'],
    subheading: 'Built around grounded answers, controlled knowledge, privacy, and a better customer experience.',
    foundation: 'Foundation',
    interface: 'Conversational Interface',
    title: 'AI Customer Support',
    text: 'Ask organization-specific support questions naturally through an intelligent conversational interface designed for clarity and trust.',
    chip: 'Interactive Support Agent',
    features: baseFeatures,
  },
  hi: {
    badge: 'फ़ीचर शोकेस',
    heading: ['आपके लिए सब कुछ ', 'विश्वसनीय एआई सहायता'],
    subheading: 'सही उत्तर, नियंत्रित ज्ञान, गोपनीयता और बेहतर ग्राहक अनुभव के आसपास निर्मित।',
    foundation: 'आधार',
    interface: 'संवादी इंटरफेस',
    title: 'एआई ग्राहक सहायता',
    text: 'संगठन-विशिष्ट सपोर्ट सवालों को सहज तरीके से पूछें, ताकि स्पष्टता और भरोसा बना रहे।',
    chip: 'इंटरएक्टिव सपोर्ट एजेंट',
    features: [
      ['RAG-आधारित उत्तर', 'एआई उत्तर बनाने से पहले नॉलेज बेस से प्रासंगिक जानकारी ली जाती है।', 'RAG समर्थित', 'प्रश्न → जानकारी ढूंढें → सत्यापित उत्तर', 'indigo'],
      ['स्रोत प्रमाण', 'स्रोत दस्तावेज़, प्रासंगिक अनुभाग और संक्षिप्त सहायक प्रमाण देखें।', 'ट्रेसेबल', 'Account Help Guide.pdf · § पासवर्ड रीसेट', 'violet'],
      ['लोकल एआई और गोपनीयता', 'उत्तर अधिक निजी अनुभव के लिए स्थानीय रूप से नियंत्रित संगठन ज्ञान का उपयोग करते हैं।', 'गोपनीय', 'नॉलेज बेस → लोकल RAG → उत्तर', 'cyan'],
      ['वॉयस और बहुभाषी समर्थन', 'सहायक अनुभव के लिए आवाज़ या समर्थित भाषाओं में सवाल पूछें।', 'English · हिंदी · मराठी', 'सुन रहा है... → ट्रांसक्रिप्शन... → तैयार', 'violet'],
      ['वार्तालाप इतिहास और फीडबैक', 'पिछले वार्तालाप को फिर से देखें और एआई उत्तरों पर फीडबैक दें।', 'रेटेड', 'पासवर्ड रीसेट · अकाउंट सेटिंग्स', 'indigo'],
      ['नॉलेज बेस सुधार', 'बार-बार unanswered प्रश्न FAQ सामग्री के लिए नॉलेज गैप बन जाते हैं।', 'सतत सीखना', 'अनुत्तरित Q → दोहराव → AI FAQ ड्राफ्ट', 'amber'],
      ['एडमिन-नियंत्रित नॉलेज', 'FAQ ड्राफ्ट्स की समीक्षा और स्वीकृति के बाद ही वे खोज योग्य बनते हैं।', 'मानव समीक्षा', 'FAQ ड्राफ्ट → एडमिन रिव्यू → पुनर्स्थापित ज्ञान', 'indigo'],
    ],
  },
  mr: {
    badge: 'फिचर शोकेस',
    heading: ['तुमच्यासाठी सर्व काही ', 'विश्वासार्ह एआय समर्थन'],
    subheading: 'अचूक उत्तरे, नियंत्रित ज्ञान, गोपनीयता आणि चांगला ग्राहक अनुभव यावर आधारित.',
    foundation: 'तळाची पायरी',
    interface: 'संवादी इंटरफेस',
    title: 'एआय ग्राहक समर्थन',
    text: 'संघटन-विशिष्ट सपोर्ट प्रश्न नैसर्गिक पद्धतीने विचारा, जिथे स्पष्टता आणि विश्वास जपला जातो.',
    chip: 'इंटरएक्टिव सपोर्ट एजंट',
    features: [
      ['RAG-आधारलेले उत्तरे', 'एआय उत्तर देण्यापूर्वी नॉलेज बेसमधून प्रासंगिक माहिती घेतली जाते.', 'RAG समर्थित', 'प्रश्न → माहिती मिळवा → आधारभूत उत्तर', 'indigo'],
      ['स्त्रोत पुरावे', 'स्रोत दस्तऐवज, संबंधित विभाग आणि लहान पुरावे पाहा.', 'ट्रेसेबल', 'Account Help Guide.pdf · § पासवर्ड रीसेट', 'violet'],
      ['लोकल एआय आणि गोपनीयता', 'उत्तर अधिक गोपनीय अनुभवासाठी स्थानिकरित्या नियंत्रित संस्थात्मक ज्ञान वापरतात.', 'गोपनीय', 'नॉलेज बेस → लोकल RAG → उत्तर', 'cyan'],
      ['व्हॉइस आणि बहुभाषिक समर्थन', 'सहज मदतीसाठी आवाज किंवा समर्थित भाषांमध्ये प्रश्न विचारा.', 'इंग्रजी · हिंदी · मराठी', 'ऐकत आहे... → लिप्यंतरण... → तयार', 'violet'],
      ['संवाद इतिहास आणि फीडबॅक', 'मागील संभाषण पुन्हा पहा आणि एआय उत्तरांवर फीडबॅक द्या.', 'रेटेड', 'पासवर्ड रीसेट · अकाउंट सेटिंग्ज', 'indigo'],
      ['नॉलेज बेस सुधार', 'वारंवार न उरलेले प्रश्न FAQ साठी नॉलेज गॅप तयार करतात.', 'सतत शिकणे', 'अनुत्तरित Q → पुनरावृत्ती → AI FAQ ड्राफ्ट', 'amber'],
      ['ऍडमिन-नियंत्रित ज्ञान', 'FAQ ड्राफ्ट्सची समीक्षा आणि मंजुरी झाल्यावर ते शोधण्यायोग्य बनतात.', 'मानवी पुनरावलोकन', 'FAQ ड्राफ्ट → ऍडमिन रिव्ह्यू → पुनर्निर्मित ज्ञान', 'indigo'],
    ],
  },
}

export default function FeatureShowcase({ language = 'en' }) {
  const text = localizations[language] || localizations.en

  return (
    <section className="relative border-t border-indigo-100/70 bg-gradient-to-b from-white/40 via-indigo-50/20 to-transparent py-20" id="features">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-3 inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">{text.badge}</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            {text.heading[0]}
            <span className="hero-gradient">{text.heading[1]}</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{text.subheading}</p>
        </div>

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 text-white shadow-xl shadow-indigo-900/10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-cyan-300">
                <Icon name="chat" size={26} />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                  {text.foundation} <span className="h-1 w-1 rounded-full bg-cyan-300" /> <span className="font-medium text-indigo-200">{text.interface}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight sm:text-xl">{text.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-indigo-100/90">{text.text}</p>
              </div>
            </div>
            <span className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-medium text-cyan-200">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-400" />{text.chip}
            </span>
          </div>
        </div>

        {text.features.map((feature) => (
          <FeatureCard feature={feature} key={feature[0]} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ feature }) {
  const [title, description, tag, preview, tone] = feature
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-indigo-100/90 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}>
            <Icon name={tone === 'cyan' ? 'shield' : tone === 'amber' ? 'spark' : 'doc'} size={22} />
          </div>
          <span className={`rounded-full border border-indigo-200 px-2.5 py-1 text-[11px] font-bold tracking-wide ${colors[tone]}`}>
            {tag}
          </span>
        </div>
        <h3 className="mb-2 text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
        <p className="mb-6 text-[13.5px] leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="rounded-xl border border-indigo-50 bg-slate-50/80 p-3 text-[11px] font-medium text-slate-600">{preview}</div>
    </article>
  )
}
