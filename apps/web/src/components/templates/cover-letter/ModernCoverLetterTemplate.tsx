import type { CoverLetterContent } from '@binh-tran/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

export function ModernCoverLetterTemplate({ title, content }: { title: string; content: CoverLetterContent }) {
  const h = content.header
  return (
    <div className="font-sans bg-white max-w-[700px] mx-auto text-sm leading-relaxed flex">
      {/* Left accent bar */}
      <div className="w-2 bg-[#1e3a5f] shrink-0" />

      <div className="flex-1 p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">{h.senderName || title}</h1>
            {h.senderTitle && <p className="text-gray-500 text-xs mt-0.5">{h.senderTitle}</p>}
          </div>
          <div className="text-right text-xs text-gray-500">
            {h.senderEmail && <p>{h.senderEmail}</p>}
            {h.senderPhone && <p>{h.senderPhone}</p>}
            <p className="mt-1">{h.date}</p>
          </div>
        </div>

        {/* Recipient */}
        {(h.recipientName || h.companyName) && (
          <div className="mb-6">
            {h.recipientName && <p className="font-medium">{h.recipientName}{h.recipientTitle ? `, ${h.recipientTitle}` : ''}</p>}
            {h.companyName && <p className="text-[#1e3a5f]">{h.companyName}</p>}
            {h.companyAddress && <p className="text-gray-500 text-xs">{h.companyAddress}</p>}
          </div>
        )}

        {content.jobTitle && (
          <div className="mb-6 inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
            {content.jobTitle}
          </div>
        )}

        <div className="space-y-4 text-gray-700">
          {content.opening && <p>{stripHtml(content.opening)}</p>}
          {content.body && <p>{stripHtml(content.body)}</p>}
          {content.closing && <p>{stripHtml(content.closing)}</p>}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-xs">Best regards,</p>
          <p className="font-bold mt-4 text-[#1e3a5f]">{h.senderName || title}</p>
        </div>
      </div>
    </div>
  )
}
