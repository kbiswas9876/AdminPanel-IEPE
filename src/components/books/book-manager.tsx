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

export function BookManager() {
  const [books, setBooks] = useState<BookSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  })

  // Fetch books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const bookSources = await getBookSources()
        setBooks(bookSources)
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
      setError('Name and code are required')
      return
    }

    try {
      setError(null)
      const form = new FormData()
      form.append('name', formData.name.trim())
      form.append('code', formData.code.trim().toUpperCase())
      
      await createBookSource(form)
      
      // Reset form
      setFormData({ name: '', code: '' })
      
      // Refresh the books list
      const updatedBooks = await getBookSources()
      setBooks(updatedBooks)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create book source')
      console.error('Error:', err)
    }
  }

  const handleDelete = async (bookId: number) => {
    try {
      await deleteBookSource(bookId)
      
      // Refresh the books list
      const updatedBooks = await getBookSources()
      setBooks(updatedBooks)
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
    <div className="space-y-6">
      {/* Add New Book Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Book Source
          </CardTitle>
          <CardDescription>
            Create a new book source for your question bank.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Book Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Pinnacle 6800 6th Ed"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Book Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., PIN6800"
                  required
                />
                <p className="text-sm text-gray-500">
                  Short, unique code for this book
                </p>
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Save Book
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Book Sources</CardTitle>
          <CardDescription>
            Manage your book sources. You can delete books that are not being used by any questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No book sources found. Add your first book source above.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">
                        {book.name}
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {book.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
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
        </CardContent>
      </Card>
    </div>
  )
}
