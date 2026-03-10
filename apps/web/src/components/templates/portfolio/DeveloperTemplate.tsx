import type { PortfolioContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function DeveloperPortfolioTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="font-mono text-[#e2e8f0] bg-[#0f172a] max-w-[860px] mx-auto text-sm">
      {/* Terminal header bar */}
      <div className="bg-[#1e293b] px-4 py-2 flex items-center gap-2 border-b border-[#334155]">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-4 text-xs text-slate-500">~/portfolio</span>
      </div>

      <div className="p-10">
        {/* Hero */}
        <div className="mb-8">
          <p className="text-slate-500 text-xs mb-1">$ whoami</p>
          <p className="text-2xl font-bold text-green-400">{content.hero.headline || 'developer'}</p>
          {content.hero.subheadline && <p className="text-slate-400 mt-1"># {content.hero.subheadline}</p>}

          <div className="flex gap-3 mt-3">
            {content.contact.github && <span className="text-xs text-blue-400">github.com/{content.contact.github}</span>}
            {content.contact.linkedin && <span className="text-xs text-blue-400">linkedin.com/in/{content.contact.linkedin}</span>}
            {content.contact.email && <span className="text-xs text-blue-400">{content.contact.email}</span>}
          </div>
        </div>

        {/* Tech Stack */}
        {content.techStack.length > 0 && (
          <div className="mb-8">
            <p className="text-slate-500 text-xs mb-2">$ cat tech_stack.json</p>
            <div className="bg-[#1e293b] rounded p-4 border border-[#334155]">
              {['expert', 'advanced', 'intermediate', 'beginner'].map((level) => {
                const items = content.techStack.filter((t) => t.level === level)
                if (!items.length) return null
                return (
                  <div key={level} className="mb-2 flex gap-3 items-start">
                    <span className="text-yellow-400 text-xs w-24 shrink-0">"{level}":</span>
                    <div className="flex flex-wrap gap-1">
                      {items.map((t) => (
                        <span key={t.id} className="text-green-300 text-xs">"{t.name}",</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Projects */}
        {content.projects.length > 0 && (
          <div className="mb-8">
            <p className="text-slate-500 text-xs mb-3">$ ls -la projects/</p>
            <div className="space-y-3">
              {content.projects.map((proj) => (
                <div key={proj.id} className="border border-[#334155] rounded p-4 bg-[#1e293b]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-yellow-400">★</span>
                    <span className="font-bold text-white">{proj.name}</span>
                    {proj.url && <a className="text-xs text-blue-400">{proj.url}</a>}
                  </div>
                  {proj.description && <p className="text-xs mt-1.5 text-slate-300">{stripHtml(proj.description)}</p>}
                  {proj.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {proj.tags.map((tag) => (
                        <span key={tag} className="text-[10px] border border-[#475569] text-slate-400 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About */}
        {content.about.bio && (
          <div className="mb-8">
            <p className="text-slate-500 text-xs mb-2">$ cat about.md</p>
            <p className="text-slate-300 text-sm">{stripHtml(content.about.bio)}</p>
            {content.about.highlights.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {content.about.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-green-300">▷ {h}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Timeline */}
        {content.timeline.length > 0 && (
          <div className="mb-8">
            <p className="text-slate-500 text-xs mb-3">$ git log --oneline</p>
            <div className="space-y-2">
              {content.timeline.map((item) => (
                <div key={item.id} className="flex gap-4 text-xs">
                  <span className="text-yellow-400 shrink-0">{item.year}</span>
                  <span className="text-green-300">{item.title}</span>
                  {item.description && <span className="text-slate-400"># {item.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
