import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { getDatabase } from '../db/database';
import { documents } from '../db/schema';
import { eq } from 'drizzle-orm';

type ResumeContent = {
  personal?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
  };
  experience?: Array<{
    company?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    location?: string;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: Array<{ category?: string; skills?: string[] }>;
  certifications?: Array<{ name?: string; issuer?: string; date?: string }>;
  projects?: Array<{
    name?: string;
    description?: string;
    tags?: string[];
    url?: string;
  }>;
};

type PortfolioContent = {
  hero?: { headline?: string; subheadline?: string };
  about?: { bio?: string; highlights?: string[] };
  projects?: Array<{ name?: string; description?: string; tags?: string[] }>;
  techStack?: Array<{ name?: string; category?: string; level?: string }>;
  contact?: { email?: string; linkedin?: string; github?: string };
};

type CoverLetterContent = {
  header?: {
    senderName?: string;
    senderTitle?: string;
    senderEmail?: string;
    date?: string;
    companyName?: string;
    recipientName?: string;
  };
  opening?: string;
  body?: string;
  closing?: string;
  jobTitle?: string;
};

@Injectable()
export class ExportService {
  private get db() {
    return getDatabase();
  }

  private findDocument(id: string) {
    const rows = this.db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .all();
    if (!rows.length) throw new NotFoundException(`Document ${id} not found`);
    return rows[0];
  }

  async generateDocx(id: string): Promise<Buffer> {
    const doc = this.findDocument(id);
    const content = JSON.parse(doc.content) as Record<string, unknown>;

    let wordDoc: Document;

    if (doc.type === 'resume') {
      wordDoc = this.buildResumeDocx(
        doc.title,
        content as unknown as ResumeContent,
      );
    } else if (doc.type === 'portfolio') {
      wordDoc = this.buildPortfolioDocx(
        doc.title,
        content as unknown as PortfolioContent,
      );
    } else {
      wordDoc = this.buildCoverLetterDocx(
        doc.title,
        content as unknown as CoverLetterContent,
      );
    }

    return await Packer.toBuffer(wordDoc);
  }

  private buildResumeDocx(title: string, c: ResumeContent): Document {
    const children: Paragraph[] = [];

    const p = (
      text: string,
      opts?: {
        bold?: boolean;
        size?: number;
        heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
        spacing?: number;
      },
    ) =>
      new Paragraph({
        children: [
          new TextRun({ text, bold: opts?.bold, size: opts?.size ?? 22 }),
        ],
        heading: opts?.heading,
        spacing: { after: opts?.spacing ?? 80 },
        alignment: AlignmentType.LEFT,
      });

    children.push(
      p(c.personal?.name ?? title, { bold: true, size: 40, spacing: 40 }),
    );
    if (c.personal?.title)
      children.push(p(c.personal.title, { size: 24, spacing: 40 }));

    const contact = [
      c.personal?.email,
      c.personal?.phone,
      c.personal?.location,
      c.personal?.website,
    ]
      .filter(Boolean)
      .join('  |  ');
    if (contact) children.push(p(contact, { size: 20, spacing: 160 }));

    if (c.experience?.length) {
      children.push(
        p('Experience', { heading: HeadingLevel.HEADING_2, spacing: 80 }),
      );
      for (const exp of c.experience) {
        children.push(
          p(`${exp.role ?? ''} — ${exp.company ?? ''}`, {
            bold: true,
            spacing: 40,
          }),
        );
        const dates = `${exp.startDate ?? ''} – ${exp.current ? 'Present' : (exp.endDate ?? '')}`;
        children.push(p(dates, { size: 20, spacing: 40 }));
        if (exp.description)
          children.push(p(exp.description, { spacing: 120 }));
      }
    }

    if (c.education?.length) {
      children.push(
        p('Education', { heading: HeadingLevel.HEADING_2, spacing: 80 }),
      );
      for (const edu of c.education) {
        children.push(
          p(
            `${edu.degree ?? ''}${edu.field ? ` in ${edu.field}` : ''} — ${edu.institution ?? ''}`,
            { bold: true, spacing: 40 },
          ),
        );
        children.push(
          p(`${edu.startDate ?? ''} – ${edu.endDate ?? ''}`, {
            size: 20,
            spacing: 120,
          }),
        );
      }
    }

    if (c.skills?.length) {
      children.push(
        p('Skills', { heading: HeadingLevel.HEADING_2, spacing: 80 }),
      );
      for (const sg of c.skills) {
        children.push(
          p(`${sg.category ?? ''}: ${(sg.skills ?? []).join(', ')}`, {
            spacing: 60,
          }),
        );
      }
    }

    if (c.projects?.length) {
      children.push(
        p('Projects', { heading: HeadingLevel.HEADING_2, spacing: 80 }),
      );
      for (const proj of c.projects) {
        children.push(p(proj.name ?? '', { bold: true, spacing: 40 }));
        if (proj.description)
          children.push(p(proj.description, { spacing: 40 }));
        if (proj.url) children.push(p(proj.url, { size: 20, spacing: 80 }));
      }
    }

    return new Document({ sections: [{ children }] });
  }

