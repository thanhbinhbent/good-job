import React from 'react'
import { pdf } from '@react-pdf/renderer'
import type { ResumeContent, PortfolioContent, CoverLetterContent } from '@binh-tran/shared'
import type { Document as DocumentEntity } from '@binh-tran/shared'
import { ResumePDF, PortfolioPDF, CoverLetterPDF } from '@/components/export/DocumentPDF'

export async function downloadPDF(doc: DocumentEntity): Promise<void> {
  // content is stored as JSON string in SQLite — parse it if needed
  const content = typeof doc.content === 'string'
    ? (JSON.parse(doc.content) as unknown)
    : doc.content

  let pdfDoc: React.ReactElement

  if (doc.type === 'resume') {
    pdfDoc = <ResumePDF content={content as ResumeContent} />
  } else if (doc.type === 'portfolio') {
    pdfDoc = <PortfolioPDF content={content as PortfolioContent} />
  } else {
    pdfDoc = <CoverLetterPDF title={doc.title} content={content as CoverLetterContent} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(pdfDoc as any).toBlob()
  const url = URL.createObjectURL(blob)
  const a = window.document.createElement('a')
  a.href = url
  a.download = `${doc.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
