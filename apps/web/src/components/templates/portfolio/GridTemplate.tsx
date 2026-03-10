import type { PortfolioContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function GridPortfolioTemplate({ content }: { content: PortfolioContent }) {
  const contacts = [
    content.contact.email,
    content.contact.linkedin && `linkedin.com/in/${content.contact.linkedin}`,
    content.contact.github && `github.com/${content.contact.github}`,
    content.contact.website,
  ].filter(Boolean)

  return (
    <div className="font-sans text-[#1e293b] bg-white max-w-[860px] mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white px-12 py-14">
        <h1 className="text-4xl font-bold">{content.hero.headline || 'Your Name'}</h1>
        {content.hero.subheadline && <p className="text-blue-200 text-lg mt-2">{content.hero.subheadline}</p>}

        {contacts.length > 0 && (
          <p className="text-blue-300 text-xs mt-4">{contacts.join('  ·  ')}</p>
        )}
      </div>

      <div className="px-12 py-10">
        {/* About */}
        {content.about.bio && (
          <Section title="About">
            <p className="text-gray-600">{stripHtml(content.about.bio)}</p>
            {content.about.highlights.length > 0 && (
              <ul className="mt-3 space-y-1">
                {content.about.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-blue-500">•</span>{h}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {/* Tech Stack */}
        {content.techStack.length > 0 && (
          <Section title="Tech Stack">
            <div className="flex flex-wrap gap-2">
              {content.techStack.map((t) => (
                <span key={t.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full font-medium">
                  {t.name} <span className="text-blue-400">· {t.level}</span>
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Projects Grid */}
        {content.projects.length > 0 && (
          <Section title="Projects">
            <div className="grid grid-cols-2 gap-4">
              {content.projects.map((proj) => (
                <div key={proj.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm">{proj.name}</p>
                    {proj.url && <a className="text-xs text-blue-500 ml-2 shrink-0">{proj.url}</a>}
                  </div>
                  {proj.description && <p className="text-xs text-gray-500 mt-2">{stripHtml(proj.description)}</p>}
                  {proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Timeline */}
        {content.timeline.length > 0 && (
          <Section title="Timeline">
            <div className="space-y-3">
              {content.timeline.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="text-xs text-gray-400 w-12 shrink-0 pt-0.5">{item.year}</div>
                  <div className="flex-1 border-l-2 border-blue-100 pl-4">
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">{title}</h2>
      {children}
    </div>
  )
}