  private buildPortfolioDocx(title: string, c: PortfolioContent): Document {
    const children: Paragraph[] = [];
    const p = (
      text: string,
      opts?: {
        bold?: boolean;
        size?: number;
        heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
      },
    ) =>
      new Paragraph({
        children: [
          new TextRun({ text, bold: opts?.bold, size: opts?.size ?? 22 }),
        ],
        heading: opts?.heading,
        spacing: { after: 80 },
      });

    children.push(p(c.hero?.headline ?? title, { bold: true, size: 40 }));
    if (c.hero?.subheadline) children.push(p(c.hero.subheadline, { size: 24 }));

    if (c.about?.bio) {
      children.push(p('About', { heading: HeadingLevel.HEADING_2 }));
      children.push(p(c.about.bio));
    }

    if (c.projects?.length) {
      children.push(p('Projects', { heading: HeadingLevel.HEADING_2 }));
      for (const proj of c.projects) {
        children.push(p(proj.name ?? '', { bold: true }));
        if (proj.description) children.push(p(proj.description));
      }
    }

    if (c.techStack?.length) {
      children.push(p('Tech Stack', { heading: HeadingLevel.HEADING_2 }));
      const grouped = c.techStack.reduce<Record<string, string[]>>((acc, t) => {
        const cat = t.category ?? 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(t.name ?? '');
        return acc;
      }, {});
      for (const [cat, names] of Object.entries(grouped)) {
        children.push(p(`${cat}: ${names.join(', ')}`));
      }
    }

    if (c.contact) {
      children.push(p('Contact', { heading: HeadingLevel.HEADING_2 }));
      const contactLine = [
        c.contact.email,
        c.contact.linkedin,
        c.contact.github,
      ]
        .filter(Boolean)
        .join('  |  ');
      if (contactLine) children.push(p(contactLine));
    }

    return new Document({ sections: [{ children }] });
  }

  private buildCoverLetterDocx(
    _title: string,
    c: CoverLetterContent,
  ): Document {
    const children: Paragraph[] = [];
    const p = (text: string, opts?: { bold?: boolean; spacing?: number }) =>
      new Paragraph({
        children: [new TextRun({ text, bold: opts?.bold, size: 22 })],
        spacing: { after: opts?.spacing ?? 120 },
      });

    if (c.header?.senderName)
      children.push(p(c.header.senderName, { bold: true }));
    if (c.header?.senderTitle) children.push(p(c.header.senderTitle));
    if (c.header?.senderEmail)
      children.push(p(c.header.senderEmail, { spacing: 240 }));

    if (c.header?.date) children.push(p(c.header.date, { spacing: 240 }));

    if (c.header?.companyName) children.push(p(c.header.companyName));
    if (c.header?.recipientName)
      children.push(p(c.header.recipientName, { spacing: 240 }));

    if (c.opening) children.push(p(c.opening, { spacing: 240 }));
    if (c.body) {
      for (const paragraph of c.body.split('\n').filter(Boolean)) {
        children.push(p(paragraph));
      }
    }
    if (c.closing) children.push(p(c.closing, { spacing: 0 }));

    return new Document({ sections: [{ children }] });
  }
}
