import { ulid } from 'ulid'
import { useState } from 'react'
import type { ResumeContent, ExperienceItem, EducationItem, SkillGroup, CertificationItem, ProjectItem } from '@binh-tran/shared'
import { InlineEdit } from './InlineEdit'
import { RichTextSection } from './RichTextSection'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

type Props = {
  content: ResumeContent
  isAdmin: boolean
  onSave: (sectionKey: string, data: unknown) => void
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
      {count !== undefined && <Badge variant="outline" className="text-xs">{count}</Badge>}
    </div>
  )
}

function CollapsibleCard({
  title,
  subtitle,
  isAdmin,
  onRemove,
  children,
}: {
  title: string
  subtitle?: string
  isAdmin: boolean
  onRemove: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/20 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div>
          <span className="text-sm font-medium">{title}</span>
          {subtitle && <span className="text-xs text-muted-foreground ml-2">{subtitle}</span>}
        </div>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
            >
              <Trash2 className="size-3" />
            </Button>
          )}
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </div>
      {open && <div className="px-4 py-3 flex flex-col gap-2">{children}</div>}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted-foreground w-24 pt-1 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function ResumeEditor({ content, isAdmin, onSave }: Props) {
  // ── Personal ────────────────────────────────
  const p = content.personal

  const pField = (field: keyof typeof p, label: string) => (
    <FieldRow label={label}>
      <InlineEdit
        value={(p[field] as string | undefined) ?? ''}
        onSave={(v) => onSave('personal', { ...p, [field]: v })}
        isAdmin={isAdmin}
        placeholder={`Enter ${label.toLowerCase()}…`}
      />
    </FieldRow>
  )

  // ── Experience ──────────────────────────────
  const addExperience = () => {
    const item: ExperienceItem = {
      id: ulid(), company: '', role: '', startDate: '', endDate: '',
      current: false, location: '', description: '',
    }
    onSave('experience', [...(content.experience ?? []), item])
  }

  const updateExperience = (id: string, patch: Partial<ExperienceItem>) => {
    onSave('experience', (content.experience ?? []).map((e) => e.id === id ? { ...e, ...patch } : e))
  }

  const removeExperience = (id: string) => {
    onSave('experience', (content.experience ?? []).filter((e) => e.id !== id))
  }

  // ── Education ───────────────────────────────
  const addEducation = () => {
    const item: EducationItem = { id: ulid(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '' }
    onSave('education', [...(content.education ?? []), item])
  }

  const updateEducation = (id: string, patch: Partial<EducationItem>) => {
    onSave('education', (content.education ?? []).map((e) => e.id === id ? { ...e, ...patch } : e))
  }

  const removeEducation = (id: string) => {
    onSave('education', (content.education ?? []).filter((e) => e.id !== id))
  }

  // ── Skills ──────────────────────────────────
  const addSkillGroup = () => {
    const item: SkillGroup = { id: ulid(), category: 'New Category', skills: [] }
    onSave('skills', [...(content.skills ?? []), item])
  }

  const updateSkillGroup = (id: string, patch: Partial<SkillGroup>) => {
    onSave('skills', (content.skills ?? []).map((s) => s.id === id ? { ...s, ...patch } : s))
  }

  const removeSkillGroup = (id: string) => {
    onSave('skills', (content.skills ?? []).filter((s) => s.id !== id))
  }

  // ── Certifications ───────────────────────────
  const addCertification = () => {
    const item: CertificationItem = { id: ulid(), name: '', issuer: '', date: '', url: '' }
    onSave('certifications', [...(content.certifications ?? []), item])
  }

  const updateCertification = (id: string, patch: Partial<CertificationItem>) => {
    onSave('certifications', (content.certifications ?? []).map((c) => c.id === id ? { ...c, ...patch } : c))
  }

  const removeCertification = (id: string) => {
    onSave('certifications', (content.certifications ?? []).filter((c) => c.id !== id))
  }

  // ── Projects ────────────────────────────────
  const addProject = () => {
    const item: ProjectItem = { id: ulid(), name: '', description: '', url: '', repo: '', tags: [] }
    onSave('projects', [...(content.projects ?? []), item])
  }

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    onSave('projects', (content.projects ?? []).map((pr) => pr.id === id ? { ...pr, ...patch } : pr))
  }

  const removeProject = (id: string) => {
    onSave('projects', (content.projects ?? []).filter((pr) => pr.id !== id))
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Personal */}
      <section>
        <SectionHeader title="Personal Information" />
        <div className="flex flex-col gap-2 border border-border rounded-lg p-4">
          {pField('name', 'Full Name')}
          {pField('title', 'Job Title')}
          {pField('email', 'Email')}
          {pField('phone', 'Phone')}
          {pField('location', 'Location')}
          {pField('website', 'Website')}
          {pField('linkedin', 'LinkedIn')}
          {pField('github', 'GitHub')}
        </div>
      </section>

      <Separator />

      {/* Experience */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Experience" count={content.experience?.length ?? 0} />
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={addExperience}>
              <Plus className="size-3 mr-1" /> Add
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {(content.experience ?? []).map((exp) => (
            <CollapsibleCard
              key={exp.id}
              title={exp.role || 'Untitled Role'}
              subtitle={exp.company}
              isAdmin={isAdmin}
              onRemove={() => removeExperience(exp.id)}
            >
              <FieldRow label="Role">
                <InlineEdit value={exp.role} onSave={(v) => updateExperience(exp.id, { role: v })} isAdmin={isAdmin} placeholder="Job title…" />
              </FieldRow>
              <FieldRow label="Company">
                <InlineEdit value={exp.company} onSave={(v) => updateExperience(exp.id, { company: v })} isAdmin={isAdmin} placeholder="Company name…" />
              </FieldRow>
              <FieldRow label="Location">
                <InlineEdit value={exp.location ?? ''} onSave={(v) => updateExperience(exp.id, { location: v })} isAdmin={isAdmin} placeholder="City, Country…" />
              </FieldRow>
              <FieldRow label="Start">
                <InlineEdit value={exp.startDate} onSave={(v) => updateExperience(exp.id, { startDate: v })} isAdmin={isAdmin} placeholder="e.g. Jan 2022" />
              </FieldRow>
              <FieldRow label="End">
                <InlineEdit value={exp.current ? 'Present' : (exp.endDate ?? '')} onSave={(v) => updateExperience(exp.id, { endDate: v, current: v.toLowerCase() === 'present' })} isAdmin={isAdmin} placeholder="e.g. Dec 2023 or Present" />
              </FieldRow>
              <FieldRow label="Description">
                <RichTextSection
                  content={exp.description}
                  onSave={(html) => updateExperience(exp.id, { description: html })}
                  isAdmin={isAdmin}
                />
              </FieldRow>
            </CollapsibleCard>
          ))}
        </div>
      </section>

      <Separator />

      {/* Education */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Education" count={content.education?.length ?? 0} />
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={addEducation}>
              <Plus className="size-3 mr-1" /> Add
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {(content.education ?? []).map((edu) => (
            <CollapsibleCard
              key={edu.id}
              title={edu.degree || 'Untitled Degree'}
              subtitle={edu.institution}
              isAdmin={isAdmin}
              onRemove={() => removeEducation(edu.id)}
            >
              <FieldRow label="Degree">
                <InlineEdit value={edu.degree} onSave={(v) => updateEducation(edu.id, { degree: v })} isAdmin={isAdmin} placeholder="e.g. B.Sc. Computer Science" />
              </FieldRow>
              <FieldRow label="Field">
                <InlineEdit value={edu.field ?? ''} onSave={(v) => updateEducation(edu.id, { field: v })} isAdmin={isAdmin} placeholder="Field of study…" />
              </FieldRow>
              <FieldRow label="Institution">
                <InlineEdit value={edu.institution} onSave={(v) => updateEducation(edu.id, { institution: v })} isAdmin={isAdmin} placeholder="University name…" />
              </FieldRow>
              <FieldRow label="Start">
                <InlineEdit value={edu.startDate} onSave={(v) => updateEducation(edu.id, { startDate: v })} isAdmin={isAdmin} placeholder="e.g. Sep 2018" />
              </FieldRow>
              <FieldRow label="End">
                <InlineEdit value={edu.endDate ?? ''} onSave={(v) => updateEducation(edu.id, { endDate: v })} isAdmin={isAdmin} placeholder="e.g. Jun 2022" />
              </FieldRow>
              <FieldRow label="GPA">
                <InlineEdit value={edu.gpa ?? ''} onSave={(v) => updateEducation(edu.id, { gpa: v })} isAdmin={isAdmin} placeholder="e.g. 3.8/4.0" />
              </FieldRow>
            </CollapsibleCard>
          ))}
        </div>
      </section>

      <Separator />

      {/* Skills */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Skills" count={content.skills?.length ?? 0} />
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={addSkillGroup}>
              <Plus className="size-3 mr-1" /> Add Group
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {(content.skills ?? []).map((sg) => (
            <CollapsibleCard
              key={sg.id}
              title={sg.category || 'Untitled Category'}
              subtitle={`${sg.skills.length} skills`}
              isAdmin={isAdmin}
              onRemove={() => removeSkillGroup(sg.id)}
            >
              <FieldRow label="Category">
                <InlineEdit value={sg.category} onSave={(v) => updateSkillGroup(sg.id, { category: v })} isAdmin={isAdmin} placeholder="e.g. Frontend, Backend…" />
              </FieldRow>
              <FieldRow label="Skills">
                <InlineEdit
                  value={sg.skills.join(', ')}
                  onSave={(v) => updateSkillGroup(sg.id, { skills: v.split(',').map((s) => s.trim()).filter(Boolean) })}
                  isAdmin={isAdmin}
                  placeholder="Comma-separated list…"
                  as="textarea"
                />
              </FieldRow>
            </CollapsibleCard>
          ))}
        </div>
      </section>

      <Separator />

      {/* Certifications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Certifications" count={content.certifications?.length ?? 0} />
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={addCertification}>
              <Plus className="size-3 mr-1" /> Add
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {(content.certifications ?? []).map((cert) => (
            <CollapsibleCard
              key={cert.id}
              title={cert.name || 'Untitled Certification'}
              subtitle={cert.issuer}
              isAdmin={isAdmin}
              onRemove={() => removeCertification(cert.id)}
            >
              <FieldRow label="Name">
                <InlineEdit value={cert.name} onSave={(v) => updateCertification(cert.id, { name: v })} isAdmin={isAdmin} placeholder="Certification name…" />
              </FieldRow>
              <FieldRow label="Issuer">
                <InlineEdit value={cert.issuer} onSave={(v) => updateCertification(cert.id, { issuer: v })} isAdmin={isAdmin} placeholder="e.g. AWS, Google…" />
              </FieldRow>
              <FieldRow label="Date">
                <InlineEdit value={cert.date} onSave={(v) => updateCertification(cert.id, { date: v })} isAdmin={isAdmin} placeholder="e.g. Mar 2024" />
              </FieldRow>
              <FieldRow label="URL">
                <InlineEdit value={cert.url ?? ''} onSave={(v) => updateCertification(cert.id, { url: v })} isAdmin={isAdmin} placeholder="Verification link…" />
              </FieldRow>
            </CollapsibleCard>
          ))}
        </div>
      </section>

      <Separator />

      {/* Projects */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Projects" count={content.projects?.length ?? 0} />
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={addProject}>
              <Plus className="size-3 mr-1" /> Add
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {(content.projects ?? []).map((proj) => (
            <CollapsibleCard
              key={proj.id}
              title={proj.name || 'Untitled Project'}
              subtitle={proj.tags.join(', ')}
              isAdmin={isAdmin}
              onRemove={() => removeProject(proj.id)}
            >
              <FieldRow label="Name">
                <InlineEdit value={proj.name} onSave={(v) => updateProject(proj.id, { name: v })} isAdmin={isAdmin} placeholder="Project name…" />
              </FieldRow>
              <FieldRow label="Description">
                <RichTextSection
                  content={proj.description}
                  onSave={(html) => updateProject(proj.id, { description: html })}
                  isAdmin={isAdmin}
                />
              </FieldRow>
              <FieldRow label="URL">
                <InlineEdit value={proj.url ?? ''} onSave={(v) => updateProject(proj.id, { url: v })} isAdmin={isAdmin} placeholder="Live URL…" />
              </FieldRow>
              <FieldRow label="Repo">
                <InlineEdit value={proj.repo ?? ''} onSave={(v) => updateProject(proj.id, { repo: v })} isAdmin={isAdmin} placeholder="GitHub URL…" />
              </FieldRow>
              <FieldRow label="Tags">
                <InlineEdit
                  value={proj.tags.join(', ')}
                  onSave={(v) => updateProject(proj.id, { tags: v.split(',').map((t) => t.trim()).filter(Boolean) })}
                  isAdmin={isAdmin}
                  placeholder="Comma-separated tags…"
                />
              </FieldRow>
            </CollapsibleCard>
          ))}
        </div>
      </section>
    </div>
  )
}
