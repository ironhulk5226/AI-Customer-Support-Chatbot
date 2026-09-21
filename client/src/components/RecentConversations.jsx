import Icon from './Icon'

const toneClasses = {
  violet: 'bg-violet-50 text-violet-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  indigo: 'bg-indigo-50 text-indigo-600',
}

const formatConversationTime = (value) => {
  if (!value) return 'Today'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Today'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function RecentConversations({ conversations = [], onSelectConversation = () => {}, error = '' }) {
  if (error) {
    return (
      <section className="border-t border-indigo-100/60 py-12" id="history">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load recent conversations right now. You can still keep chatting.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-indigo-100/60 py-16" id="history">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent conversations</h2>
            <p className="text-xs text-slate-500">Pick up right where you left off</p>
          </div>
          <a className="flex items-center gap-1 text-[13px] font-semibold text-indigo-600" href="#top">View history <Icon name="arrow" size={16} /></a>
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-6 text-center text-sm text-slate-500">
            No conversations yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {conversations.map((conversation, index) => {
              const title = conversation.title || 'Untitled conversation'
              const preview = conversation.messages?.find((message) => message.role === 'user')?.content || 'Conversation started'
              const tone = ['violet', 'cyan', 'indigo'][index % 3]

              return (
                <button
                  className="group flex w-full flex-col justify-between gap-2 rounded-xl border border-indigo-100/80 bg-white/80 p-3.5 text-left text-[13px] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md sm:flex-row sm:items-center"
                  key={conversation._id || conversation.id || title}
                  onClick={() => onSelectConversation(conversation._id || conversation.id)}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${toneClasses[tone] || toneClasses.indigo}`}>
                      <Icon name={tone === 'violet' ? 'shield' : tone === 'cyan' ? 'chat' : 'doc'} size={17} />
                    </span>
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <strong className="text-slate-900 group-hover:text-indigo-600">{title}</strong>
                      <span className="hidden text-indigo-200 sm:inline">—</span>
                      <span className="truncate text-slate-500">{preview}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="font-mono text-[11.5px] text-slate-400">{formatConversationTime(conversation.updatedAt || conversation.createdAt)}</span>
                    <Icon name="arrow" size={16} className="text-slate-300 group-hover:text-indigo-500" />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}