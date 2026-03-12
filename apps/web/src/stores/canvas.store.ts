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
    rowWidth: 100,
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
    rowWidth: 100,
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
    rowWidth: 100,
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
    rowWidth: 100,
    ...overrides,
  }
}

export function makeSpacerBlock(): import('@binh-tran/shared').SpacerBlock {
  return { kind: 'spacer', id: newId(), height: 16, rowWidth: 100 }
}

export function makeRatingBlock(): import('@binh-tran/shared').RatingBlock {
  return {
    kind: 'rating',
    id: newId(),
    label: 'Skill',
    value: 4,
    maxValue: 5,
    style: 'stars',
    color: { hex: '#facc15', opacity: 1 },
    emptyColor: { hex: '#e5e7eb', opacity: 1 },
    size: 16,
    marginBottom: 8,
    rowWidth: 100,
  }
}

export function makeTimelineBlock(): import('@binh-tran/shared').TimelineBlock {
  return {
    kind: 'timeline',
    id: newId(),
    entries: [],
    dotColor: { hex: '#2563eb', opacity: 1 },
    lineColor: { hex: '#e5e7eb', opacity: 1 },
    dotSize: 8,
    lineWidth: 2,
    spacing: 16,
    marginBottom: 12,
    rowWidth: 100,
  }
}

export function makeBadgeBlock(): import('@binh-tran/shared').BadgeBlock {
  return {
    kind: 'badge',
    id: newId(),
    text: 'Badge',
    backgroundColor: { hex: '#3b82f6', opacity: 1 },
    textColor: { hex: '#ffffff', opacity: 1 },
    borderRadius: 4,
    padding: { x: 8, y: 4 },
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    rowWidth: 100,
  }
}

export function makeStatBlock(): import('@binh-tran/shared').StatBlock {
  return {
    kind: 'stat',
    id: newId(),
    value: '10+',
    label: 'Years',
    valueSize: 32,
    labelSize: 12,
    valueColor: { hex: '#111111', opacity: 1 },
    labelColor: { hex: '#6b7280', opacity: 1 },
    align: 'center',
    marginBottom: 12,
    rowWidth: 100,
  }
}

export function makeCardBlock(): import('@binh-tran/shared').CardBlock {
  return {
    kind: 'card',
    id: newId(),
    title: 'Project Title',
    subtitle: '',
    description: 'Project description goes here',
    imageUrl: '',
    tags: [],
    backgroundColor: { hex: '#f9fafb', opacity: 1 },
    borderColor: { hex: '#e5e7eb', opacity: 1 },
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    rowWidth: 100,
  }
}

export function makeSocialLinksBlock(): import('@binh-tran/shared').SocialLinksBlock {
  return {
    kind: 'socialLinks',
    id: newId(),
    links: [],
    layout: 'horizontal',
    iconSize: 20,
    gap: 12,
    showLabels: false,
    color: { hex: '#3b82f6', opacity: 1 },
    marginBottom: 12,
    rowWidth: 100,
  }
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
    rowWidth: 100,
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
    rowWidth: 100,
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
    rowWidth: 100,
  }
}

