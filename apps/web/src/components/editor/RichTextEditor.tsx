import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Type,
  Palette,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FONT_FAMILIES } from '@binh-tran/shared'

type RichTextEditorProps = {
  content: string
  onSave: (html: string) => void
  isAdmin?: boolean
  className?: string
  placeholder?: string
  debounceMs?: number
  showToolbar?: boolean
  compact?: boolean
}

export function RichTextEditor({
  content,
  onSave,
  isAdmin = false,
  className,
  placeholder = 'Click to edit…',
  debounceMs = 150, // Reduced from 300ms for faster updates
  showToolbar = true,
  compact = false,
}: RichTextEditorProps) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const lastSavedContentRef = useRef(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for cleaner formatting
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
    ],
    content: content || '',
    editable: isAdmin,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none outline-none transition-colors',
          compact ? 'min-h-[2rem] py-1.5 px-2.5' : 'min-h-[4rem] px-3 py-2',
          isAdmin && 'rounded-md border border-border focus:border-ring focus:ring-1 focus:ring-ring/35 focus:bg-muted/5',
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!isAdmin) return
      const html = editor.getHTML()

      // Clear existing timer
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

      // Immediate save (no debounce)
      if (debounceMs <= 0) {
        if (html !== lastSavedContentRef.current) {
          onSave(html)
          lastSavedContentRef.current = html
        }
        return
      }

      // Debounced save
      saveTimerRef.current = setTimeout(() => {
        if (html !== lastSavedContentRef.current) {
          onSave(html)
          lastSavedContentRef.current = html
        }
      }, debounceMs)
    },
    onBlur: ({ editor }) => {
      if (!isAdmin) return
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      const html = editor.getHTML()
      if (html !== lastSavedContentRef.current) {
        onSave(html)
        lastSavedContentRef.current = html
      }
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.isFocused) return

    const currentContent = editor.getHTML()
    // Only update if content has actually changed to avoid unnecessary re-renders
    if (content !== currentContent && content !== lastSavedContentRef.current) {
      editor.commands.setContent(content || '')
      lastSavedContentRef.current = content
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) editor.setEditable(isAdmin)
  }, [isAdmin, editor])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  if (!editor) return null

  // Helper to save immediately after toolbar actions
  const saveContent = () => {
    if (!isAdmin) return
    const html = editor.getHTML()
    if (html !== lastSavedContentRef.current) {
      onSave(html)
      lastSavedContentRef.current = html
    }
  }

  const colors = [
    { label: 'Black', value: '#000000' },
    { label: 'Gray', value: '#6b7280' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Yellow', value: '#eab308' },
    { label: 'Purple', value: '#a855f7' },
  ]

  return (
    <div className="space-y-1">
      {showToolbar && isAdmin && (
        <div className="flex flex-wrap items-center gap-1 p-1 border border-border rounded-md bg-muted/30">
          {/* Text formatting */}
          <button
            onClick={() => {
              editor.chain().focus().toggleBold().run()
              setTimeout(saveContent, 50)
            }}
            className={cn(
              'p-1.5 rounded hover:bg-accent transition-colors',
              editor.isActive('bold') && 'bg-accent text-accent-foreground'
            )}
            title="Bold (Cmd+B)"
          >
            <Bold className="size-4" />
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleItalic().run()
              setTimeout(saveContent, 50)
            }}
            className={cn(
              'p-1.5 rounded hover:bg-accent transition-colors',
              editor.isActive('italic') && 'bg-accent text-accent-foreground'
            )}
            title="Italic (Cmd+I)"
          >
            <Italic className="size-4" />
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleUnderline().run()
              setTimeout(saveContent, 50)
            }}
            className={cn(
              'p-1.5 rounded hover:bg-accent transition-colors',
              editor.isActive('underline') && 'bg-accent text-accent-foreground'
            )}
            title="Underline (Cmd+U)"
          >
            <UnderlineIcon className="size-4" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Lists */}
          <button
            onClick={() => {
              editor.chain().focus().toggleBulletList().run()
              setTimeout(saveContent, 50)
            }}
            className={cn(
              'p-1.5 rounded hover:bg-accent transition-colors',
              editor.isActive('bulletList') && 'bg-accent text-accent-foreground'
            )}
            title="Bullet list"
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run()
              setTimeout(saveContent, 50)
            }}
            className={cn(
              'p-1.5 rounded hover:bg-accent transition-colors',
              editor.isActive('orderedList') && 'bg-accent text-accent-foreground'
            )}
            title="Numbered list"
          >
            <ListOrdered className="size-4" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Font family */}
          <Select
            value={editor.getAttributes('textStyle').fontFamily || 'default'}
            onValueChange={(value) => {
              if (value === 'default') {
                editor.chain().focus().unsetFontFamily().run()
              } else {
                editor.chain().focus().setFontFamily(value).run()
              }
              setTimeout(saveContent, 50)
            }}
          >
            <SelectTrigger className="h-7 w-[110px] text-xs border-0 bg-transparent hover:bg-accent">
              <Type className="size-3 mr-1" />
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Color picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Text color"
            >
              <Palette className="size-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-md shadow-lg z-50 flex gap-1">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      editor.chain().focus().setColor(color.value).run()
                      setShowColorPicker(false)
                      setTimeout(saveContent, 50)
                    }}
                    className="size-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
                <button
                  onClick={() => {
                    editor.chain().focus().unsetColor().run()
                    setShowColorPicker(false)
                    setTimeout(saveContent, 50)
                  }}
                  className="size-6 rounded border border-border hover:scale-110 transition-transform bg-white"
                  title="Default color"
                >
                  <span className="text-xs">×</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
