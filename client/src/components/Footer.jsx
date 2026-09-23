const copy = {
  en: { headline: 'AI-powered customer support', links: ['Privacy', 'Help', 'Contact'] },
  hi: { headline: 'एआई-संचालित ग्राहक सहायता', links: ['गोपनीयता', 'सहायता', 'संपर्क'] },
  mr: { headline: 'एआय-आधारित ग्राहक समर्थन', links: ['गोपनीयता', 'मदत', 'संपर्क'] },
}

export default function Footer({ language = 'en' }) { const text = copy[language] || copy.en; return <footer className="relative z-10 border-t border-indigo-100/80 bg-white/80 py-8 backdrop-blur-md"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-[13px] text-slate-500 sm:flex-row"><div className="flex items-center gap-2"><strong className="text-slate-800">SupportAI</strong><span className="text-indigo-200">—</span><span>{text.headline}</span></div><div className="flex items-center gap-6 font-medium"><a href="#trust">{text.links[0]}</a><a href="#how-it-works">{text.links[1]}</a><a href="#top">{text.links[2]}</a></div></div></footer> }