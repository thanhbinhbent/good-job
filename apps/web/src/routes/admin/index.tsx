import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useDocuments, useCreateDocument, useDeleteDocument } from '@/hooks/use-documents'
import { useTemplates } from '@/hooks/use-templates'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/lib/api'
import { queryKeys } from '@/lib/query'
import { TemplateGallery } from '@/components/canvas/TemplateGallery'
import { contentToCanvas, defaultStructuredContent } from '@/components/canvas/presets'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Globe, Mail, Plus, Trash2 } from 'lucide-react'
import type { DocumentType } from '@binh-tran/shared'

export const Route = createFileRoute('/admin/')({
  beforeLoad: () => {
    // Guard handled in component — auth check via cookie/query
  },
  component: AdminDashboard,
})

const TYPE_ICONS = { resume: FileText, portfolio: Globe, cover_letter: Mail } as const
const TYPE_LABELS: Record<DocumentType, string> = { resume: 'Resume', portfolio: 'Portfolio', cover_letter: 'Cover Letter' }

function AdminDashboard() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const { data: documents, isLoading } = useDocuments()
  const createDoc = useCreateDocument()
  const deleteDoc = useDeleteDocument()
  const [createOpen, setCreateOpen] = useState(false)
  const [newType, setNewType] = useState<DocumentType>('resume')
  const [newTitle, setNewTitle] = useState('My Resume')
  const [newTemplateId, setNewTemplateId] = useState<string>('')
  const { data: templates = [], isLoading: templatesLoading } = useTemplates(newType)
  const { data: loginUrlData } = useQuery({
    queryKey: queryKeys.auth.loginUrl,
    queryFn: () => authApi.loginUrl(),
    staleTime: Infinity,
  })

  const currentTemplates = useMemo(() => templates.filter((t) => t.type === newType), [templates, newType])

  const defaultTemplateId = useMemo(() => {
    const found = currentTemplates.find((t) => t.isDefault)?.id ?? currentTemplates[0]?.id ?? ''
    return found
  }, [currentTemplates])

  const openCreate = () => {
    setCreateOpen(true)
    setNewType('resume')
    setNewTitle('My Resume')
    setNewTemplateId('')
  }

  const onTypeChange = (next: DocumentType) => {
    setNewType(next)
    setNewTitle(`My ${TYPE_LABELS[next]}`)
    setNewTemplateId('')
  }

  const submitCreate = async () => {
    const templateId = newTemplateId || defaultTemplateId
    if (!newTitle.trim() || !templateId) return
    const structured = defaultStructuredContent(newType)
    const initialCanvas = contentToCanvas(newType, structured, templateId)
    const created = await createDoc.mutateAsync({
      type: newType,
      title: newTitle.trim(),
      templateId,
      content: initialCanvas as unknown as Record<string, unknown>,
    })
    setCreateOpen(false)
    await navigate({
      to: '/admin/$documentId',
      params: { documentId: created.data.id },
    })
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Admin access required.</p>
        <Button asChild>
          <a href={loginUrlData?.url ?? '#'}>Login</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4 mr-1" />
          New Document
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="!w-[92vw] sm:!w-[860px] !max-w-[860px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create document</DialogTitle>
               <DialogDescription className="sr-only">
                 Create a new document by selecting type, title, and template.
               </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document type</Label>
              <Tabs value={newType} onValueChange={(v) => onTypeChange(v as DocumentType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="resume">Resume</TabsTrigger>
                  <TabsTrigger value="cover_letter">Cover Letter</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              {templatesLoading ? (
                <div className="text-xs text-muted-foreground">Loading templates…</div>
              ) : (
                <TemplateGallery
                  type={newType}
                  templates={currentTemplates}
                  selectedTemplateId={newTemplateId || defaultTemplateId}
                  onSelect={setNewTemplateId}
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button disabled={createDoc.isPending || !newTitle.trim() || !(newTemplateId || defaultTemplateId)} onClick={() => void submitCreate()}>
                {createDoc.isPending ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && documents && documents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const Icon = TYPE_ICONS[doc.type as keyof typeof TYPE_ICONS] ?? FileText
            const label = TYPE_LABELS[doc.type as keyof typeof TYPE_LABELS] ?? doc.type
            return (
              <Card key={doc.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-primary" />
                    <Badge variant="secondary">{label}</Badge>
                  </div>
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter className="flex gap-2 pt-2">
                  <Button size="sm" asChild className="flex-1">
                    <Link to="/admin/$documentId" params={{ documentId: doc.id }}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteDoc.isPending}
                    onClick={() => {
                      if (confirm('Delete this document?')) deleteDoc.mutate(doc.id)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && (!documents || documents.length === 0) && (
        <div className="text-center text-muted-foreground py-24">
          <p className="mb-4">No documents yet. Create your first one above.</p>
        </div>
      )}
    </div>
  )
}
