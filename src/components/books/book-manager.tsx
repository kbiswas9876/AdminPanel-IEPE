'use client'

import { useState, useEffect } from 'react'
import { getBookSources, createBookSource, deleteBookSource, uploadBookCoverIcon } from '@/lib/actions/book-sources'
import { generateUniqueBookCode, generateBookCode } from '@/lib/utils/uniform-id-generator'
import type { BookSource } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Library, Upload, Loader2, Link as LinkIcon } from 'lucide-react'
import { DeleteBookDialog } from './delete-book-dialog'
import { EditBookDialog } from './edit-book-dialog'
import { toast } from 'sonner'

export function BookManager() {
  const [books, setBooks] = useState<BookSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    icon_url: ''
  })
  const [previewBookCode, setPreviewBookCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        toast.success('Cover image uploaded successfully to Supabase Storage!')
      } else {
        toast.error(res.message || 'Upload failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading image file')
    } finally {
      setIsUploading(false)
    }
  }

  const refreshBooks = async () => {
    try {
      const result = await getBookSources()
      if (result.error) {
        setError(result.error)
      } else {
        setBooks(result.data)
      }
    } catch (err) {
      setError('Failed to fetch book sources')
    }
  }

  // Fetch books on component mount
  useEffect(() => {
    refreshBooks().finally(() => setLoading(false))
  }, [])

  // Generate preview book code when name changes
  useEffect(() => {
    if (formData.name.trim()) {
      const previewCode = generateBookCode(formData.name.trim())
      setPreviewBookCode(previewCode)
    } else {
      setPreviewBookCode('')
    }
  }, [formData.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Book name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Auto-generate book code
      const bookCode = await generateUniqueBookCode(formData.name.trim())
      const result = await createBookSource(
        formData.name.trim(),
        bookCode,
        { icon_url: formData.icon_url.trim() || undefined }
      )
      
      if (result.success) {
        toast.success(result.message)
        // Reset form
        setFormData({ name: '', code: '', icon_url: '' })
        refreshBooks()
      } else {
        toast.error(result.message)
        setError(result.message)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create book source'
      toast.error(errorMessage)
      setError(errorMessage)
      console.error('Error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (bookId: number) => {
    try {
      await deleteBookSource(bookId)
      refreshBooks()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete book source')
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Add New Book Form */}
      <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/30 to-white/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
            <Plus className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Add New Book Source
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Create a new book source for your question bank.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Book Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pinnacle 6800 6th Ed"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Cover Icon Image (Upload File or URL)</Label>
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors shrink-0">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <Upload className="h-4 w-4 text-emerald-600" />}
                  <span>{isUploading ? 'Uploading...' : 'Select File'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <div className="flex-1 relative">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="icon_url"
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    placeholder="Or paste URL..."
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
              {formData.icon_url && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Uploaded Cover:</span>
                  <img src={formData.icon_url} alt="" className="w-7 h-7 rounded-md object-cover border" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="code" className="text-sm font-semibold text-gray-700">Book Code</Label>
              <Input
                id="code"
                value={previewBookCode || "Enter book name to see preview"}
                readOnly
                className="bg-muted cursor-not-allowed text-muted-foreground font-mono"
              />
            </div>
          </div>
          
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Book'}
          </Button>
        </form>
      </div>

      {/* Books Table */}
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
            <Library className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Existing Book Sources
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Manage your book sources. You can edit book icons & details or delete unused books.
            </p>
          </div>
        </div>
        
        {books.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Library className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No book sources found</p>
            <p className="text-sm text-gray-400 mt-1">Add your first book source above</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200/50 overflow-hidden bg-white/50">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50/50 to-white/50">
                <TableRow className="border-gray-200/50">
                  <TableHead className="w-[60px] font-semibold text-gray-700">Cover</TableHead>
                  <TableHead className="font-semibold text-gray-700">Book Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Code</TableHead>
                  <TableHead className="font-semibold text-gray-700">Created</TableHead>
                  <TableHead className="w-[120px] font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book, index) => (
                  <TableRow 
                    key={book.id} 
                    className={`border-gray-200/50 hover:bg-gray-50/50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white/30' : 'bg-white/50'
                    }`}
                  >
                    <TableCell>
                      {book.icon_url ? (
                        <img src={book.icon_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#2cb67d] flex items-center justify-center font-bold text-sm shadow-2xs">
                          📚
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {book.name}
                    </TableCell>
                    <TableCell>
                      <code className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold border border-blue-200/50">
                        {book.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 font-medium">
                      {new Date(book.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditBookDialog book={book} onUpdate={refreshBooks} />
                        <DeleteBookDialog 
                          bookId={book.id} 
                          bookName={book.name}
                          onDelete={handleDelete}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