export function makeDualTextBlock(overrides?: Partial<import('@binh-tran/shared').DualTextBlock>): import('@binh-tran/shared').DualTextBlock {
  return {
    kind: 'dualText',
    id: newId(),
    leftContent: '<strong>Title</strong>',
    rightContent: 'Jan 2020 – Present',
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 1.4,
    letterSpacing: 0,
    color: { hex: '#111111', opacity: 1 },
    rightFontWeight: '400',
    rightColor: { hex: '#6b7280', opacity: 1 },
    gap: 12,
    marginBottom: 4,
    rowWidth: 100,
    ...overrides,
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
  forceBackground: { hex: '#ffffff', opacity: 1 },
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

// Split into two stores for better performance:
// 1. Document store - holds the actual document data
// 2. UI store - holds selection/editing state

interface CanvasDocStore {
  doc: CanvasDocument | null
  isDirty: boolean

  // History
  past: CanvasDocument[]
  future: CanvasDocument[]
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

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
  setSectionColumns: (sectionId: string, count: 1 | 2 | 3) => void
  toggleSectionHidden: (sectionId: string) => void

  // Blocks
  addBlock: (sectionId: string, columnId: string, block: CanvasBlock) => void
  removeBlock: (sectionId: string, columnId: string, blockId: string) => void
  updateBlock: (sectionId: string, columnId: string, blockId: string, patch: Partial<CanvasBlock>) => void
  moveBlock: (sectionId: string, columnId: string, blockId: string, direction: 'up' | 'down') => void
  reorderBlocks: (sectionId: string, columnId: string, newIds: string[]) => void
  transferBlock: (
    fromSectionId: string,
    fromColumnId: string,
    blockId: string,
    toSectionId: string,
    toColumnId: string,
    atIndex: number,
  ) => void
  duplicateBlock: (sectionId: string, columnId: string, blockId: string) => void
  bulkDeleteBlocks: (sectionId: string, columnId: string, blockIds: string[]) => void
  bulkDuplicateBlocks: (sectionId: string, columnId: string, blockIds: string[]) => void

  // Columns
  updateColumn: (sectionId: string, columnId: string, patch: Partial<Omit<CanvasColumn, 'id' | 'blocks'>>) => void
}

interface CanvasUIStore {
  selectedSectionId: string | null
  selectedColumnId: string | null
  selectedBlockId: string | null
  selectedBlockIds: string[] // Multi-select support
  editingBlockId: string | null

  selectSection: (sectionId: string | null) => void
  selectBlock: (sectionId: string | null, columnId: string | null, blockId: string | null) => void
  toggleBlockSelection: (sectionId: string, columnId: string, blockId: string) => void
  selectBlockRange: (sectionId: string, columnId: string, startBlockId: string, endBlockId: string) => void
  clearSelection: () => void
  setEditingBlock: (blockId: string | null) => void
}

interface CanvasStore {
  doc: CanvasDocument | null
  selectedSectionId: string | null
  selectedColumnId: string | null
  selectedBlockId: string | null
  selectedBlockIds: string[] // Multi-select support
  editingBlockId: string | null
  isDirty: boolean

  // History
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

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
  transferBlock: (
    fromSectionId: string,
    fromColumnId: string,
    blockId: string,
    toSectionId: string,
    toColumnId: string,
    atIndex: number,
  ) => void
  selectBlock: (sectionId: string | null, columnId: string | null, blockId: string | null) => void
  toggleBlockSelection: (sectionId: string, columnId: string, blockId: string) => void
  selectBlockRange: (sectionId: string, columnId: string, startBlockId: string, endBlockId: string) => void
  clearSelection: () => void
  setEditingBlock: (blockId: string | null) => void
  duplicateBlock: (sectionId: string, columnId: string, blockId: string) => void
  bulkDeleteBlocks: (sectionId: string, columnId: string, blockIds: string[]) => void
  bulkDuplicateBlocks: (sectionId: string, columnId: string, blockIds: string[]) => void

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

// Helper to add state to history (max 50 items)
function pushHistory(state: { doc: CanvasDocument | null; past: CanvasDocument[]; future: CanvasDocument[] }) {
  if (!state.doc) return state

  const newPast = [...state.past, state.doc]
  // Keep only last 50 items
  if (newPast.length > 50) {
    newPast.shift()
  }

  return {
    ...state,
    past: newPast,
    future: [], // Clear future on new action
  }
}

export const useCanvasDocStore = create<CanvasDocStore>((set, get) => ({
  doc: null,
  isDirty: false,
  past: [],
  future: [],

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: () => {
    const { doc, past, future } = get()
    if (past.length === 0 || !doc) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, -1)

    set({
      doc: previous,
      past: newPast,
      future: [doc, ...future],
      isDirty: true,
    })
  },

  redo: () => {
    const { doc, past, future } = get()
    if (future.length === 0 || !doc) return

    const next = future[0]
    const newFuture = future.slice(1)

    set({
      doc: next,
      past: [...past, doc],
      future: newFuture,
      isDirty: true,
    })
  },

  load: (doc) => set({ doc, isDirty: false, past: [], future: [] }),
  reset: () => set({ doc: null, isDirty: false, past: [], future: [] }),
  markSaved: () => set({ isDirty: false }),

  setStyle: (patch) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc ? { ...s.doc, style: { ...s.doc.style, ...patch } } : s.doc,
        isDirty: true,
      }
    }),

  addSection: (label = 'New Section', columns = 1) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc
          ? { ...s.doc, sections: [...s.doc.sections, makeSection(label, columns)] }
          : s.doc,
        isDirty: true,
      }
    }),

  removeSection: (sectionId) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc
          ? { ...s.doc, sections: s.doc.sections.filter((sec) => sec.id !== sectionId) }
          : s.doc,
        isDirty: true,
      }
    }),

  updateSection: (sectionId, patch) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc ? mutate(s.doc, sectionId, (sec) => ({ ...sec, ...patch })) : s.doc,
        isDirty: true,
      }
    }),

  moveSection: (sectionId, direction) =>
    set((s) => {
      if (!s.doc) return s
      const idx = s.doc.sections.findIndex((sec) => sec.id === sectionId)
      if (idx < 0) return s
      const arr = [...s.doc.sections]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return s
      ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
      const updated = pushHistory(s)
      return { ...updated, doc: { ...s.doc, sections: arr }, isDirty: true }
    }),

  reorderSections: (newIds) =>
    set((s) => {
      if (!s.doc) return s
      const map = new Map(s.doc.sections.map((sec) => [sec.id, sec]))
      const reordered = newIds.map((id) => map.get(id)).filter(Boolean) as CanvasSection[]
      const updated = pushHistory(s)
      return { ...updated, doc: { ...s.doc, sections: reordered }, isDirty: true }
    }),

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
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: mutate(s.doc, sectionId, (sec) => ({ ...sec, columns: nextCols })),
        isDirty: true,
      }
    }),

  toggleSectionHidden: (sectionId) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc
          ? mutate(s.doc, sectionId, (sec) => ({ ...sec, hidden: !sec.hidden }))
          : s.doc,
        isDirty: true,
      }
    }),

  addBlock: (sectionId, columnId, block) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc
          ? mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: [...c.blocks, block] }))
          : s.doc,
        isDirty: true,
      }
    }),

  removeBlock: (sectionId, columnId, blockId) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc
          ? mutateCol(s.doc, sectionId, columnId, (c) => ({
              ...c,
              blocks: c.blocks.filter((b) => b.id !== blockId),
            }))
          : s.doc,
        isDirty: true,
      }
    }),

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
      const updated = pushHistory(s)
      return {
        ...updated,
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
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: reordered })),
        isDirty: true,
      }
    }),

  transferBlock: (fromSectionId, fromColumnId, blockId, toSectionId, toColumnId, atIndex) =>
    set((s) => {
      if (!s.doc) return s

      let movingBlock: CanvasBlock | null = null
      const withoutSource = mutateCol(s.doc, fromSectionId, fromColumnId, (c) => {
        movingBlock = c.blocks.find((b) => b.id === blockId) ?? null
        return { ...c, blocks: c.blocks.filter((b) => b.id !== blockId) }
      })

      if (!movingBlock) return s

      const withTarget = mutateCol(withoutSource, toSectionId, toColumnId, (c) => {
        const blocks = [...c.blocks]
        const targetIndex = Math.max(0, Math.min(atIndex, blocks.length))
        blocks.splice(targetIndex, 0, movingBlock as CanvasBlock)
        return { ...c, blocks }
      })

      const updated = pushHistory(s)
      return {
        ...updated,
        doc: withTarget,
        isDirty: true,
      }
    }),

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
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: arr })),
        isDirty: true,
      }
    }),

  bulkDeleteBlocks: (sectionId: string, columnId: string, blockIds: string[]) =>
    set((s) => {
      const updated = pushHistory(s)
      return {
        ...updated,
        doc: s.doc
          ? mutateCol(s.doc, sectionId, columnId, (c) => ({
              ...c,
              blocks: c.blocks.filter((b) => !blockIds.includes(b.id)),
            }))
          : s.doc,
        isDirty: true,
      }
    }),

  bulkDuplicateBlocks: (sectionId: string, columnId: string, blockIds: string[]) =>
    set((s) => {
      if (!s.doc) return s
      const sec = s.doc.sections.find((sec) => sec.id === sectionId)
      const col = sec?.columns.find((c) => c.id === columnId)
      if (!col) return s

      const arr = [...col.blocks]
      const insertions: { idx: number; block: CanvasBlock }[] = []

      // Collect all blocks to duplicate
      blockIds.forEach(blockId => {
        const idx = arr.findIndex((b) => b.id === blockId)
        if (idx >= 0) {
          const clone = { ...arr[idx], id: newId() } as CanvasBlock
          insertions.push({ idx: idx + 1, block: clone })
        }
      })

      // Insert in reverse order to maintain correct positions
      insertions.reverse().forEach(({ idx, block }) => {
        arr.splice(idx, 0, block)
      })

      const updated = pushHistory(s)
      return {
        ...updated,
        doc: mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, blocks: arr })),
        isDirty: true,
      }
    }),

  updateColumn: (sectionId, columnId, patch) =>
    set((s) => ({
      doc: s.doc
        ? mutateCol(s.doc, sectionId, columnId, (c) => ({ ...c, ...patch }))
        : s.doc,
      isDirty: true,
    })),
}))

