import type { CoverLetterContent } from '@binh-tran/shared'
import { InlineEdit } from './InlineEdit'
import { RichTextSection } from './RichTextSection'
import { Separator } from '@/components/ui/separator'

type Props = {
  content: CoverLetterContent
  isAdmin: boolean
  onSave: (sectionKey: string, data: unknown) => void
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{title}</h2>
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted-foreground w-28 pt-1 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function CoverLetterEditor({ content, isAdmin, onSave }: Props) {
  const header = content.header
  const headerField = (field: keyof typeof header, label: string) => (
    <FieldRow label={label}>
      <InlineEdit
        value={(header[field] as string | undefined) ?? ''}
        onSave={(v) => onSave('header', { ...header, [field]: v })}
        isAdmin={isAdmin}
        placeholder={`Enter ${label.toLowerCase()}…`}
      />
    </FieldRow>
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section>
        <SectionHeader title="Header" />
        <div className="border border-border rounded-lg p-4 flex flex-col gap-2">
          {headerField('senderName', 'Your Name')}
          {headerField('senderTitle', 'Your Title')}
          {headerField('senderEmail', 'Your Email')}
          {headerField('senderPhone', 'Your Phone')}
          {headerField('date', 'Date')}
          {headerField('recipientName', 'Recipient Name')}
          {headerField('recipientTitle', 'Recipient Title')}
          {headerField('companyName', 'Company Name')}
          {headerField('companyAddress', 'Company Address')}
        </div>
      </section>

      <Separator />

      {/* Job Title */}
      <section>
        <SectionHeader title="Position" />
        <div className="border border-border rounded-lg p-4">
          <FieldRow label="Job Title">
            <InlineEdit
              value={content.jobTitle ?? ''}
              onSave={(v) => onSave('jobTitle', v)}
              isAdmin={isAdmin}
              placeholder="Position you're applying for…"
            />
          </FieldRow>
        </div>
      </section>

      <Separator />

      {/* Opening */}
      <section>
        <SectionHeader title="Opening" />
        <RichTextSection
          content={content.opening}
          onSave={(html) => onSave('opening', html)}
          isAdmin={isAdmin}
          placeholder="Dear Hiring Manager,"
        />
      </section>

      <Separator />

      {/* Body */}
      <section>
        <SectionHeader title="Body" />
        <RichTextSection
          content={content.body}
          onSave={(html) => onSave('body', html)}
          isAdmin={isAdmin}
          placeholder="Introduce yourself and explain why you're a great fit…"
        />
      </section>

      <Separator />

      {/* Closing */}
      <section>
        <SectionHeader title="Closing" />
        <RichTextSection
          content={content.closing}
          onSave={(html) => onSave('closing', html)}
          isAdmin={isAdmin}
          placeholder="Sincerely, Your Name"
        />
      </section>
    </div>
  )
}
