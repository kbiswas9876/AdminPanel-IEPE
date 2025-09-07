'use client'

import { useState, useEffect } from 'react'
import { getBookSources, createBookSource, deleteBookSource } from '@/lib/actions/book-sources'
import type { BookSource } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { DeleteBookDialog } from './delete-book-dialog'
import { toast } from 'sonner'

export function BookManager() {
  const [books, setBooks] = useState<BookSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const result = await getBookSources()
        if (result.error) {
          setError(result.error)
        } else {
          setBooks(result.data)
        }
      } catch (err) {
        setError('Failed to fetch book sources')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Name and code are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createBookSource(
        formData.name.trim(),
        formData.code.trim().toUpperCase()
      )
      
      if (result.success) {
        toast.success(result.message)
        // Reset form
        setFormData({ name: '', code: '' })
        // Refresh the books list
        const updatedResult = await getBookSources()
        if (updatedResult.error) {
          setError(updatedResult.error)
        } else {
          setBooks(updatedResult.data)
        }
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
      
      // Refresh the books list
      const updatedResult = await getBookSources()
      if (updatedResult.error) {
        setError(updatedResult.error)
      } else {
        setBooks(updatedResult.data)
      }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="code" className="text-sm font-semibold text-gray-700">Book Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., PIN6800"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 font-medium">
                Short, unique code for this book
              </p>
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
              Manage your book sources. You can delete books that are not being used by any questions.
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
                  <TableHead className="font-semibold text-gray-700">Book Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Code</TableHead>
                  <TableHead className="font-semibold text-gray-700">Created</TableHead>
                  <TableHead className="w-[100px] font-semibold text-gray-700">Actions</TableHead>
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
                    <TableCell>
                      <DeleteBookDialog 
                        bookId={book.id} 
                        bookName={book.name}
                        onDelete={handleDelete}
                      />
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
