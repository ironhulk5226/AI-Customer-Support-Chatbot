import { useId, useState } from 'react'
import Icon from './Icon'

function normalizeSource(source, index) {
  if (!source || typeof source !== 'object') return null

  const documentName = typeof source.document === 'string' && source.document.trim()
    ? source.document.trim()
    : typeof source.name === 'string' && source.name.trim()
      ? source.name.trim()
      : `Source ${index + 1}`

  const section = typeof source.section === 'string' && source.section.trim() ? source.section.trim() : ''
  const evidence = typeof source.evidence === 'string' && source.evidence.trim() ? source.evidence.trim() : ''

  return { document: documentName, section, evidence }
}

export default function SourceEvidence({ sources = [] }) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()

  const safeSources = Array.isArray(sources)
    ? sources.map(normalizeSource).filter(Boolean)
    : []

  if (!safeSources.length) return null

  return (
    <div className="rounded-xl border border-indigo-100/90 bg-white/90 p-2.5 shadow-sm">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 text-left text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-emerald-600">
            <Icon name="check" size={15} />
          </span>
          <span className="truncate">Sources & Evidence</span>
          <span className="text-indigo-200">·</span>
          <span className="text-slate-500">{safeSources.length}</span>
        </span>

        <Icon
          name="chevron"
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div id={panelId} className="mt-2 space-y-2 border-t border-indigo-50 pt-2 text-[12px] text-slate-600">
          {safeSources.map((source, index) => (
            <div key={`${source.document}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50/90 p-2.5">
              <div className="flex items-start gap-2 text-slate-800">
                <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 text-[10px] font-semibold text-indigo-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 font-medium">
                    <Icon name="doc" size={14} className="text-indigo-600" />
                    <span className="break-words">{source.document}</span>
                  </div>

                  {source.section && (
                    <div className="mt-1 text-slate-600">
                      <span className="font-medium text-slate-700">Section:</span> {source.section}
                    </div>
                  )}

                  {source.evidence && (
                    <div className="mt-1 rounded-md border border-slate-200 bg-white/70 p-2 text-[11.5px] italic leading-relaxed text-slate-600">
                      <span className="font-medium not-italic text-slate-700">Supporting evidence:</span> {source.evidence}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
