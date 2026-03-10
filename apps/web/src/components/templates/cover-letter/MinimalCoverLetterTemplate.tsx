import type { CoverLetterContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function MinimalCoverLetterTemplate({ title, content }: { title: string; content: CoverLetterContent }) {
  const h = content.header
  return (
    <div className="font-sans text-[#111] bg-white p-14 max-w-[680px] mx-auto text-sm leading-loose">
      <div className="mb-10">
        <p className="text-3xl font-light">{h.senderName || title}</p>
        <div className="flex gap-4 mt-1 text-xs text-gray-400">
          {h.senderEmail && <span>{h.senderEmail}</span>}
          {h.senderPhone && <span>{h.senderPhone}</span>}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-8">{h.date}</p>

      {(h.recipientName || h.companyName) && (
        <div className="mb-8">
          {h.recipientName && <p>{h.recipientName}{h.recipientTitle ? `, ${h.recipientTitle}` : ''}</p>}
          {h.companyName && <p className="text-gray-500">{h.companyName}</p>}
          {h.companyAddress && <p className="text-xs text-gray-400">{h.companyAddress}</p>}
        </div>
      )}

      {content.jobTitle && <p className="mb-6 text-gray-600 text-xs uppercase tracking-widest">{content.jobTitle}</p>}

      <div className="space-y-5 text-gray-700">
        {content.opening && <p>{stripHtml(content.opening)}</p>}
        {content.body && <p>{stripHtml(content.body)}</p>}
        {content.closing && <p>{stripHtml(content.closing)}</p>}
      </div>

      <div className="mt-12">
        <p className="text-gray-400 text-xs">Regards,</p>
        <p className="mt-6 font-medium">{h.senderName || title}</p>
      </div>
    </div>
  )
}
