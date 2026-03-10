import type { ResumeContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function ModernTemplate({ content }: { content: ResumeContent }) {
  const p = content.personal

  return (
    <div className="font-sans text-[#1e293b] bg-white max-w-[780px] mx-auto text-sm flex min-h-[900px]">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 bg-[#1e3a5f] text-white p-6 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold leading-tight">{p.name || 'Your Name'}</h1>
          {p.title && <p className="text-blue-200 text-xs mt-1">{p.title}</p>}
        </div>

        <div className="border-t border-blue-400 pt-4">
          <h3 className="text-xs uppercase tracking-widest text-blue-300 mb-2">Contact</h3>
          {p.email && <p className="text-xs mb-1 break-all">{p.email}</p>}
          {p.phone && <p className="text-xs mb-1">{p.phone}</p>}
          {p.location && <p className="text-xs mb-1">{p.location}</p>}
          {p.website && <p className="text-xs mb-1 break-all">{p.website}</p>}
          {p.linkedin && <p className="text-xs mb-1 break-all">in/{p.linkedin}</p>}
          {p.github && <p className="text-xs mb-1">gh/{p.github}</p>}
        </div>

        {content.skills.length > 0 && (
          <div className="border-t border-blue-400 pt-4">
            <h3 className="text-xs uppercase tracking-widest text-blue-300 mb-2">Skills</h3>
            {content.skills.map((sg) => (
              <div key={sg.id} className="mb-2">
                <p className="text-xs font-semibold text-blue-200">{sg.category}</p>
                <p className="text-xs">{sg.skills.join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        {content.certifications.length > 0 && (
          <div className="border-t border-blue-400 pt-4">
            <h3 className="text-xs uppercase tracking-widest text-blue-300 mb-2">Certifications</h3>
            {content.certifications.map((cert) => (
              <div key={cert.id} className="mb-1">
                <p className="text-xs font-semibold">{cert.name}</p>
                <p className="text-xs text-blue-200">{cert.issuer} · {cert.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        {content.personal.summary && (
          <Section title="Profile">
            <p className="text-sm text-gray-600">{stripHtml(content.personal.summary)}</p>
          </Section>
        )}

        {content.experience.length > 0 && (
          <Section title="Experience">
            {content.experience.map((exp) => (
              <div key={exp.id} className="mb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{exp.role}</p>
                    <p className="text-[#1e3a5f] text-xs font-medium">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{exp.startDate} – {exp.current ? 'Present' : (exp.endDate ?? '')}</span>
                </div>
                {exp.description && <p className="text-xs mt-1.5 text-gray-600">{stripHtml(exp.description)}</p>}
              </div>
            ))}
          </Section>
        )}

        {content.education.length > 0 && (
          <Section title="Education">
            {content.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                    <p className="text-[#1e3a5f] text-xs">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{edu.startDate} – {edu.endDate ?? ''}</span>
                </div>
              </div>
            ))}
          </Section>
        )}

        {content.projects.length > 0 && (
          <Section title="Projects">
            {content.projects.map((proj) => (
              <div key={proj.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-sm">{proj.name}</p>
                  {proj.url && <a className="text-xs text-blue-500 ml-2">{proj.url}</a>}
                </div>
                {proj.description && <p className="text-xs mt-1 text-gray-600">{stripHtml(proj.description)}</p>}
                {proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] border-b-2 border-[#1e3a5f] pb-0.5 mb-3">{title}</h2>
      {children}
    </div>
  )
}
