import { create } from 'zustand'
import { ulid } from 'ulid'
import type {
  CanvasDocument,
  CanvasSection,
  CanvasColumn,
  CanvasBlock,
  CanvasStyle,
} from '@binh-tran/shared'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newId() {
  return ulid().toLowerCase()
}

export function makeTextBlock(overrides?: Partial<import('@binh-tran/shared').TextBlock>): import('@binh-tran/shared').TextBlock {
  return {
    kind: 'text',
    id: newId(),
    content: '',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontStyle: 'normal',
    color: { hex: '#111111', opacity: 1 },
    align: 'left',
    lineHeight: 1.5,
    letterSpacing: 0,
    marginBottom: 4,
    textTransform: 'none',
    ...overrides,
  }
}

export function makeDateBlock(overrides?: Partial<import('@binh-tran/shared').DateBlock>): import('@binh-tran/shared').DateBlock {
  return {
    kind: 'date',
    id: newId(),
    startDate: '',
    current: false,
    format: 'MMM YYYY',
    fontSize: 12,
    color: { hex: '#666666', opacity: 1 },
    align: 'left',
    marginBottom: 4,
    ...overrides,
  }
}

export function makeTagBlock(overrides?: Partial<import('@binh-tran/shared').TagBlock>): import('@binh-tran/shared').TagBlock {
  return {
    kind: 'tags',
    id: newId(),
    items: [],
    chipBackground: { hex: '#e2e8f0', opacity: 1 },
    chipColor: { hex: '#1e293b', opacity: 1 },
    chipRadius: 4,
    fontSize: 11,
    gap: 6,
    marginBottom: 8,
    ...overrides,
  }
}

export function makeDividerBlock(overrides?: Partial<import('@binh-tran/shared').DividerBlock>): import('@binh-tran/shared').DividerBlock {
  return {
    kind: 'divider',
    id: newId(),
    color: { hex: '#e2e8f0', opacity: 1 },
    thickness: 1,
    style: 'solid',
    marginTop: 8,
    marginBottom: 8,
    ...overrides,
  }
}

export function makeSpacerBlock(): import('@binh-tran/shared').SpacerBlock {
  return { kind: 'spacer', id: newId(), height: 16 }
}

export function makeProgressBlock(): import('@binh-tran/shared').ProgressBlock {
  return {
    kind: 'progress',
    id: newId(),
    label: '',
    value: 80,
    trackColor: { hex: '#e2e8f0', opacity: 1 },
    fillColor: { hex: '#2563eb', opacity: 1 },
    height: 6,
    showLabel: true,
    showValue: false,
    marginBottom: 8,
  }
}

export function makeImageBlock(): import('@binh-tran/shared').ImageBlock {
  return {
    kind: 'image',
    id: newId(),
    url: '',
    width: 80,
    height: 80,
    radius: 50,
    align: 'left',
    marginBottom: 12,
  }
}

export function makeLinkBlock(): import('@binh-tran/shared').LinkBlock {
  return {
    kind: 'link',
    id: newId(),
    label: '',
    url: '',
    fontSize: 12,
    color: { hex: '#2563eb', opacity: 1 },
    marginBottom: 4,
  }
}

export function makeColumn(overrides?: Partial<CanvasColumn>): CanvasColumn {
  return {
    id: newId(),
    weight: 1,
    paddingX: 0,
    paddingY: 0,
    blocks: [],
    ...overrides,
  }
}

export function makeSection(label: string, columns = 1): CanvasSection {
  return {
    id: newId(),
    label,
    hidden: false,
    paddingX: 40,
    paddingY: 16,
    gap: 24,
    columns: Array.from({ length: columns }, () => makeColumn()),
  }
}

