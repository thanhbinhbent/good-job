import { useState } from 'react'
import { toast } from 'sonner'
import { useShareLinksByDocument, useCreateShareLink, useDeleteShareLink } from '@/hooks/use-share'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Share2, Copy, Trash2, Plus, Lock, ExternalLink } from 'lucide-react'

const SHARE_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:5173'

type Props = {
  documentId: string
}

export function ShareDialog({ documentId }: Props) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const { data: links, isLoading } = useShareLinksByDocument(documentId)
  const createLink = useCreateShareLink()
  const deleteLink = useDeleteShareLink()

  const handleCreate = () => {
    createLink.mutate(
      {
        documentId,
        password: password || undefined,
        expiresAt: expiresAt || undefined,
      },
      {
        onSuccess: () => {
          setPassword('')
          setExpiresAt('')
          toast.success('Share link created')
        },
        onError: () => toast.error('Failed to create share link'),
      },
    )
  }

  const copyToClipboard = (id: string) => {
    void navigator.clipboard.writeText(`${SHARE_BASE_URL}/view/${id}`)
    toast.success('Link copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="size-4 mr-1" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>Create shareable links to this document. Optionally add a password.</DialogDescription>
        </DialogHeader>

        {/* Create new link */}
        <div className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="share-password">Password (optional)</Label>
            <Input
              id="share-password"
              type="password"
              placeholder="Leave blank for public access"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="share-expires">Expires at (optional)</Label>
            <Input
              id="share-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={createLink.isPending}>
            <Plus className="size-4 mr-1" />
            {createLink.isPending ? 'Creating…' : 'Create Link'}
          </Button>
        </div>

        <Separator />

        {/* Existing links */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Existing Links</p>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (!links || links.length === 0) && (
            <p className="text-sm text-muted-foreground">No share links yet.</p>
          )}
          {(links ?? []).map((link) => (
            <div key={link.id} className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground truncate">/view/{link.id}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {link.hasPassword && (
                    <Badge variant="secondary" className="text-xs gap-0.5">
                      <Lock className="size-2.5" /> Protected
                    </Badge>
                  )}
                  {link.expiresAt && (
                    <Badge variant="outline" className="text-xs">
                      Expires {new Date(link.expiresAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => copyToClipboard(link.id)}>
                <Copy className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-7" asChild>
                <a href={`${SHARE_BASE_URL}/view/${link.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                disabled={deleteLink.isPending}
                onClick={() => deleteLink.mutate(link.id, { onSuccess: () => toast.success('Link deleted') })}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
