'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from '@tanstack/react-table'
import { getQuestions } from '@/lib/actions/questions'
import type { Question } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MobileResponsiveTable, MobileTableCard, MobileCardRow } from '@/components/shared/mobile-responsive-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { DeleteQuestionDialog } from './delete-question-dialog'
import { BulkTagManagementModal } from './bulk-tag-management-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

export function ContentTable() {
  const [data, setData] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showBulkTagModal, setShowBulkTagModal] = useState(false)

  // Fetch data when page or search changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getQuestions(currentPage, pageSize, searchTerm)
        
        if (result.error) {
          setError(result.error)
        } else {
          setData(result.data)
          setTotalCount(result.count)
        }
      } catch (err) {
        setError('Failed to fetch questions')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, searchTerm, pageSize])

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when searching
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const columns: ColumnDef<Question>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'question_id',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              Question ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.getValue('question_id')}
          </div>
        ),
      },
      {
        accessorKey: 'book_source',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              Book Source
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-medium">
            {row.getValue('book_source')}
          </div>
        ),
      },
      {
        accessorKey: 'chapter_name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              Chapter
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-medium">
            {row.getValue('chapter_name')}
          </div>
        ),
      },
      {
        accessorKey: 'question_text',
        header: 'Question Text',
        cell: ({ row }) => {
          const text = row.getValue('question_text') as string
          const truncated = text.length > 100 ? text.substring(0, 100) + '...' : text
          return (
            <div className="max-w-md">
              <p className="text-sm text-gray-700">{truncated}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'admin_tags',
        header: 'Admin Tags',
        cell: ({ row }) => {
          const tags = row.getValue('admin_tags') as string[] | null
          if (!tags || tags.length === 0) {
            return <span className="text-sm text-gray-400 italic">No tags</span>
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              Created At
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue('created_at'))
          return (
            <div className="text-sm text-gray-600">
              {date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const question = row.original
          return (
            <div className="flex items-center space-x-2">
              <Link href={`/content/edit/${question.id}`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <DeleteQuestionDialog questionId={question.id!} questionText={question.question_text} />
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
    enableRowSelection: true,
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedQuestionIds = selectedRows.map(row => row.original.id!)

  return (
    <div className="space-y-4">
      {/* Search Input and Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Input
          placeholder="Search questions by text or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        
        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedRows.length} question{selectedRows.length !== 1 ? 's' : ''} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowBulkTagModal(true)}>
                  Manage Tags
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-md border">
        <MobileResponsiveTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MobileResponsiveTable>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const question = row.original
            const isSelected = row.getIsSelected()
            
            return (
              <MobileTableCard key={row.id} className={isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select row"
                    />
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {question.question_id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/content/edit/${question.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteQuestionDialog questionId={question.id!} questionText={question.question_text} />
                  </div>
                </div>
                
                <MobileCardRow 
                  label="Book Source" 
                  value={<span className="font-medium">{question.book_source}</span>} 
                />
                <MobileCardRow 
                  label="Chapter" 
                  value={<span className="font-medium">{question.chapter_name}</span>} 
                />
                <MobileCardRow 
                  label="Question" 
                  value={
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {question.question_text.length > 150 
                        ? question.question_text.substring(0, 150) + '...' 
                        : question.question_text}
                    </p>
                  } 
                />
                <MobileCardRow 
                  label="Tags" 
                  value={
                    question.admin_tags && question.admin_tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {question.admin_tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {question.admin_tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{question.admin_tags.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No tags</span>
                    )
                  } 
                />
                <MobileCardRow 
                  label="Created" 
                  value={
                    <span className="text-sm text-gray-600">
                      {new Date(question.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  } 
                />
              </MobileTableCard>
            )
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-700 text-center sm:text-left">
          Showing {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} questions
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="hidden sm:flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Tag Management Modal */}
      <BulkTagManagementModal
        isOpen={showBulkTagModal}
        onClose={() => setShowBulkTagModal(false)}
        selectedQuestionIds={selectedQuestionIds}
        selectedCount={selectedRows.length}
        onSuccess={() => {
          setShowBulkTagModal(false)
          setRowSelection({})
          // Refresh data to show updated tags
          window.location.reload()
        }}
      />
    </div>
  )
}
