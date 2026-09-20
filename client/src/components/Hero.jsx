import Icon from './Icon'

export default function Hero() {
  return <div className="relative mx-auto mb-8 max-w-2xl text-center">
    <div className="absolute -right-16 -top-2 hidden lg:block"><div className="orb-sphere relative flex h-14 w-14 items-center justify-center rounded-full text-white"><Icon name="spark" size={22} /><span className="absolute inset-0 animate-ping rounded-full border border-cyan-300/40 opacity-25" /></div></div>
    <div className="shimmer-badge mb-3.5 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 px-3.5 py-1.5 shadow-sm"><span className="relative h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"><span className="absolute inset-0 animate-ping rounded-full bg-violet-400" /></span><span className="text-[11px] font-bold tracking-wider text-indigo-900">AI-POWERED CUSTOMER SUPPORT</span></div>
    <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-[40px]">How can we <span className="hero-gradient">help you today?</span></h1>
    <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">Get clear, grounded answers from our support knowledge base.</p>
  </div>
}