import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type InlineEditProps = {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  isAdmin?: boolean;
  as?: 'input' | 'textarea';
};

export function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit…',
  className,
  isAdmin = false,
  as = 'input',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  if (!isAdmin) {
    return <span className={cn('', className)}>{value || placeholder}</span>;
  }

  if (!editing) {
    return (
      <span
        role="button"
        tabIndex={0}
        className={cn(
          'cursor-text rounded-sm px-1 hover:bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors',
          !value && 'text-muted-foreground italic',
          className,
        )}
        onClick={() => {
          setDraft(value);
          setEditing(true);
          setTimeout(() => ref.current?.focus(), 0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setDraft(value);
            setEditing(true);
          }
        }}
      >
        {value || placeholder}
      </span>
    );
  }

  const commonProps = {
    ref,
    value: draft,
    placeholder,
    className: cn('h-auto min-h-0 border-0 bg-muted/20 p-1 shadow-none focus-visible:ring-1', className),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: () => {
      onSave(draft);
      setEditing(false);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraft(value);
        setEditing(false);
      }
      if (e.key === 'Enter' && as === 'input') {
        onSave(draft);
        setEditing(false);
      }
    },
  };

  return <Input {...commonProps} />;
}
