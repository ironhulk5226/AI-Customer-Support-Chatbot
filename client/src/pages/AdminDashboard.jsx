import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { getKnowledgeGaps } from '../services/api'

const stats = [
  { label: 'Indexed documents', value: '12', detail: '+2 this month', icon: 'doc', tone: 'indigo' },
  { label: 'Knowledge gaps', value: '4', detail: 'Needs review', icon: 'search', tone: 'amber' },
  { label: 'Published FAQs', value: '28', detail: '96% coverage', icon: 'chat', tone: 'cyan' },
  { label: 'Conversations', value: '1,284', detail: '+18.4% this week', icon: 'globe', tone: 'violet' },
]

const documents = [
  { name: 'Account Help Guide.pdf', type: 'PDF', updated: 'Today, 09:42', chunks: '84 chunks', status: 'Indexed' },
  { name: 'Billing Guide.pdf', type: 'PDF', updated: 'Yesterday, 16:20', chunks: '61 chunks', status: 'Indexed' },
  { name: 'Support Policies.docx', type: 'DOCX', updated: 'Sep 18, 2026', chunks: '39 chunks', status: 'Indexed' },
]

const faqs = [
  { question: 'How do I reset my password?', category: 'Account', status: 'Published' },
  { question: 'Where can I find my invoice?', category: 'Billing', status: 'Published' },
  { question: 'How can I contact support?', category: 'Support', status: 'Draft' },
]

const toneClasses = {
  indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  cyan: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
}

const priorityClasses = {
  candidate: 'bg-amber-50 text-amber-700',
  reviewed: 'bg-indigo-50 text-indigo-700',
  resolved: 'bg-emerald-50 text-emerald-700',
}

function PanelHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">{eyebrow}</p>
        <h2 className="mt-1 text-[17px] font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      {action && <button type="button" className="text-[12px] font-semibold text-indigo-600 transition-colors hover:text-indigo-800">{action}</button>}
    </div>
  )
}

export default function AdminDashboard() {
  const [knowledgeGaps, setKnowledgeGaps] = useState([])
  const [knowledgeGapsError, setKnowledgeGapsError] = useState('')

  useEffect(() => {
    let active = true

    getKnowledgeGaps()
      .then((gaps) => {
        if (active) setKnowledgeGaps(gaps)
      })
      .catch(() => {
        if (active) setKnowledgeGapsError('Knowledge gaps are unavailable right now.')
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Operations overview
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Admin dashboard</h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-slate-500">Keep the support knowledge base clear, current, and ready for every customer conversation.</p>
        </div>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700">
          <Icon name="doc" size={16} />
          Add document
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_12px_32px_-20px_rgba(79,70,229,0.35)] backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </div>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${toneClasses[stat.tone]}`}><Icon name={stat.icon} size={17} /></span>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-400">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <article className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_-24px_rgba(79,70,229,0.4)] backdrop-blur-sm">
          <PanelHeader eyebrow="Knowledge base" title="Documents" action="View all" />
          <div className="mt-2 divide-y divide-slate-100">
            {documents.map((document) => (
              <div key={document.name} className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon name="doc" size={17} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800">{document.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{document.type} · {document.updated} · {document.chunks}</p>
                </div>
                <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:inline-flex">{document.status}</span>
                <button type="button" aria-label={`Open ${document.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-indigo-600"><Icon name="more" size={17} /></button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_-24px_rgba(79,70,229,0.4)] backdrop-blur-sm">
          <PanelHeader eyebrow="Coverage" title="Knowledge gaps" action="Review queue" />
          <div className="mt-2 divide-y divide-slate-100">
            {knowledgeGaps.map((gap) => (
              <div key={gap._id || gap.normalizedQuestion} className="py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold leading-snug text-slate-800">{gap.originalQuestion}</p>
                  <span className={`flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${priorityClasses[gap.status] || priorityClasses.candidate}`}>{gap.status || 'candidate'}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">{gap.occurrenceCount || 1} occurrence{gap.occurrenceCount === 1 ? '' : 's'}</p>
              </div>
            ))}
            {!knowledgeGaps.length && <p className="py-6 text-[12px] text-slate-400">{knowledgeGapsError || 'No knowledge gaps detected yet.'}</p>}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
        <article className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_-24px_rgba(79,70,229,0.4)] backdrop-blur-sm">
          <PanelHeader eyebrow="Content library" title="FAQ management" action="Open manager" />
          <div className="mt-2 divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-3.5">
                <p className="text-[13px] font-semibold leading-snug text-slate-800">{faq.question}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">{faq.category}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${faq.status === 'Draft' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{faq.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_-24px_rgba(79,70,229,0.4)] backdrop-blur-sm">
          <PanelHeader eyebrow="Support activity" title="User & conversation overview" action="View history" />
          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_1.2fr] sm:items-center">
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[14px] border-indigo-100 sm:mx-0">
              <div className="absolute inset-[-14px] rounded-full border-[14px] border-transparent border-l-indigo-600 border-t-violet-500 border-r-cyan-400" />
              <div className="text-center"><p className="text-2xl font-bold text-slate-900">82%</p><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">resolved</p></div>
            </div>
            <div className="space-y-3">
              {[['Resolved conversations', '1,053', 'bg-indigo-500'], ['Escalated to support', '147', 'bg-violet-500'], ['Awaiting response', '84', 'bg-cyan-400']].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between gap-4 text-[12px]"><span className="flex items-center gap-2 text-slate-500"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span><strong className="text-slate-800">{value}</strong></div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400"><span>Compared with last week</span><span className="font-semibold text-emerald-600">+18.4%</span></div>
        </article>
      </section>
    </main>
  )
}
