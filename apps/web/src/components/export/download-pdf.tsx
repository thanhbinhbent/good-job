import React from 'react'
import { pdf } from '@react-pdf/renderer'
import type { ResumeContent, PortfolioContent, CoverLetterContent } from '@binh-tran/shared'
import type { Document as DocumentEntity } from '@binh-tran/shared'
import { ResumePDF, PortfolioPDF, CoverLetterPDF } from '@/components/export/DocumentPDF'

export async function downloadPDF(doc: DocumentEntity): Promise<void> {
  let pdfDoc: React.ReactElement

  if (doc.type === 'resume') {
    pdfDoc = <ResumePDF content={doc.content as ResumeContent} />
  } else if (doc.type === 'portfolio') {
    pdfDoc = <PortfolioPDF content={doc.content as PortfolioContent} />
  } else {
    pdfDoc = <CoverLetterPDF title={doc.title} content={doc.content as CoverLetterContent} />
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
