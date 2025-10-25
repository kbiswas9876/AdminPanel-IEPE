'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePageInput = (value: string) => {
    const page = parseInt(value)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
        <div className="text-sm text-gray-700">
          Showing {totalItems} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
      {/* Results Info */}
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-4">
        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {/* Show page numbers with ellipsis */}
            {(() => {
              const pages = []
              const maxVisiblePages = 5
              
              if (totalPages <= maxVisiblePages) {
                // Show all pages
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(i)}
                      className="h-8 w-8 p-0"
                    >
                      {i}
                    </Button>
                  )
                }
              } else {
                // Show pages with ellipsis
                if (currentPage <= 3) {
                  // Show first 3 pages, ellipsis, last page
                  for (let i = 1; i <= 3; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(i)}
                        className="h-8 w-8 p-0"
                      >
                        {i}
                      </Button>
                    )
                  }
                  pages.push(
                    <span key="ellipsis1" className="px-2 text-gray-500">
                      ...
                    </span>
                  )
                  pages.push(
                    <Button
                      key={totalPages}
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(totalPages)}
                      className="h-8 w-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  )
                } else if (currentPage >= totalPages - 2) {
                  // Show first page, ellipsis, last 3 pages
                  pages.push(
                    <Button
                      key={1}
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(1)}
                      className="h-8 w-8 p-0"
                    >
                      1
                    </Button>
                  )
                  pages.push(
                    <span key="ellipsis2" className="px-2 text-gray-500">
                      ...
                    </span>
                  )
                  for (let i = totalPages - 2; i <= totalPages; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(i)}
                        className="h-8 w-8 p-0"
                      >
                        {i}
                      </Button>
                    )
                  }
                } else {
                  // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
                  pages.push(
                    <Button
                      key={1}
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(1)}
                      className="h-8 w-8 p-0"
                    >
                      1
                    </Button>
                  )
                  pages.push(
                    <span key="ellipsis3" className="px-2 text-gray-500">
                      ...
                    </span>
                  )
                  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(i)}
                        className="h-8 w-8 p-0"
                      >
                        {i}
                      </Button>
                    )
                  }
                  pages.push(
                    <span key="ellipsis4" className="px-2 text-gray-500">
                      ...
                    </span>
                  )
                  pages.push(
                    <Button
                      key={totalPages}
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(totalPages)}
                      className="h-8 w-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  )
                }
                
                return pages
              }
            })()}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Jump to Page */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Go to:</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => handlePageInput(e.target.value)}
            className="w-16 h-8 text-center"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePageInput(e.currentTarget.value)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
