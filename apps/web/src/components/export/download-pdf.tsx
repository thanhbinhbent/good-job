import React from 'react'
import { pdf } from '@react-pdf/renderer'
import type { ResumeContent, PortfolioContent, CoverLetterContent, CanvasDocument } from '@binh-tran/shared'
import type { Document as DocumentEntity } from '@binh-tran/shared'
import { ResumePDF, PortfolioPDF, CoverLetterPDF, CanvasPDF } from '@/components/export/DocumentPDF'

function isCanvasContent(content: unknown): content is CanvasDocument {
  return typeof content === 'object' && content !== null && (content as { version?: number }).version === 1 && Array.isArray((content as { sections?: unknown[] }).sections)
}

export async function downloadPDF(doc: DocumentEntity): Promise<void> {
  // content is stored as JSON string in SQLite — parse it if needed
  const content = typeof doc.content === 'string'
    ? (JSON.parse(doc.content) as unknown)
    : doc.content

  let pdfDoc: React.ReactElement

  if (isCanvasContent(content)) {
    pdfDoc = <CanvasPDF content={content} />
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(pdfDoc as any).toBlob()
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${doc.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    return
  }

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
