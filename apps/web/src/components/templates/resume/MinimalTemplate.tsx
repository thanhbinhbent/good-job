import type { ResumeContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function MinimalTemplate({ content }: { content: ResumeContent }) {
  const p = content.personal
  const contacts = [p.email, p.phone, p.location, p.website, p.linkedin && `linkedin.com/in/${p.linkedin}`, p.github && `github.com/${p.github}`].filter(Boolean)

  return (
    <div className="font-sans text-[#111] bg-white p-12 max-w-[780px] mx-auto text-sm leading-relaxed">
      <div className="mb-8">
        <h1 className="text-4xl font-light tracking-tight">{p.name || 'Your Name'}</h1>
        {p.title && <p className="text-gray-500 mt-1 text-sm">{p.title}</p>}
        {contacts.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">{contacts.join('  ·  ')}</p>
        )}
      </div>

      {content.personal.summary && (
        <Section title="Summary">
          <p className="text-sm text-gray-600">{stripHtml(content.personal.summary)}</p>
        </Section>
      )}

      {content.experience.length > 0 && (
        <Section title="Experience">
          {content.experience.map((exp) => (
            <div key={exp.id} className="mb-5 grid grid-cols-[1fr_auto] gap-x-8">
              <div>
                <p className="font-medium">{exp.role}</p>
                <p className="text-gray-500 text-xs">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                {exp.description && <p className="text-sm mt-1.5 text-gray-600">{stripHtml(exp.description)}</p>}
              </div>
              <div className="text-right text-xs text-gray-400 whitespace-nowrap pt-0.5">
                {exp.startDate} – {exp.current ? 'Present' : (exp.endDate ?? '')}
              </div>
            </div>
          ))}
        </Section>
      )}

      {content.education.length > 0 && (
        <Section title="Education">
          {content.education.map((edu) => (
            <div key={edu.id} className="mb-4 grid grid-cols-[1fr_auto] gap-x-8">
              <div>
                <p className="font-medium">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                <p className="text-gray-500 text-xs">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
              </div>
              <div className="text-right text-xs text-gray-400 whitespace-nowrap pt-0.5">
                {edu.startDate} – {edu.endDate ?? ''}
              </div>
            </div>
          ))}
        </Section>
      )}

      {content.skills.length > 0 && (
        <Section title="Skills">
          <div className="space-y-1">
            {content.skills.map((sg) => (
              <p key={sg.id} className="text-sm">
                <span className="text-gray-400 text-xs uppercase tracking-wide mr-2">{sg.category}</span>
                {sg.skills.join(', ')}
              </p>
            ))}
          </div>
        </Section>
      )}

      {content.projects.length > 0 && (
        <Section title="Projects">
          {content.projects.map((proj) => (
            <div key={proj.id} className="mb-4">
              <p className="font-medium">{proj.name}{proj.url ? <span className="text-gray-400 font-normal text-xs ml-2">{proj.url}</span> : null}</p>
              {proj.description && <p className="text-sm mt-1 text-gray-600">{stripHtml(proj.description)}</p>}
              {proj.tags.length > 0 && <p className="text-xs text-gray-400 mt-0.5">{proj.tags.join(' · ')}</p>}
            </div>
          ))}
        </Section>
      )}

      {content.certifications.length > 0 && (
        <Section title="Certifications">
          {content.certifications.map((cert) => (
            <p key={cert.id} className="text-sm mb-1">{cert.name} <span className="text-gray-400">— {cert.issuer}, {cert.date}</span></p>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">{title}</p>
      {children}
    </div>
  )
}