export const DEFAULT_STYLE: CanvasStyle = {
  pageWidth: 794,
  pageBackground: { hex: '#ffffff', opacity: 1 },
  pagePaddingX: 0,
  pagePaddingY: 0,
  fontFamily: 'Inter',
  baseFontSize: 14,
  primaryColor: { hex: '#1e3a5f', opacity: 1 },
  accentColor: { hex: '#2563eb', opacity: 1 },
  textColor: { hex: '#111111', opacity: 1 },
  mutedColor: { hex: '#6b7280', opacity: 1 },
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface CanvasStore {
  doc: CanvasDocument | null
  selectedSectionId: string | null
  selectedColumnId: string | null
  selectedBlockId: string | null
  editingBlockId: string | null
  isDirty: boolean

  // Lifecycle
  load: (doc: CanvasDocument) => void
  reset: () => void
  markSaved: () => void

  // Style
  setStyle: (patch: Partial<CanvasStyle>) => void

  // Sections
  addSection: (label?: string, columns?: number) => void
  removeSection: (sectionId: string) => void
  updateSection: (sectionId: string, patch: Partial<Omit<CanvasSection, 'id' | 'columns'>>) => void
  moveSection: (sectionId: string, direction: 'up' | 'down') => void
  reorderSections: (newIds: string[]) => void
  selectSection: (sectionId: string | null) => void
  setSectionColumns: (sectionId: string, count: 1 | 2 | 3) => void
  toggleSectionHidden: (sectionId: string) => void

  // Blocks
  addBlock: (sectionId: string, columnId: string, block: CanvasBlock) => void
  removeBlock: (sectionId: string, columnId: string, blockId: string) => void
  updateBlock: (sectionId: string, columnId: string, blockId: string, patch: Partial<CanvasBlock>) => void
  moveBlock: (sectionId: string, columnId: string, blockId: string, direction: 'up' | 'down') => void
  reorderBlocks: (sectionId: string, columnId: string, newIds: string[]) => void
  selectBlock: (sectionId: string | null, columnId: string | null, blockId: string | null) => void
  setEditingBlock: (blockId: string | null) => void
  duplicateBlock: (sectionId: string, columnId: string, blockId: string) => void

  // Columns
  updateColumn: (sectionId: string, columnId: string, patch: Partial<Omit<CanvasColumn, 'id' | 'blocks'>>) => void
}

function mutate(
  doc: CanvasDocument,
  sectionId: string,
  fn: (s: CanvasSection) => CanvasSection
): CanvasDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  }
}

