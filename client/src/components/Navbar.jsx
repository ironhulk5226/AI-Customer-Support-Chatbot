import { useState } from 'react'
import Icon from './Icon'

const translations = {
  en: {
    language: 'Language',
    features: 'Features',
    howItWorks: 'How it Works',
    trust: 'Trust & Evidence',
    history: 'History',
  },
  hi: {
    language: 'भाषा',
    features: 'विशेषताएँ',
    howItWorks: 'यह कैसे काम करता है',
    trust: 'विश्वास और प्रमाण',
    history: 'इतिहास',
  },
  mr: {
    language: 'भाषा',
    features: 'वैशिष्ट्ये',
    howItWorks: 'हे कसे काम करते',
    trust: 'विश्वास आणि पुरावे',
    history: 'इतिहास',
  },
}

export default function Navbar({ language, onLanguageChange }) {
  const [open, setOpen] = useState(false)
  const labels = translations[language] || translations.en
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'mr', label: 'मराठी' },
  ]
  const currentLabel = languageOptions.find((option) => option.code === language)?.label || 'English'

  return <header className="sticky top-0 z-50 h-16 border-b border-indigo-100/70 bg-white/80 shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
      <a className="group flex items-center gap-2.5" href="#top">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1.5px] shadow-sm shadow-indigo-500/30"><span className="flex h-full w-full items-center justify-center rounded-[10px] bg-white text-indigo-600"><Icon name="chat" size={17} /></span></span>
        <span className="flex items-baseline gap-1"><strong className="text-[18px] tracking-tight text-slate-900">SupportAI</strong><i className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" /></span>
      </a>
      <div className="flex items-center gap-3 sm:gap-6">
        <nav className="hidden items-center gap-6 text-[14px] font-medium text-slate-600 sm:flex"><a href="#features">{labels.features}</a><a href="#how-it-works">{labels.howItWorks}</a><a href="#trust">{labels.trust}</a><a href="#history">{labels.history}</a></nav>
        <span className="hidden h-4 w-px bg-indigo-100 sm:block" />
        <div className="relative">
          <button className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white/90 px-3 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm" onClick={() => setOpen(!open)}><span className="text-slate-500">{labels.language}</span><span className="text-slate-800">{currentLabel}</span><Icon name="chevron" size={14} className="text-slate-400" /></button>
          {open && <div className="absolute right-0 mt-2 w-36 rounded-xl border border-indigo-100 bg-white/95 py-1.5 text-[13px] shadow-xl shadow-indigo-500/10">{languageOptions.map((item) => <button className={`flex w-full items-center justify-between px-3.5 py-1.5 text-left ${item.code === language ? 'font-semibold text-indigo-600' : 'text-slate-700'}`} key={item.code} onClick={() => { onLanguageChange(item.code); setOpen(false) }}>{item.label}{item.code === language && <Icon name="check" size={14} />}</button>)}</div>}
        </div>
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px]"><div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">R</div><span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" /></div>
      </div>
    </div>
  </header>
}