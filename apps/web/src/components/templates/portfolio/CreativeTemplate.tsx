import type { PortfolioContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function CreativePortfolioTemplate({ content }: { content: PortfolioContent }) {
  const contacts = [
    content.contact.email,
    content.contact.website,
    content.contact.linkedin && `in/${content.contact.linkedin}`,
    content.contact.github && `gh/${content.contact.github}`,
  ].filter(Boolean)

  return (
    <div className="font-sans text-[#111] bg-[#fafaf9] max-w-[860px] mx-auto">
      {/* Full-bleed hero */}
      <div className="relative bg-[#111] text-white px-14 py-16 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-600 opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-blue-500 opacity-20 translate-y-1/2" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Portfolio</p>
          <h1 className="text-5xl font-black">{content.hero.headline || 'Your Name'}</h1>
          {content.hero.subheadline && <p className="text-purple-300 text-xl mt-2 font-light">{content.hero.subheadline}</p>}
          {contacts.length > 0 && (
            <div className="flex gap-4 mt-5">
              {contacts.map((c) => (
                <span key={c} className="text-xs text-gray-400 border border-gray-600 px-3 py-1 rounded-full">{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-14 py-10">
        {/* About */}
        {content.about.bio && (
          <div className="mb-10">
            <Label>About</Label>
            <p className="text-gray-700 text-base leading-relaxed max-w-2xl">{stripHtml(content.about.bio)}</p>
            {content.about.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {content.about.highlights.map((h, i) => (
                  <span key={i} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">{h}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expertise */}
        {content.techStack.length > 0 && (
          <div className="mb-10">
            <Label>Expertise</Label>
            <div className="flex flex-wrap gap-3">
              {content.techStack.map((t) => (
                <div key={t.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    t.level === 'expert' ? 'bg-purple-100 text-purple-700' :
                    t.level === 'advanced' ? 'bg-blue-100 text-blue-700' :
                    t.level === 'intermediate' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{t.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {content.projects.length > 0 && (
          <div className="mb-10">
            <Label>Work</Label>
            <div className="grid grid-cols-2 gap-5">
              {content.projects.map((proj, i) => (
                <div key={proj.id} className={`rounded-xl overflow-hidden border ${i === 0 ? 'col-span-2' : ''} bg-white shadow-sm`}>
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500" />
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-base">{proj.name}</p>
                      {proj.url && <a className="text-xs text-purple-500">{proj.url}</a>}
                    </div>
                    {proj.description && <p className="text-sm text-gray-600 mt-2">{stripHtml(proj.description)}</p>}
                    {proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {proj.tags.map((tag) => (
                          <span key={tag} className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {content.timeline.length > 0 && (
          <div className="mb-10">
            <Label>Journey</Label>
            <div className="space-y-4">
              {content.timeline.map((item, i) => (
                <div key={item.id} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      item.type === 'work' ? 'bg-blue-500' : item.type === 'education' ? 'bg-purple-500' : 'bg-green-500'
                    }`}>{item.year.slice(-2)}</div>
                    {i < content.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-sm">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">{children}</p>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
