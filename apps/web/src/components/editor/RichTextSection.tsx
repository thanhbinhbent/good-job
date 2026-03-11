import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type RichTextSectionProps = {
  content: string;
  onSave: (html: string) => void;
  isAdmin?: boolean;
  className?: string;
  placeholder?: string;
  debounceMs?: number;
};

export function RichTextSection({
  content,
  onSave,
  isAdmin = false,
  className,
  placeholder = 'Click to edit…',
  debounceMs = 600,
}: RichTextSectionProps) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content || `<p>${placeholder}</p>`,
    editable: isAdmin,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none outline-none',
          isAdmin && 'min-h-[3rem] rounded-md border border-transparent px-2 py-1 transition-colors hover:border-border focus:border-ring focus:bg-muted/10',
          className,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!isAdmin) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (debounceMs <= 0) {
        onSave(editor.getHTML());
        return;
      }
      saveTimerRef.current = setTimeout(() => {
        onSave(editor.getHTML());
      }, debounceMs);
    },
    onBlur: ({ editor }) => {
      if (!isAdmin) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      onSave(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(isAdmin);
  }, [isAdmin, editor]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return <EditorContent editor={editor} />;
}
