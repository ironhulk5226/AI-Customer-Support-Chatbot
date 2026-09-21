import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { sendMessage, submitFeedback } from '../services/api'
import SourceEvidence from './SourceEvidence'

const suggestions = ['How can I reset my password?', 'How do I update my account?', 'Where can I find my invoice?', 'How do I contact support?']

const createMessageId = (prefix = 'assistant') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

const normalizeSource = (source, index = 0) => {
  if (!source || typeof source !== 'object') return null

  const document = typeof source.document === 'string' && source.document.trim()
    ? source.document.trim()
    : typeof source.name === 'string' && source.name.trim()
      ? source.name.trim()
      : `Source ${index + 1}`

  const section = typeof source.section === 'string' && source.section.trim() ? source.section.trim() : ''
  const evidence = typeof source.evidence === 'string' && source.evidence.trim() ? source.evidence.trim() : ''

  return { document, section, evidence }
}

const normalizeSources = (sources) => {
  if (!Array.isArray(sources)) return []
  return sources.map(normalizeSource).filter(Boolean)
}

const defaultAnswer = {
  id: createMessageId('assistant'),
  text: <>To reset your password, open your <mark>Account Settings</mark> and select the <mark className="violet-mark">Password Recovery</mark> option. A secure reset link will be sent to your registered email address.</>,
  source: 'Account Help Guide.pdf',
  section: 'Password Reset',
  evidence: '“Password reset instructions are available under Account Settings → Security & Access.”',
  sources: [{
    document: 'Account Help Guide.pdf',
    section: 'Password Reset',
    evidence: '“Password reset instructions are available under Account Settings → Security & Access.”',
  }],
  feedback: null,
}

function UserMessage({ text }) {
  return (
    <div className="message-in flex max-w-[85%] items-start justify-end gap-2.5 self-end">
      <div className="flex flex-col items-end">
        <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2.5 text-[14px] font-medium leading-relaxed text-white shadow-md shadow-indigo-500/20">
          {text}
        </div>
        <span className="mt-1 font-mono text-[11px] text-slate-400">Just now</span>
      </div>
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-xs font-bold text-white ring-2 ring-indigo-200">
        R
      </div>
    </div>
  )
}

