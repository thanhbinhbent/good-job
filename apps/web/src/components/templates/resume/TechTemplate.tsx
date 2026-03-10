import type { ResumeContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function TechTemplate({ content }: { content: ResumeContent }) {
  const p = content.personal
  const contacts = [p.email, p.github && `github.com/${p.github}`, p.linkedin && `linkedin.com/in/${p.linkedin}`, p.website, p.phone, p.location].filter(Boolean)

  return (
    <div className="font-mono text-[#e2e8f0] bg-[#0f172a] p-10 max-w-[780px] mx-auto text-sm leading-relaxed">
      {/* Header */}
      <div className="border-b border-[#334155] pb-5 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-green-400 text-lg">$</span>
          <h1 className="text-2xl font-bold text-white">{p.name || 'your_name'}</h1>
          {p.title && <span className="text-slate-400 text-sm">// {p.title}</span>}
        </div>
        {contacts.length > 0 && (
          <p className="text-xs text-slate-400 mt-2 ml-6">{contacts.join('  |  ')}</p>
        )}
      </div>

      {content.personal.summary && (
        <Section title="about">
          <p className="text-slate-300 text-sm">{stripHtml(content.personal.summary)}</p>
        </Section>
      )}

      {content.skills.length > 0 && (
        <Section title="tech_stack">
          {content.skills.map((sg) => (
            <div key={sg.id} className="mb-2 flex items-start gap-3">
              <span className="text-slate-500 text-xs w-24 shrink-0 pt-0.5">{sg.category}:</span>
              <div className="flex flex-wrap gap-1">
                {sg.skills.map((s) => (
                  <span key={s} className="text-[11px] bg-[#1e293b] border border-[#334155] text-blue-300 px-1.5 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      {content.experience.length > 0 && (
        <Section title="experience">
          {content.experience.map((exp) => (
            <div key={exp.id} className="mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-green-400">▶</span>
                <span className="font-bold text-white">{exp.role}</span>
                <span className="text-slate-400">@</span>
                <span className="text-blue-300">{exp.company}</span>
                <span className="text-slate-500 text-xs ml-auto">{exp.startDate} – {exp.current ? 'present' : (exp.endDate ?? '')}</span>
              </div>
              {exp.location && <p className="text-xs text-slate-500 ml-5"># {exp.location}</p>}
              {exp.description && <p className="text-sm mt-1.5 ml-5 text-slate-300">{stripHtml(exp.description)}</p>}
            </div>
          ))}
        </Section>
      )}

      {content.projects.length > 0 && (
        <Section title="projects">
          {content.projects.map((proj) => (
            <div key={proj.id} className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-yellow-400">★</span>
                <span className="font-bold text-white">{proj.name}</span>
                {proj.url && <a className="text-xs text-blue-400 ml-1">{proj.url}</a>}
              </div>
              {proj.description && <p className="text-sm mt-1 ml-5 text-slate-300">{stripHtml(proj.description)}</p>}
              {proj.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 ml-5">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-[#1e293b] border border-[#334155] text-slate-300 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {content.education.length > 0 && (
        <Section title="education">
          {content.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-purple-400">◆</span>
                <span className="font-semibold text-white">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span className="text-slate-500 text-xs ml-auto">{edu.startDate} – {edu.endDate ?? ''}</span>
              </div>
              <p className="text-xs text-slate-400 ml-5">{edu.institution}{edu.gpa ? ` · gpa: ${edu.gpa}` : ''}</p>
            </div>
          ))}
        </Section>
      )}

      {content.certifications.length > 0 && (
        <Section title="certifications">
          {content.certifications.map((cert) => (
            <p key={cert.id} className="text-sm mb-1">
              <span className="text-green-400">✓</span> {cert.name} <span className="text-slate-500">— {cert.issuer}, {cert.date}</span>
            </p>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs text-slate-500 mb-2"><span className="text-yellow-400">##</span> {title}</p>
      {children}
    </div>
  )
}
