import { useState } from 'react'
import Chatbot from './components/Chatbot'
import FeatureShowcase from './components/FeatureShowcase'
import Footer from './components/Footer'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Navbar from './components/Navbar'
import TrustSection from './components/TrustSection'

function App() {
  const [language, setLanguage] = useState('en')

  return (
    <div className="app-shell min-h-screen overflow-x-hidden text-slate-800">
      <div className="ambient-layer" aria-hidden="true">
        <div className="ambient-glow ambient-glow-one" />
        <div className="ambient-glow ambient-glow-two" />
        <div className="ambient-glow ambient-glow-three" />
        <div className="dot-grid" />
      </div>
      <Navbar language={language} onLanguageChange={setLanguage} />
      <main className="relative z-10">
        <section className="px-4 pb-16 pt-10">
          <div className="mx-auto max-w-[960px]">
            <Hero language={language} />
            <Chatbot language={language} onLanguageChange={setLanguage} />
          </div>
        </section>
        <FeatureShowcase language={language} />
        <HowItWorks language={language} />
        <TrustSection language={language} />
      </main>
      <Footer language={language} />
    </div>
  )
}

export default App;