function AssistantMessage({ answer = {}, onFeedback = () => {}, isSubmitting = false }) {
  const visibleSources = normalizeSources(answer.sources)
  const fallbackSources = []

  if (!visibleSources.length && (answer.source || answer.document || answer.section || answer.evidence)) {
    fallbackSources.push({
      document: answer.document || answer.source || 'Support knowledge base',
      section: answer.section || '',
      evidence: answer.evidence || '',
    })
  }

  const sourcesToRender = visibleSources.length > 0 ? visibleSources : fallbackSources
  const selectedFeedback = answer.feedback || null

  return (
    <div className="message-in flex max-w-[92%] items-start gap-3 self-start">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Icon name="robot" size={16} />
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        <div className="rounded-2xl rounded-tl-sm border border-indigo-100/70 border-l-4 border-l-violet-600 bg-slate-50/90 p-4 text-[14px] leading-relaxed text-slate-800 shadow-sm">
          {answer.text}
        </div>

        {sourcesToRender.length > 0 && <SourceEvidence sources={sourcesToRender} />}

        <div className="flex items-center justify-between px-1 text-[12px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Was this helpful?</span>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 transition-colors ${selectedFeedback === 'helpful' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700'}`}
              onClick={() => onFeedback(answer.id, 'helpful')}
              aria-label="Mark response as helpful"
              disabled={isSubmitting}
            >
              👍 {selectedFeedback === 'helpful' ? 'Selected' : 'Helpful'}
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 transition-colors ${selectedFeedback === 'not_helpful' ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700'}`}
              onClick={() => onFeedback(answer.id, 'not_helpful')}
              aria-label="Mark response as not helpful"
              disabled={isSubmitting}
            >
              👎 {selectedFeedback === 'not_helpful' ? 'Selected' : 'Not Helpful'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Chatbot({ language, onLanguageChange }) {
  const [messages, setMessages] = useState([
    { type: 'user', text: 'How can I reset my password?' },
    { type: 'assistant', answer: defaultAnswer },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceState, setVoiceState] = useState('normal')
  const [feedbackInFlight, setFeedbackInFlight] = useState({})
  const streamRef = useRef(null)

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => () => clearTimeout(window.__supportVoiceTimer), [])

  const handleFeedback = async (messageId, nextFeedback) => {
    const currentMessage = messages.find((message) => message.type === 'assistant' && message.answer?.id === messageId)
    const previousFeedback = currentMessage?.answer?.feedback || null

    if (!messageId || !currentMessage || previousFeedback === nextFeedback || feedbackInFlight[messageId]) {
      return
    }

    setFeedbackInFlight((current) => ({ ...current, [messageId]: nextFeedback }))
    setMessages((current) => current.map((message) => {
      if (message.type !== 'assistant' || message.answer?.id !== messageId) return message
      return {
        ...message,
        answer: {
          ...message.answer,
          feedback: nextFeedback,
        },
      }
    }))

    try {
      await submitFeedback(messageId, nextFeedback)
    } catch {
      setMessages((current) => current.map((message) => {
        if (message.type !== 'assistant' || message.answer?.id !== messageId) return message
        return {
          ...message,
          answer: {
            ...message.answer,
            feedback: previousFeedback,
          },
        }
      }))
    } finally {
      setFeedbackInFlight((current) => {
        const next = { ...current }
        delete next[messageId]
        return next
      })
    }
  }

  const submit = async (value = input) => {
    const question = value.trim()
    if (!question || loading) return

    setMessages((current) => [...current, { type: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const response = await sendMessage(question)
      const answer = response.answer || response.text
      if (!answer) throw new Error('Empty chat response')

      const mergedSources = normalizeSources(response.sources)
      const legacySource = response.document || response.source || response.name

      if (!mergedSources.length && (legacySource || response.section || response.evidence)) {
        mergedSources.push({
          document: legacySource || 'Support knowledge base',
          section: response.section || '',
          evidence: response.evidence || '',
        })
      }

      setMessages((current) => [...current, {
        type: 'assistant',
        answer: {
          id: createMessageId('assistant'),
          text: answer,
          source: mergedSources[0]?.document || legacySource || 'Support knowledge base',
          section: mergedSources[0]?.section || response.section || '',
          evidence: mergedSources[0]?.evidence || response.evidence || '',
          sources: mergedSources,
          feedback: null,
        },
      }])
    } catch {
      setMessages((current) => [...current, {
        type: 'assistant',
        answer: {
          id: createMessageId('assistant'),
          text: 'Sorry, I could not process your request right now. Please try again.',
          source: 'Support service',
          section: 'Unavailable',
          evidence: 'The support service did not return an answer.',
          sources: [],
          feedback: null,
        },
      }])
    } finally {
      setLoading(false)
    }
  }

  const toggleVoice = () => {
    if (voiceState !== 'normal') {
      clearTimeout(window.__supportVoiceTimer)
      setVoiceState('normal')
      return
    }

    setVoiceState('recording')
    window.__supportVoiceTimer = setTimeout(() => {
      setVoiceState('processing')
      window.__supportVoiceTimer = setTimeout(() => {
        setInput('Where can I find my invoice?')
        setVoiceState('transcribed')
      }, 900)
    }, 1300)
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 blur-xl transition-opacity group-hover:opacity-100" />

      <div className="relative flex overflow-hidden rounded-2xl border border-indigo-100/90 bg-white/95 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-indigo-100/70 bg-gradient-to-r from-slate-50/90 via-indigo-50/40 to-slate-50/90 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25">
                <Icon name="robot" size={20} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-[14px] text-slate-900">SupportAI</strong>
                  <span className="text-indigo-300">•</span>
                  <span className="text-[13px] font-medium text-slate-600">Support Assistant</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Ready</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select aria-label="Chat language" className="rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 outline-none" value={language} onChange={(event) => onLanguageChange(event.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50/60 hover:text-slate-700" aria-label="More options">
                <Icon name="more" size={18} />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-indigo-50/20 to-transparent px-6 pb-2.5 pt-4">
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-indigo-100/80 bg-white/90 px-3.5 py-2.5 shadow-sm shadow-indigo-500/5">
              <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <Icon name="spark" size={14} />
                </span>
                <span>Ask about billing, passwords, or account settings</span>
              </div>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-700">
                <Icon name="search" size={12} />
                Search
              </button>
            </div>
          </div>

          <div className="flex min-h-[380px] max-h-[520px] flex-col gap-6 overflow-y-auto p-6" ref={streamRef}>
            {messages.map((message, index) => (
              message.type === 'user'
                ? <UserMessage key={`${message.text}-${index}`} text={message.text} />
                : <AssistantMessage
                    key={`${message.answer?.id || message.answer?.text || 'assistant'}-${index}`}
                    answer={message.answer}
                    onFeedback={handleFeedback}
                    isSubmitting={Boolean(message.answer?.id && feedbackInFlight[message.answer.id])}
                  />
            ))}

            {loading && (
              <div className="message-in flex max-w-[92%] items-start gap-3 self-start">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                  <Icon name="robot" size={16} />
                </div>

                <div className="rounded-2xl rounded-tl-sm border border-indigo-100/70 bg-slate-50/90 p-4 text-[14px] text-slate-600 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-indigo-100/70 bg-gradient-to-r from-white to-indigo-50/40 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white p-2 shadow-sm">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100" aria-label="Voice input" onClick={toggleVoice}>
                <Icon name={voiceState === 'recording' ? 'voice' : 'mic'} size={18} />
              </button>

              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    submit()
                  }
                }}
                placeholder="Message SupportAI..."
                className="flex-1 border-0 bg-transparent px-2 py-2 text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="Type your message"
              />

              <button
                type="button"
                onClick={() => submit()}
                disabled={loading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <Icon name="arrow" size={16} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full border border-indigo-100 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
                  onClick={() => submit(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
