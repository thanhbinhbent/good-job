import { useCanvasStore } from '@/stores/canvas.store'
import { FONT_FAMILIES } from '@binh-tran/shared'
import type { CanvasColor } from '@binh-tran/shared'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[90px_1fr] items-center gap-2">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function ColorSwatch({ value, onChange }: { value: CanvasColor; onChange: (c: CanvasColor) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="color" value={value.hex}
        className="w-6 h-6 rounded border border-border cursor-pointer p-0"
        onChange={(e) => onChange({ ...value, hex: e.target.value })}
      />
      <Input value={value.hex} className="h-7 text-xs font-mono flex-1"
        onChange={(e) => onChange({ ...value, hex: e.target.value })} />
    </div>
  )
}

export function GlobalStylePanel() {
  const { doc, setStyle } = useCanvasStore()
  if (!doc) return null

  const { style } = doc
  const s = (patch: object) => setStyle(patch as Parameters<typeof setStyle>[0])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Global Style</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {/* Page */}
        <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest">Page</div>
        <Row label="Page BG">
          <ColorSwatch value={style.pageBackground} onChange={(c) => s({ pageBackground: c })} />
        </Row>
        <Row label="Width (px)">
          <div className="flex items-center gap-2">
            <Slider value={[style.pageWidth]} min={600} max={1200} step={2} className="flex-1"
              onValueChange={([v]) => s({ pageWidth: v })} />
            <span className="w-10 text-right font-mono text-[11px]">{style.pageWidth}</span>
          </div>
        </Row>

        <Separator />

        {/* Typography */}
        <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest">Typography</div>
        <Row label="Body font">
          <Select value={style.fontFamily} onValueChange={(v) => s({ fontFamily: v })}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Heading font">
          <Select value={style.headingFontFamily ?? style.fontFamily} onValueChange={(v) => s({ headingFontFamily: v })}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Base size">
          <div className="flex items-center gap-2">
            <Slider value={[style.baseFontSize]} min={8} max={20} step={0.5} className="flex-1"
              onValueChange={([v]) => s({ baseFontSize: v })} />
            <span className="w-8 text-right font-mono text-[11px]">{style.baseFontSize}px</span>
          </div>
        </Row>

        <Separator />

        {/* Palette */}
        <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest">Color Palette</div>
        <div className="text-[10px] text-muted-foreground">These set defaults for new blocks. Existing blocks keep their own colors.</div>
        <Row label="Primary">
          <ColorSwatch value={style.primaryColor} onChange={(c) => s({ primaryColor: c })} />
        </Row>
        <Row label="Accent">
          <ColorSwatch value={style.accentColor} onChange={(c) => s({ accentColor: c })} />
        </Row>
        <Row label="Text">
          <ColorSwatch value={style.textColor} onChange={(c) => s({ textColor: c })} />
        </Row>
        <Row label="Muted">
          <ColorSwatch value={style.mutedColor} onChange={(c) => s({ mutedColor: c })} />
        </Row>

        <Separator />

        {/* Quick presets */}
        <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest">Palette Presets</div>
        <div className="grid grid-cols-3 gap-1.5">
          {PALETTE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className="flex flex-col items-start gap-1 p-2 rounded border border-border hover:border-primary transition-colors text-left"
              onClick={() => s({
                primaryColor: { hex: preset.primary, opacity: 1 },
                accentColor: { hex: preset.accent, opacity: 1 },
                textColor: { hex: preset.text, opacity: 1 },
                pageBackground: { hex: preset.bg, opacity: 1 },
              })}
            >
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: preset.primary }} />
                <div className="w-3 h-3 rounded-full" style={{ background: preset.accent }} />
                <div className="w-3 h-3 rounded-full" style={{ background: preset.bg }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const PALETTE_PRESETS = [
  { name: 'Harvard', primary: '#1a1a1a', accent: '#1a1a1a', text: '#1a1a1a', bg: '#ffffff' },
  { name: 'Navy', primary: '#1e3a5f', accent: '#2563eb', text: '#111111', bg: '#ffffff' },
  { name: 'Indigo', primary: '#4f46e5', accent: '#6366f1', text: '#111827', bg: '#ffffff' },
  { name: 'Slate', primary: '#334155', accent: '#0ea5e9', text: '#1e293b', bg: '#f8fafc' },
  { name: 'Forest', primary: '#14532d', accent: '#16a34a', text: '#111827', bg: '#ffffff' },
  { name: 'Rose', primary: '#881337', accent: '#e11d48', text: '#111827', bg: '#ffffff' },
  { name: 'Amber', primary: '#92400e', accent: '#d97706', text: '#1c1917', bg: '#fffbeb' },
  { name: 'Purple', primary: '#581c87', accent: '#9333ea', text: '#1a1a1a', bg: '#ffffff' },
  { name: 'Dark', primary: '#f1f5f9', accent: '#38bdf8', text: '#f1f5f9', bg: '#0f172a' },
]
