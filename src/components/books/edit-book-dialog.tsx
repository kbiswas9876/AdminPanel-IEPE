'use client'

import { useState } from 'react'
import { updateBookSource, uploadBookCoverIcon, type BookSource } from '@/lib/actions/book-sources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit2, Upload, Link as LinkIcon, Loader2, BookOpen, Check } from 'lucide-react'
import { toast } from 'sonner'

interface EditBookDialogProps {
  book: BookSource
  onUpdate: () => void
}

export function EditBookDialog({ book, onUpdate }: EditBookDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: book.name || '',
    icon_url: book.icon_url || '',
    exam_type: book.exam_type || '',
    author: book.author || '',
    publisher: book.publisher || '',
    publication_year: book.publication_year || '',
    description: book.description || ''
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    try {
      const data = new FormData()
      data.append('file', file)
      const res = await uploadBookCoverIcon(data)

      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, icon_url: res.url! }))
        toast.success('Cover image uploaded successfully!')
      } else {
        toast.error(res.message || 'Upload failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading image file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await updateBookSource(book.id, {
        name: formData.name.trim(),
        icon_url: formData.icon_url.trim() || null,
        exam_type: formData.exam_type.trim() || null,
        author: formData.author.trim() || null,
        publisher: formData.publisher.trim() || null,
        publication_year: formData.publication_year.trim() || null,
        description: formData.description.trim() || null
      })

      if (res.success) {
        toast.success(res.message)
        setOpen(false)
        onUpdate()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update book')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl w-full max-h-[85vh] p-0 bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-[#2cb67d] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Edit Book Source
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Update book cover icon, metadata, and description
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form id="edit-book-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Book Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-xs font-extrabold text-slate-800">
              Book Name *
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-xs font-semibold rounded-xl border-slate-200 focus:ring-2 focus:ring-[#2cb67d]"
            />
          </div>

          {/* Premium Cover Image Picker Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <Label className="text-xs font-extrabold text-slate-800 block">
              Cover Icon Image
            </Label>

            <div className="flex items-start gap-4">
              {/* Cover Preview Container */}
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center relative">
                {formData.icon_url ? (
                  <img
                    src={formData.icon_url}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <BookOpen className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span className="text-[10px] font-bold block">No Icon</span>
                  </div>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs shrink-0">
                    {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>

                  {formData.icon_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, icon_url: '' })}
                      className="px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="relative min-w-0">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    placeholder="Or paste image URL (https://...)"
                    className="pl-9 text-xs rounded-xl border-slate-200 truncate focus:ring-2 focus:ring-[#2cb67d]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exam Type & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-exam" className="text-xs font-bold text-slate-700">Exam Type</Label>
              <Input
                id="edit-exam"
                value={formData.exam_type}
                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                placeholder="e.g., SSC, Railway, Banking"
                className="text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-author" className="text-xs font-bold text-slate-700">Author</Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g., Pinnacle Team"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Publisher & Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-pub" className="text-xs font-bold text-slate-700">Publisher</Label>
              <Input
                id="edit-pub"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Publisher Name"
                className="text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-year" className="text-xs font-bold text-slate-700">Publication Year</Label>
              <Input
                id="edit-year"
                value={formData.publication_year}
                onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                placeholder="e.g., 2024"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc" className="text-xs font-bold text-slate-700">Description</Label>
            <textarea
              id="edit-desc"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2cb67d] focus:outline-none font-medium"
              placeholder="Enter book description or overview..."
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl text-xs font-bold px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-book-form"
            disabled={isSubmitting}
            className="bg-[#2cb67d] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold px-5 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
