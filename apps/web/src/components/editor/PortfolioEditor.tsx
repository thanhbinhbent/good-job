import { ulid } from 'ulid'
import type { PortfolioContent, ProjectItem, TechStackItem, TimelineItem } from '@binh-tran/shared'
import { InlineEdit } from './InlineEdit'
import { RichTextSection } from './RichTextSection'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  content: PortfolioContent
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

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted-foreground w-24 pt-1 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function CollapsibleCard({
  title, subtitle, isAdmin, onRemove, children,
}: { title: string; subtitle?: string; isAdmin: boolean; onRemove: () => void; children: React.ReactNode }) {
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
            <Button variant="ghost" size="icon" className="size-6 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onRemove() }}>
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

const TECHNIQUE_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const
const TIMELINE_TYPES = ['work', 'education', 'achievement', 'project'] as const

export function PortfolioEditor({ content, isAdmin, onSave }: Props) {
  const hero = content.hero
  const about = content.about
  const contact = content.contact

  // ── Hero ────────────────────────────────────
  const heroField = (field: keyof typeof hero, label: string) => (
    <FieldRow label={label}>
      <InlineEdit
        value={(hero[field] as string | undefined) ?? ''}
        onSave={(v) => onSave('hero', { ...hero, [field]: v })}
        isAdmin={isAdmin}
        placeholder={`Enter ${label.toLowerCase()}…`}
      />
    </FieldRow>
  )

  // ── Projects ────────────────────────────────
  const addProject = () => {
    const item: ProjectItem = { id: ulid(), name: '', description: '', url: '', repo: '', tags: [] }
    onSave('projects', [...(content.projects ?? []), item])
  }
  const updateProject = (id: string, patch: Partial<ProjectItem>) =>
    onSave('projects', (content.projects ?? []).map((pr) => pr.id === id ? { ...pr, ...patch } : pr))
  const removeProject = (id: string) =>
    onSave('projects', (content.projects ?? []).filter((pr) => pr.id !== id))

  // ── Tech Stack ──────────────────────────────
  const addTech = () => {
    const item: TechStackItem = { id: ulid(), name: '', level: 'intermediate', category: '' }
    onSave('techStack', [...(content.techStack ?? []), item])
  }
  const updateTech = (id: string, patch: Partial<TechStackItem>) =>
    onSave('techStack', (content.techStack ?? []).map((t) => t.id === id ? { ...t, ...patch } : t))
  const removeTech = (id: string) =>
    onSave('techStack', (content.techStack ?? []).filter((t) => t.id !== id))

  // ── Timeline ────────────────────────────────
  const addTimeline = () => {
    const item: TimelineItem = { id: ulid(), year: '', title: '', description: '', type: 'work' }
    onSave('timeline', [...(content.timeline ?? []), item])
  }
  const updateTimeline = (id: string, patch: Partial<TimelineItem>) =>
    onSave('timeline', (content.timeline ?? []).map((t) => t.id === id ? { ...t, ...patch } : t))
  const removeTimeline = (id: string) =>
    onSave('timeline', (content.timeline ?? []).filter((t) => t.id !== id))

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section>
        <SectionHeader title="Hero" />
        <div className="border border-border rounded-lg p-4 flex flex-col gap-2">
          {heroField('headline', 'Headline')}
          {heroField('subheadline', 'Subheadline')}
          {heroField('ctaLabel', 'CTA Label')}
          {heroField('ctaUrl', 'CTA URL')}
          {heroField('avatarUrl', 'Avatar URL')}
        </div>
      </section>

      <Separator />

      {/* About */}
      <section>
        <SectionHeader title="About" />
        <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
          <FieldRow label="Bio">
            <RichTextSection
              content={about?.bio ?? ''}
              onSave={(html) => onSave('about', { ...about, bio: html })}
              isAdmin={isAdmin}
            />
          </FieldRow>
          <FieldRow label="Highlights">
            <InlineEdit
              value={(about?.highlights ?? []).join('\n')}
              onSave={(v) => onSave('about', { ...about, highlights: v.split('\n').map((s) => s.trim()).filter(Boolean) })}
              isAdmin={isAdmin}
              placeholder="One highlight per line…"
              as="textarea"
            />
          </FieldRow>
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
            <CollapsibleCard key={proj.id} title={proj.name || 'Untitled'} subtitle={proj.tags.join(', ')} isAdmin={isAdmin} onRemove={() => removeProject(proj.id)}>
              <FieldRow label="Name">
                <InlineEdit value={proj.name} onSave={(v) => updateProject(proj.id, { name: v })} isAdmin={isAdmin} />
              </FieldRow>
              <FieldRow label="Description">
                <RichTextSection content={proj.description} onSave={(html) => updateProject(proj.id, { description: html })} isAdmin={isAdmin} />
              </FieldRow>
              <FieldRow label="URL">
                <InlineEdit value={proj.url ?? ''} onSave={(v) => updateProject(proj.id, { url: v })} isAdmin={isAdmin} placeholder="https://…" />
              </FieldRow>
              <FieldRow label="Tags">
                <InlineEdit
                  value={proj.tags.join(', ')}
                  onSave={(v) => updateProject(proj.id, { tags: v.split(',').map((t) => t.trim()).filter(Boolean) })}
                  isAdmin={isAdmin}
                  placeholder="Comma-separated…"
                />
              </FieldRow>
            </CollapsibleCard>
          ))}
        </div>
      </section>

      <Separator />

      {/* Tech Stack */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Tech Stack" count={content.techStack?.length ?? 0} />
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={addTech}>
              <Plus className="size-3 mr-1" /> Add
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {(content.techStack ?? []).map((tech) => (
            <div key={tech.id} className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <InlineEdit value={tech.name} onSave={(v) => updateTech(tech.id, { name: v })} isAdmin={isAdmin} placeholder="Tech name…" />
                <InlineEdit value={tech.category} onSave={(v) => updateTech(tech.id, { category: v })} isAdmin={isAdmin} placeholder="Category…" />
                {isAdmin ? (
                  <Select value={tech.level} onValueChange={(v) => updateTech(tech.id, { level: v as TechStackItem['level'] })}>
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TECHNIQUE_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="w-fit text-xs">{tech.level}</Badge>
                )}
              </div>
              {isAdmin && (
                <Button variant="ghost" size="icon" className="size-6 text-destructive hover:text-destructive" onClick={() => removeTech(tech.id)}>
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Timeline */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Timeline" count={content.timeline?.length ?? 0} />
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={addTimeline}>
              <Plus className="size-3 mr-1" /> Add
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {(content.timeline ?? []).map((item) => (
            <CollapsibleCard key={item.id} title={item.title || 'Untitled'} subtitle={item.year} isAdmin={isAdmin} onRemove={() => removeTimeline(item.id)}>
              <FieldRow label="Year">
                <InlineEdit value={item.year} onSave={(v) => updateTimeline(item.id, { year: v })} isAdmin={isAdmin} placeholder="e.g. 2023" />
              </FieldRow>
              <FieldRow label="Title">
                <InlineEdit value={item.title} onSave={(v) => updateTimeline(item.id, { title: v })} isAdmin={isAdmin} />
              </FieldRow>
              <FieldRow label="Description">
                <InlineEdit value={item.description} onSave={(v) => updateTimeline(item.id, { description: v })} isAdmin={isAdmin} as="textarea" />
              </FieldRow>
              <FieldRow label="Type">
                {isAdmin ? (
                  <Select value={item.type} onValueChange={(v) => updateTimeline(item.id, { type: v as TimelineItem['type'] })}>
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                )}
              </FieldRow>
            </CollapsibleCard>
          ))}
        </div>
      </section>

      <Separator />

      {/* Contact */}
      <section>
        <SectionHeader title="Contact" />
        <div className="border border-border rounded-lg p-4 flex flex-col gap-2">
          {(['email', 'linkedin', 'github', 'twitter', 'website'] as const).map((field) => (
            <FieldRow key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
              <InlineEdit
                value={(contact[field] as string | undefined) ?? ''}
                onSave={(v) => onSave('contact', { ...contact, [field]: v })}
                isAdmin={isAdmin}
                placeholder={`${field}…`}
              />
            </FieldRow>
          ))}
        </div>
      </section>
    </div>
  )
}