export const useCanvasUIStore = create<CanvasUIStore>((set) => ({
  selectedSectionId: null,
  selectedColumnId: null,
  selectedBlockId: null,
  selectedBlockIds: [],
  editingBlockId: null,

  selectSection: (sectionId) =>
    set({ selectedSectionId: sectionId, selectedBlockId: null, selectedBlockIds: [], selectedColumnId: null }),

  selectBlock: (sectionId, columnId, blockId) =>
    set({
      selectedSectionId: sectionId,
      selectedColumnId: columnId,
      selectedBlockId: blockId,
      selectedBlockIds: blockId ? [blockId] : [],
    }),

  toggleBlockSelection: (sectionId, columnId, blockId) =>
    set((state) => {
      const currentIds = state.selectedBlockIds
      const isSelected = currentIds.includes(blockId)

      if (isSelected) {
        const newIds = currentIds.filter(id => id !== blockId)
        return {
          selectedSectionId: sectionId,
          selectedColumnId: columnId,
          selectedBlockIds: newIds,
          selectedBlockId: newIds.length === 1 ? newIds[0] : null,
        }
      } else {
        const newIds = [...currentIds, blockId]
        return {
          selectedSectionId: sectionId,
          selectedColumnId: columnId,
          selectedBlockIds: newIds,
          selectedBlockId: newIds.length === 1 ? newIds[0] : null,
        }
      }
    }),

  selectBlockRange: (sectionId, columnId, startBlockId, endBlockId) =>
    set((state) => {
      // Get blocks from the doc store
      const docStore = useCanvasDocStore.getState()
      const section = docStore.doc?.sections.find(s => s.id === sectionId)
      const column = section?.columns.find(c => c.id === columnId)
      if (!column) return state

      const startIdx = column.blocks.findIndex(b => b.id === startBlockId)
      const endIdx = column.blocks.findIndex(b => b.id === endBlockId)

      if (startIdx === -1 || endIdx === -1) return state

      const [minIdx, maxIdx] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
      const rangeBlockIds = column.blocks.slice(minIdx, maxIdx + 1).map(b => b.id)

      return {
        selectedSectionId: sectionId,
        selectedColumnId: columnId,
        selectedBlockIds: rangeBlockIds,
        selectedBlockId: rangeBlockIds.length === 1 ? rangeBlockIds[0] : null,
      }
    }),

  clearSelection: () =>
    set({ selectedBlockId: null, selectedBlockIds: [], selectedSectionId: null, selectedColumnId: null }),

  setEditingBlock: (blockId) => set({ editingBlockId: blockId }),
}))

