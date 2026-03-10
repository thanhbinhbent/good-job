import type { ResumeContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function HarvardTemplate({ content }: { content: ResumeContent }) {
  const p = content.personal
  const contacts = [p.email, p.phone, p.location, p.website, p.linkedin && `linkedin.com/in/${p.linkedin}`, p.github && `github.com/${p.github}`].filter(Boolean)

  return (
    <div className="font-serif text-[#1a1a1a] bg-white p-10 max-w-[780px] mx-auto text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold tracking-wide uppercase">{p.name || 'Your Name'}</h1>
        {p.title && <p className="text-sm text-gray-600 mt-1">{p.title}</p>}
        {contacts.length > 0 && (
          <p className="text-xs text-gray-600 mt-2">{contacts.join('  ·  ')}</p>
        )}
      </div>

      {content.personal.summary && (
        <Section title="Summary">
          <p className="text-sm">{stripHtml(content.personal.summary)}</p>
        </Section>
      )}

      {content.experience.length > 0 && (
        <Section title="Experience">
          {content.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold">{exp.company || 'Company'}</span>
                <span className="text-xs text-gray-500">{exp.startDate} – {exp.current ? 'Present' : (exp.endDate ?? '')}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="italic text-sm">{exp.role}</span>
                {exp.location && <span className="text-xs text-gray-500">{exp.location}</span>}
              </div>
              {exp.description && <p className="text-sm mt-1 text-gray-700">{stripHtml(exp.description)}</p>}
            </div>
          ))}
        </Section>
      )}

      {content.education.length > 0 && (
        <Section title="Education">
          {content.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span className="font-bold">{edu.institution}</span>
                <span className="text-xs text-gray-500">{edu.startDate} – {edu.endDate ?? ''}</span>
              </div>
              <p className="italic text-sm">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
            </div>
          ))}
        </Section>
      )}

      {content.skills.length > 0 && (
        <Section title="Skills">
          {content.skills.map((sg) => (
            <p key={sg.id} className="text-sm mb-1">
              <span className="font-bold">{sg.category}: </span>{sg.skills.join(', ')}
            </p>
          ))}
        </Section>
      )}

      {content.projects.length > 0 && (
        <Section title="Projects">
          {content.projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span className="font-bold">{proj.name}</span>
                {proj.url && <span className="text-xs text-gray-500">{proj.url}</span>}
              </div>
              {proj.description && <p className="text-sm text-gray-700">{stripHtml(proj.description)}</p>}
              {proj.tags.length > 0 && <p className="text-xs text-gray-500 mt-0.5">{proj.tags.join(', ')}</p>}
            </div>
          ))}
        </Section>
      )}

      {content.certifications.length > 0 && (
        <Section title="Certifications">
          {content.certifications.map((cert) => (
            <p key={cert.id} className="text-sm mb-1">{cert.name} — {cert.issuer}, {cert.date}</p>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#1a1a1a] pb-0.5 mb-3">{title}</h2>
      {children}
    </div>
  )
}