function mutateCol(
  doc: CanvasDocument,
  sectionId: string,
  columnId: string,
  fn: (c: CanvasColumn) => CanvasColumn
): CanvasDocument {
  return mutate(doc, sectionId, (s) => ({
    ...s,
    columns: s.columns.map((c) => (c.id === columnId ? fn(c) : c)),
  }))
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  doc: null,
  selectedSectionId: null,
  selectedColumnId: null,
  selectedBlockId: null,
  editingBlockId: null,
  isDirty: false,

  load: (doc) => set({ doc, isDirty: false, selectedSectionId: null, selectedBlockId: null, editingBlockId: null }),
  reset: () => set({ doc: null, isDirty: false }),
  markSaved: () => set({ isDirty: false }),

  setStyle: (patch) =>
    set((s) => ({
      doc: s.doc ? { ...s.doc, style: { ...s.doc.style, ...patch } } : s.doc,
      isDirty: true,
    })),

  addSection: (label = 'New Section', columns = 1) =>
    set((s) => ({
      doc: s.doc
        ? { ...s.doc, sections: [...s.doc.sections, makeSection(label, columns)] }
        : s.doc,
      isDirty: true,
    })),

  removeSection: (sectionId) =>
    set((s) => ({
      doc: s.doc
        ? { ...s.doc, sections: s.doc.sections.filter((sec) => sec.id !== sectionId) }
        : s.doc,
      selectedSectionId: s.selectedSectionId === sectionId ? null : s.selectedSectionId,
      isDirty: true,
    })),

  updateSection: (sectionId, patch) =>
    set((s) => ({
      doc: s.doc ? mutate(s.doc, sectionId, (sec) => ({ ...sec, ...patch })) : s.doc,
      isDirty: true,
    })),

  moveSection: (sectionId, direction) =>
    set((s) => {
      if (!s.doc) return s
      const idx = s.doc.sections.findIndex((sec) => sec.id === sectionId)
      if (idx < 0) return s
      const arr = [...s.doc.sections]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return s
      ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
      return { doc: { ...s.doc, sections: arr }, isDirty: true }
    }),

  reorderSections: (newIds) =>
    set((s) => {
      if (!s.doc) return s
      const map = new Map(s.doc.sections.map((sec) => [sec.id, sec]))
      const reordered = newIds.map((id) => map.get(id)).filter(Boolean) as CanvasSection[]
      return { doc: { ...s.doc, sections: reordered }, isDirty: true }
    }),

  selectSection: (sectionId) =>
    set({ selectedSectionId: sectionId, selectedBlockId: null, selectedColumnId: null }),

  setSectionColumns: (sectionId, count) =>
    set((s) => {
      if (!s.doc) return s
      const sec = s.doc.sections.find((sec) => sec.id === sectionId)
      if (!sec) return s
      const current = sec.columns
      let nextCols: CanvasColumn[]
      if (count > current.length) {
        nextCols = [...current, ...Array.from({ length: count - current.length }, () => makeColumn())]
      } else {
        // merge extra columns' blocks into last kept column
        const kept = current.slice(0, count - 1)
        const merged = makeColumn()
        merged.blocks = current.slice(count - 1).flatMap((c) => c.blocks)
        nextCols = [...kept, merged]
      }
      return {
        doc: mutate(s.doc, sectionId, (sec) => ({ ...sec, columns: nextCols })),
        isDirty: true,
      }
    }),

  toggleSectionHidden: (sectionId) =>
    set((s) => ({
      doc: s.doc
        ? mutate(s.doc, sectionId, (sec) => ({ ...sec, hidden: !sec.hidden }))
        : s.doc,
      isDirty: true,
    })),

  addBlock: (sectionId, columnId, block) =>
    set((s) => ({
      doc: s.doc
        ? mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: [...c.blocks, block] }))
        : s.doc,
      isDirty: true,
    })),

  removeBlock: (sectionId, columnId, blockId) =>
    set((s) => ({
      doc: s.doc
        ? mutateCol(s.doc, sectionId, columnId, (c) => ({
            ...c,
            blocks: c.blocks.filter((b) => b.id !== blockId),
          }))
        : s.doc,
      selectedBlockId: s.selectedBlockId === blockId ? null : s.selectedBlockId,
      isDirty: true,
    })),

  updateBlock: (sectionId, columnId, blockId, patch) =>
    set((s) => ({
      doc: s.doc
        ? mutateCol(s.doc, sectionId, columnId, (c) => ({
            ...c,
            blocks: c.blocks.map((b) =>
              b.id === blockId ? ({ ...b, ...patch } as CanvasBlock) : b
            ),
          }))
        : s.doc,
      isDirty: true,
    })),

  moveBlock: (sectionId, columnId, blockId, direction) =>
    set((s) => {
      if (!s.doc) return s
      const sec = s.doc.sections.find((sec) => sec.id === sectionId)
      const col = sec?.columns.find((c) => c.id === columnId)
      if (!col) return s
      const idx = col.blocks.findIndex((b) => b.id === blockId)
      if (idx < 0) return s
      const arr = [...col.blocks]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return s
      ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
      return {
        doc: mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: arr })),
        isDirty: true,
      }
    }),

  reorderBlocks: (sectionId, columnId, newIds) =>
    set((s) => {
      if (!s.doc) return s
      const sec = s.doc.sections.find((sec) => sec.id === sectionId)
      const col = sec?.columns.find((c) => c.id === columnId)
      if (!col) return s
      const map = new Map(col.blocks.map((b) => [b.id, b]))
      const reordered = newIds.map((id) => map.get(id)).filter(Boolean) as CanvasBlock[]
      return {
        doc: mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: reordered })),
        isDirty: true,
      }
    }),

  setEditingBlock: (blockId) => set({ editingBlockId: blockId }),

  duplicateBlock: (sectionId, columnId, blockId) =>
    set((s) => {
      if (!s.doc) return s
      const sec = s.doc.sections.find((sec) => sec.id === sectionId)
      const col = sec?.columns.find((c) => c.id === columnId)
      if (!col) return s
      const idx = col.blocks.findIndex((b) => b.id === blockId)
      if (idx < 0) return s
      const clone = { ...col.blocks[idx], id: newId() } as CanvasBlock
      const arr = [...col.blocks]
      arr.splice(idx + 1, 0, clone)
      return {
        doc: mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: arr })),
        isDirty: true,
      }
    }),

  selectBlock: (sectionId, columnId, blockId) =>
    set({ selectedSectionId: sectionId, selectedColumnId: columnId, selectedBlockId: blockId }),

  updateColumn: (sectionId, columnId, patch) =>
    set((s) => ({
      doc: s.doc
        ? mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, ...patch }))
        : s.doc,
      isDirty: true,
    })),
}))