// Legacy unified store for backwards compatibility
export const useCanvasStore = create<CanvasStore>((set) => ({
  doc: null,
  selectedSectionId: null,
  selectedColumnId: null,
  selectedBlockId: null,
  selectedBlockIds: [],
  editingBlockId: null,
  isDirty: false,

  undo: () => {
    useCanvasDocStore.getState().undo()
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  redo: () => {
    useCanvasDocStore.getState().redo()
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  canUndo: () => useCanvasDocStore.getState().canUndo(),
  canRedo: () => useCanvasDocStore.getState().canRedo(),

  load: (doc) => {
    useCanvasDocStore.getState().load(doc)
    set({ doc, isDirty: false, selectedSectionId: null, selectedBlockId: null, selectedBlockIds: [], selectedColumnId: null, editingBlockId: null })
  },
  reset: () => {
    useCanvasDocStore.getState().reset()
    set({ doc: null, isDirty: false })
  },
  markSaved: () => {
    useCanvasDocStore.getState().markSaved()
    set({ isDirty: false })
  },

  setStyle: (patch) => {
    useCanvasDocStore.getState().setStyle(patch)
    set((s) => ({
      doc: s.doc ? { ...s.doc, style: { ...s.doc.style, ...patch } } : s.doc,
      isDirty: true,
    }))
  },

  addSection: (label, columns) => {
    useCanvasDocStore.getState().addSection(label, columns)
    set(() => ({
      doc: useCanvasDocStore.getState().doc,
      isDirty: true,
    }))
  },

  removeSection: (sectionId) => {
    useCanvasDocStore.getState().removeSection(sectionId)
    set((s) => ({
      doc: useCanvasDocStore.getState().doc,
      selectedSectionId: s.selectedSectionId === sectionId ? null : s.selectedSectionId,
      isDirty: true,
    }))
  },

  updateSection: (sectionId, patch) => {
    useCanvasDocStore.getState().updateSection(sectionId, patch)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  moveSection: (sectionId, direction) => {
    useCanvasDocStore.getState().moveSection(sectionId, direction)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  reorderSections: (newIds) => {
    useCanvasDocStore.getState().reorderSections(newIds)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  selectSection: (sectionId) => {
    useCanvasUIStore.getState().selectSection(sectionId)
    set({ selectedSectionId: sectionId, selectedBlockId: null, selectedColumnId: null })
  },

  setSectionColumns: (sectionId, count) => {
    useCanvasDocStore.getState().setSectionColumns(sectionId, count)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  toggleSectionHidden: (sectionId) => {
    useCanvasDocStore.getState().toggleSectionHidden(sectionId)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  addBlock: (sectionId, columnId, block) => {
    useCanvasDocStore.getState().addBlock(sectionId, columnId, block)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  removeBlock: (sectionId, columnId, blockId) => {
    useCanvasDocStore.getState().removeBlock(sectionId, columnId, blockId)
    set((s) => ({
      doc: useCanvasDocStore.getState().doc,
      selectedBlockId: s.selectedBlockId === blockId ? null : s.selectedBlockId,
      isDirty: true,
    }))
  },

  updateBlock: (sectionId, columnId, blockId, patch) => {
    useCanvasDocStore.getState().updateBlock(sectionId, columnId, blockId, patch)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  moveBlock: (sectionId, columnId, blockId, direction) => {
    useCanvasDocStore.getState().moveBlock(sectionId, columnId, blockId, direction)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  reorderBlocks: (sectionId, columnId, newIds) => {
    useCanvasDocStore.getState().reorderBlocks(sectionId, columnId, newIds)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  transferBlock: (fromSectionId, fromColumnId, blockId, toSectionId, toColumnId, atIndex) => {
    useCanvasDocStore.getState().transferBlock(fromSectionId, fromColumnId, blockId, toSectionId, toColumnId, atIndex)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  selectBlock: (sectionId, columnId, blockId) => {
    useCanvasUIStore.getState().selectBlock(sectionId, columnId, blockId)
    set({
      selectedSectionId: sectionId,
      selectedColumnId: columnId,
      selectedBlockId: blockId,
      selectedBlockIds: blockId ? [blockId] : [],
    })
  },

  toggleBlockSelection: (sectionId, columnId, blockId) => {
    useCanvasUIStore.getState().toggleBlockSelection(sectionId, columnId, blockId)
    const uiState = useCanvasUIStore.getState()
    set({
      selectedSectionId: uiState.selectedSectionId,
      selectedColumnId: uiState.selectedColumnId,
      selectedBlockId: uiState.selectedBlockId,
      selectedBlockIds: uiState.selectedBlockIds,
    })
  },

  selectBlockRange: (sectionId, columnId, startBlockId, endBlockId) => {
    useCanvasUIStore.getState().selectBlockRange(sectionId, columnId, startBlockId, endBlockId)
    const uiState = useCanvasUIStore.getState()
    set({
      selectedSectionId: uiState.selectedSectionId,
      selectedColumnId: uiState.selectedColumnId,
      selectedBlockId: uiState.selectedBlockId,
      selectedBlockIds: uiState.selectedBlockIds,
    })
  },

  clearSelection: () => {
    useCanvasUIStore.getState().clearSelection()
    set({ selectedBlockId: null, selectedBlockIds: [], selectedSectionId: null, selectedColumnId: null })
  },

  setEditingBlock: (blockId) => {
    useCanvasUIStore.getState().setEditingBlock(blockId)
    set({ editingBlockId: blockId })
  },

  duplicateBlock: (sectionId, columnId, blockId) => {
    useCanvasDocStore.getState().duplicateBlock(sectionId, columnId, blockId)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  bulkDeleteBlocks: (sectionId, columnId, blockIds) => {
    useCanvasDocStore.getState().bulkDeleteBlocks(sectionId, columnId, blockIds)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  bulkDuplicateBlocks: (sectionId, columnId, blockIds) => {
    useCanvasDocStore.getState().bulkDuplicateBlocks(sectionId, columnId, blockIds)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },

  updateColumn: (sectionId, columnId, patch) => {
    useCanvasDocStore.getState().updateColumn(sectionId, columnId, patch)
    set({ doc: useCanvasDocStore.getState().doc, isDirty: true })
  },
}))
