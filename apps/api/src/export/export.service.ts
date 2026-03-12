import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  TableLayoutType,
  WidthType,
  BorderStyle,
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

type CanvasColor = { hex?: string; opacity?: number };
type CanvasBlock = {
  id: string;
  kind: string;
  rowId?: string;
  rowWidth?: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  color?: CanvasColor;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  marginBottom?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  leftContent?: string;
  rightContent?: string;
  rightFontWeight?: string;
  rightColor?: CanvasColor;
  gap?: number;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  chipBackground?: CanvasColor;
  chipColor?: CanvasColor;
  chipRadius?: number;
  items?: string[];
  label?: string;
  value?: number;
  trackColor?: CanvasColor;
  fillColor?: CanvasColor;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  url?: string;
  thickness?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  marginTop?: number;
  width?: number;
  radius?: number;
  leftContentRaw?: string;
  rightContentRaw?: string;
};
type CanvasColumn = {
  id: string;
  weight?: number;
  paddingX?: number;
  paddingY?: number;
  background?: CanvasColor;
  blocks: CanvasBlock[];
};
type CanvasSection = {
  id: string;
  label?: string;
  hidden?: boolean;
  columns: CanvasColumn[];
  background?: CanvasColor;
  paddingX?: number;
  paddingY?: number;
  gap?: number;
  border?: {
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: CanvasColor;
    radius?: number;
  };
};
type CanvasContent = {
  version?: number;
  style?: {
    pageWidth?: number;
    pagePaddingX?: number;
    pagePaddingY?: number;
    fontFamily?: string;
    baseFontSize?: number;
    textColor?: CanvasColor;
  };
  sections?: CanvasSection[];
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

    if (this.isCanvasContent(content)) {
      const wordDoc = this.buildCanvasDocx(
        doc.title,
        content as unknown as CanvasContent,
      );
      return await Packer.toBuffer(wordDoc);
    }

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

  private isCanvasContent(content: unknown): content is CanvasContent {
    if (!content || typeof content !== 'object') return false;
    const c = content as CanvasContent;
    return c.version === 1 && Array.isArray(c.sections);
  }

  private stripHtml(input?: string): string {
    if (!input) return '';
    return input
      .replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeHtmlToText(input?: string): string {
    if (!input) return '';
    return input
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\s*\/p\s*>/gi, '\n')
      .replace(/<\s*\/h[1-6]\s*>/gi, '\n')
      .replace(/<\s*\/li\s*>/gi, '\n')
      .replace(/<\s*li\b[^>]*>/gi, '• ')
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private toDocxColor(color?: CanvasColor, fallback = '111111'): string {
    const raw = color?.hex?.trim() ?? '';
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.slice(1).toUpperCase();
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
      return `${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toUpperCase();
    }
    return fallback;
  }

  private pxToTwip(px: number): number {
    return Math.max(0, Math.round(px * 15));
  }

  private pxToHalfPoint(px: number): number {
    return Math.max(2, Math.round(px * 1.5));
  }

  private mapAlignment(
    align?: 'left' | 'center' | 'right' | 'justify',
  ): (typeof AlignmentType)[keyof typeof AlignmentType] {
    if (align === 'center') return AlignmentType.CENTER;
    if (align === 'right') return AlignmentType.RIGHT;
    if (align === 'justify') return AlignmentType.JUSTIFIED;
    return AlignmentType.LEFT;
  }

  private mapBorderStyle(
    style?: 'solid' | 'dashed' | 'dotted',
  ): (typeof BorderStyle)[keyof typeof BorderStyle] {
    if (style === 'dashed') return BorderStyle.DASHED;
    if (style === 'dotted') return BorderStyle.DOTTED;
    return BorderStyle.SINGLE;
  }

  private safePx(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return fallback;
  }

  private groupedRows(
    blocks: CanvasBlock[],
  ): Array<{ id: string; blocks: CanvasBlock[] }> {
    const rows: Array<{ id: string; blocks: CanvasBlock[] }> = [];
    for (const block of blocks) {
      const rowId = block.rowId?.trim();
      if (!rowId) {
        rows.push({ id: block.id, blocks: [block] });
        continue;
      }
      const prev = rows[rows.length - 1];
      if (prev && prev.id === `row:${rowId}`) {
        prev.blocks.push(block);
      } else {
        rows.push({ id: `row:${rowId}`, blocks: [block] });
      }
    }
    return rows;
  }

  private blockParagraphs(
    block: CanvasBlock,
    defaultFontFamily?: string,
    defaultTextColor?: CanvasColor,
    overrideAlign?: 'left' | 'center' | 'right' | 'justify',
  ): Paragraph[] {
    const baseFontSize = this.pxToHalfPoint(this.safePx(block.fontSize, 14));
    const baseColor = this.toDocxColor(
      block.color ?? defaultTextColor,
      '111111',
    );
    const spacingAfter = this.pxToTwip(this.safePx(block.marginBottom, 4));
    const alignment = this.mapAlignment(overrideAlign ?? block.align);
    const font = block.fontFamily || defaultFontFamily;

    if (block.kind === 'text') {
      const text = this.normalizeHtmlToText(block.content);
      if (!text) return [];
      const lines = text.split('\n');
      return lines.map((line, index) => {
        const transformed =
          block.textTransform === 'uppercase'
            ? line.toUpperCase()
            : block.textTransform === 'lowercase'
              ? line.toLowerCase()
              : block.textTransform === 'capitalize'
                ? line.replace(/\b\w/g, (char) => char.toUpperCase())
                : line;

        return new Paragraph({
          children: [
            new TextRun({
              text: transformed,
              color: baseColor,
              size: baseFontSize,
              font,
              bold: ['600', '700', '800'].includes(block.fontWeight ?? '400'),
              italics: block.fontStyle === 'italic',
            }),
          ],
          alignment,
          spacing: {
            after: index === lines.length - 1 ? spacingAfter : this.pxToTwip(2),
            line: Math.round((block.lineHeight ?? 1.4) * 240),
          },
        });
      });
    }

    if (block.kind === 'dualText') {
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: this.normalizeHtmlToText(block.leftContent),
              color: this.toDocxColor(
                block.color ?? defaultTextColor,
                '111111',
              ),
              size: baseFontSize,
              font,
              bold: ['600', '700', '800'].includes(block.fontWeight ?? '400'),
              italics: block.fontStyle === 'italic',
            }),
            new TextRun({ text: '  ' }),
            new TextRun({
              text: this.normalizeHtmlToText(block.rightContent),
              color: this.toDocxColor(
                block.rightColor ?? block.color ?? defaultTextColor,
                '6B7280',
              ),
              size: baseFontSize,
              font,
              bold: ['600', '700', '800'].includes(
                block.rightFontWeight ?? '400',
              ),
            }),
          ],
          spacing: {
            after: spacingAfter,
            line: Math.round((block.lineHeight ?? 1.4) * 240),
          },
          alignment,
        }),
      ];
    }

    if (block.kind === 'date') {
      const end = block.current ? 'Present' : (block.endDate ?? '');
      const label = [block.startDate, end].filter(Boolean).join(' – ');
      if (!label) return [];
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: label,
              size: baseFontSize,
              color: baseColor,
              font,
            }),
          ],
          spacing: { after: spacingAfter },
          alignment,
        }),
      ];
    }

    if (block.kind === 'tags') {
      if (!Array.isArray(block.items) || !block.items.length) return [];
      return [
        new Paragraph({
          children: block.items.flatMap((item, index) => {
            const runs: TextRun[] = [
              new TextRun({
                text: item,
                size: this.pxToHalfPoint(this.safePx(block.fontSize, 11)),
                color: this.toDocxColor(block.chipColor, '1E293B'),
                shading: {
                  fill: this.toDocxColor(block.chipBackground, 'E2E8F0'),
                },
              }),
            ];
            if (index < block.items!.length - 1)
              runs.push(new TextRun({ text: '  ' }));
            return runs;
          }),
          spacing: { after: spacingAfter },
          alignment: AlignmentType.LEFT,
        }),
      ];
    }

    if (block.kind === 'progress') {
      const barLength = 20;
      const value = Math.max(0, Math.min(100, Math.round(block.value ?? 0)));
      const filledLength = Math.round((value / 100) * barLength);
      const bar = `${'█'.repeat(filledLength)}${'░'.repeat(barLength - filledLength)}`;
      const label = block.showLabel ? (block.label ?? '') : '';
      const pct = block.showValue ? ` ${value}%` : '';
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: `${label}${label ? ' ' : ''}${bar}${pct}`,
              size: this.pxToHalfPoint(11),
              color: baseColor,
              font,
            }),
          ],
          spacing: { after: spacingAfter },
          alignment: AlignmentType.LEFT,
        }),
      ];
    }

    if (block.kind === 'divider') {
      const thickness = this.safePx(block.thickness, 1);
      return [
        new Paragraph({
          border: {
            bottom: {
              style: this.mapBorderStyle(
                (block.style as 'solid' | 'dashed' | 'dotted') ?? 'solid',
              ),
              size: Math.max(2, Math.round(thickness * 4)),
              color: this.toDocxColor(block.color, 'E2E8F0'),
            },
          },
          spacing: {
            before: this.pxToTwip(this.safePx(block.marginTop, 8)),
            after: this.pxToTwip(this.safePx(block.marginBottom, 8)),
          },
        }),
      ];
    }

    if (block.kind === 'image') {
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: '[Image]',
              size: this.pxToHalfPoint(10),
              color: '64748B',
              italics: true,
            }),
          ],
          spacing: { after: spacingAfter },
          alignment,
        }),
      ];
    }

    if (block.kind === 'link') {
      const label = block.label || block.url || '';
      if (!label) return [];
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: label,
              size: baseFontSize,
              color: this.toDocxColor(block.color, '2563EB'),
              underline: {},
            }),
          ],
          spacing: { after: spacingAfter },
          alignment,
        }),
      ];
    }

    if (block.kind === 'spacer') {
      return [
        new Paragraph({
          spacing: { after: this.pxToTwip(this.safePx(block.height, 16)) },
        }),
      ];
    }

    return [];
  }

  private canvasBlockText(block: CanvasBlock): string {
    if (block.kind === 'text') return this.stripHtml(block.content);
    if (block.kind === 'dualText') {
      return [
        this.stripHtml(block.leftContent),
        this.stripHtml(block.rightContent),
      ]
        .filter(Boolean)
        .join(' — ');
    }
    if (block.kind === 'date') {
      const end = block.current ? 'Present' : (block.endDate ?? '');
      return [block.startDate, end].filter(Boolean).join(' – ');
    }
    if (block.kind === 'tags') return (block.items ?? []).join(', ');
    if (block.kind === 'progress')
      return [
        block.label,
        typeof block.value === 'number' ? `${block.value}%` : '',
      ]
        .filter(Boolean)
        .join(' ');
    if (block.kind === 'link')
      return [block.label, block.url].filter(Boolean).join(' — ');
    return '';
  }

  private buildCanvasDocx(_title: string, c: CanvasContent): Document {
    const children: Array<Paragraph | Table> = [];
    const defaultFontFamily = c.style?.fontFamily;
    const defaultTextColor = c.style?.textColor;
    const pageWidthTwip = this.pxToTwip(this.safePx(c.style?.pageWidth, 794));
    const pagePaddingXTwip = this.pxToTwip(this.safePx(c.style?.pagePaddingX, 0));
    const pagePaddingYTwip = this.pxToTwip(this.safePx(c.style?.pagePaddingY, 0));
    const pageContentWidthTwip = Math.max(2000, pageWidthTwip - pagePaddingXTwip * 2);

    const visibleSections = (c.sections ?? []).filter(
      (section) => !section.hidden,
    );

    for (const section of visibleSections) {
      const totalWeight = Math.max(
        1,
        section.columns.reduce(
          (sum, col) => sum + Math.max(0.1, this.safePx(col.weight, 1)),
          0,
        ),
      );
      const borderWidth = Math.max(
        0,
        Math.round(this.safePx(section.border?.width, 0) * 4),
      );
      const borderColor = this.toDocxColor(section.border?.color, 'D1D5DB');
      const sectionPaddingXTwip = this.pxToTwip(this.safePx(section.paddingX, 40));
      const sectionGapTwip = this.pxToTwip(this.safePx(section.gap, 24));
      const totalGapTwip = Math.max(0, (section.columns.length - 1) * sectionGapTwip);
      const sectionInnerWidthTwip = Math.max(1200, pageContentWidthTwip - sectionPaddingXTwip * 2);
      const columnsUsableWidthTwip = Math.max(1000, sectionInnerWidthTwip - totalGapTwip);
      const columnWidthsTwip = section.columns.map((col) =>
        Math.max(
          300,
          Math.round(
            (Math.max(0.1, this.safePx(col.weight, 1)) / totalWeight) *
              columnsUsableWidthTwip,
          ),
        ),
      );

      const sectionRow = new TableRow({
        children: section.columns.map((column, index) => {
          const colWidthTwip = columnWidthsTwip[index] ?? 1000;
          const columnPaddingXTwip = this.pxToTwip(this.safePx(column.paddingX, 0));
          const inlineRowWidthTwip = Math.max(300, colWidthTwip - columnPaddingXTwip * 2);
          const rowItems = this.groupedRows(column.blocks ?? []);
          const cellChildren: Array<Paragraph | Table> = [];

          for (const row of rowItems) {
            if (row.blocks.length === 1) {
              const blockParagraphs = this.blockParagraphs(
                row.blocks[0],
                defaultFontFamily,
                defaultTextColor,
              );
              if (blockParagraphs.length) {
                cellChildren.push(...blockParagraphs);
              }
              continue;
            }

            const totalRowWidth = Math.max(
              1,
              row.blocks.reduce(
                (sum, block) =>
                  sum + Math.max(20, this.safePx(block.rowWidth, 100)),
                0,
              ),
            );

            const inlineTable = new Table({
              layout: TableLayoutType.FIXED,
              width: { size: inlineRowWidthTwip, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                insideHorizontal: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
                insideVertical: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
              },
              rows: [
                new TableRow({
                  children: row.blocks.map((block, blockIndex) => {
                    const blockWidthTwip = Math.max(
                      180,
                      Math.round(
                        (Math.max(20, this.safePx(block.rowWidth, 100)) /
                          totalRowWidth) *
                          inlineRowWidthTwip,
                      ),
                    );
                    const forceRight =
                      row.blocks.length > 1 &&
                      blockIndex === row.blocks.length - 1 &&
                      (block.kind === 'date' || block.kind === 'link') &&
                      (!block.align || block.align === 'left');
                    const paragraphs = this.blockParagraphs(
                      block,
                      defaultFontFamily,
                      defaultTextColor,
                      forceRight ? 'right' : undefined,
                    );
                    return new TableCell({
                      width: { size: blockWidthTwip, type: WidthType.DXA },
                      margins: {
                        left: blockIndex === 0 ? 0 : this.pxToTwip(3),
                        right: blockIndex === row.blocks.length - 1 ? 0 : this.pxToTwip(3),
                        top: 0,
                        bottom: 0,
                      },
                      children: paragraphs.length
                        ? paragraphs
                        : [new Paragraph({ text: '' })],
                    });
                  }),
                }),
              ],
            });

            cellChildren.push(inlineTable);
          }

          return new TableCell({
            width: { size: colWidthTwip, type: WidthType.DXA },
            margins: {
              top: this.pxToTwip(
                this.safePx(section.paddingY, 16) +
                  this.safePx(column.paddingY, 0),
              ),
              bottom: this.pxToTwip(
                this.safePx(section.paddingY, 16) +
                  this.safePx(column.paddingY, 0),
              ),
              left: this.pxToTwip(
                this.safePx(section.paddingX, 40) +
                  this.safePx(column.paddingX, 0) +
                  (index === 0 ? 0 : this.safePx(section.gap, 24) / 2),
              ),
              right: this.pxToTwip(
                this.safePx(section.paddingX, 40) +
                  this.safePx(column.paddingX, 0) +
                  (index === section.columns.length - 1
                    ? 0
                    : this.safePx(section.gap, 24) / 2),
              ),
            },
            shading: {
              fill: this.toDocxColor(
                column.background ?? section.background,
                'FFFFFF',
              ),
            },
            borders: {
              top: {
                style:
                  borderWidth > 0
                    ? this.mapBorderStyle(section.border?.style)
                    : BorderStyle.NONE,
                size: borderWidth,
                color: borderColor,
              },
              right: {
                style:
                  borderWidth > 0
                    ? this.mapBorderStyle(section.border?.style)
                    : BorderStyle.NONE,
                size: borderWidth,
                color: borderColor,
              },
              bottom: {
                style:
                  borderWidth > 0
                    ? this.mapBorderStyle(section.border?.style)
                    : BorderStyle.NONE,
                size: borderWidth,
                color: borderColor,
              },
              left: {
                style:
                  borderWidth > 0
                    ? this.mapBorderStyle(section.border?.style)
                    : BorderStyle.NONE,
                size: borderWidth,
                color: borderColor,
              },
            },
            children: cellChildren.length
              ? cellChildren
              : [new Paragraph({ text: '' })],
          });
        }),
      });

      children.push(
        new Table({
          layout: TableLayoutType.FIXED,
          width: { size: sectionInnerWidthTwip, type: WidthType.DXA },
          columnWidths: columnWidthsTwip,
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideHorizontal: {
              style: BorderStyle.NONE,
              size: 0,
              color: 'FFFFFF',
            },
            insideVertical: {
              style: BorderStyle.NONE,
              size: 0,
              color: 'FFFFFF',
            },
          },
          rows: [sectionRow],
        }),
      );

      children.push(new Paragraph({ spacing: { after: this.pxToTwip(6) } }));
    }

    return new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: pagePaddingYTwip,
                right: pagePaddingXTwip,
                bottom: pagePaddingYTwip,
                left: pagePaddingXTwip,
                header: 0,
                footer: 0,
                gutter: 0,
              },
            },
          },
          children,
        },
      ],
    });
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
    if (c.personal?.title) {
      children.push(p(c.personal.title, { size: 24, spacing: 40 }));
    }

    const contact = [
      c.personal?.email,
      c.personal?.phone,
      c.personal?.location,
      c.personal?.website,
    ]
      .filter(Boolean)
      .join('  |  ');
    if (contact) {
      children.push(p(contact, { size: 20, spacing: 160 }));
    }

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
        if (exp.location) {
          children.push(p(exp.location, { size: 20, spacing: 40 }));
        }
        if (exp.description) {
          children.push(p(this.stripHtml(exp.description), { spacing: 120 }));
        }
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
      children.push(p('Skills', { heading: HeadingLevel.HEADING_2, spacing: 80 }));
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
        if (proj.description) {
          children.push(p(this.stripHtml(proj.description), { spacing: 40 }));
        }
        if (proj.url) {
          children.push(p(proj.url, { size: 20, spacing: 40 }));
        }
      }
    }

    if (c.certifications?.length) {
      children.push(
        p('Certifications', { heading: HeadingLevel.HEADING_2, spacing: 80 }),
      );
      for (const cert of c.certifications) {
        children.push(
          p(
            [cert.name, cert.issuer && `— ${cert.issuer}`, cert.date]
              .filter(Boolean)
              .join(' '),
            { spacing: 60 },
          ),
        );
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
