import type { CoverLetterContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function FormalCoverLetterTemplate({ title, content }: { title: string; content: CoverLetterContent }) {
  const h = content.header
  return (
    <div className="font-serif text-[#1a1a1a] bg-white p-12 max-w-[700px] mx-auto text-sm leading-relaxed">
      {/* Sender */}
      <div className="mb-8">
        <p className="text-lg font-bold">{h.senderName || title}</p>
        {h.senderTitle && <p className="text-gray-600">{h.senderTitle}</p>}
        {h.senderEmail && <p className="text-gray-600">{h.senderEmail}</p>}
        {h.senderPhone && <p className="text-gray-600">{h.senderPhone}</p>}
      </div>

      <p className="mb-6 text-gray-600">{h.date}</p>

      {/* Recipient */}
      {(h.recipientName || h.companyName) && (
        <div className="mb-8">
          {h.recipientName && <p className="font-medium">{h.recipientName}{h.recipientTitle ? `, ${h.recipientTitle}` : ''}</p>}
          {h.companyName && <p>{h.companyName}</p>}
          {h.companyAddress && <p className="text-gray-600">{h.companyAddress}</p>}
        </div>
      )}

      {content.jobTitle && <p className="mb-6 font-medium">Re: {content.jobTitle}</p>}

      <div className="border-t border-gray-200 pt-6 space-y-4">
        {content.opening && <p className="text-sm">{stripHtml(content.opening)}</p>}
        {content.body && <p className="text-sm">{stripHtml(content.body)}</p>}
        {content.closing && <p className="text-sm">{stripHtml(content.closing)}</p>}
      </div>

      <div className="mt-10">
        <p>Sincerely,</p>
        <p className="mt-8 font-bold">{h.senderName || title}</p>
      </div>
    </div>
  )
}
