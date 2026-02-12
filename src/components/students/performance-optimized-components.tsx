'use client'

import React, { memo, useMemo, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
// Debounced search hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Memoized search component
export const SearchBar = memo(function SearchBar({ 
  onSearch, 
  placeholder = "Search...",
  className = ""
}: {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  React.useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  )
})

// Memoized filter component
export const FilterSelect = memo(function FilterSelect({
  options,
  value,
  onValueChange,
  placeholder,
  className = ""
}: {
  options: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})

// Memoized table row component
export const OptimizedTableRow = memo(function OptimizedTableRow({ 
  data, 
  columns, 
  onRowClick 
}: {
  data: any
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode }[]
  onRowClick?: (row: any) => void
}) {
  const handleClick = useCallback(() => {
    onRowClick?.(data)
  }, [data, onRowClick])

  return (
    <TableRow className="cursor-pointer hover:bg-gray-50" onClick={handleClick}>
      {columns.map((column) => (
        <TableCell key={column.key}>
          {column.render ? column.render(data[column.key], data) : data[column.key]}
        </TableCell>
      ))}
    </TableRow>
  )
})

// Virtual scrolling table component
export const VirtualTable = memo(function VirtualTable({
  data,
  columns,
  height = 400,
  itemHeight = 50,
  onRowClick
}: {
  data: any[]
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode }[]
  height?: number
  itemHeight?: number
  onRowClick?: (row: any) => void
}) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(visibleStart + Math.ceil(height / itemHeight), data.length)
  
  const visibleData = useMemo(() => 
    data.slice(visibleStart, visibleEnd),
    [data, visibleStart, visibleEnd]
  )

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div 
      className="overflow-auto"
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: data.length * itemHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${visibleStart * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleData.map((row, index) => (
                <OptimizedTableRow
                  key={row.id || index}
                  data={row}
                  columns={columns}
                  onRowClick={onRowClick}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
})

// Memoized pagination component
export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}) {
  const handleFirstPage = useCallback(() => onPageChange(1), [onPageChange])
  const handlePrevPage = useCallback(() => onPageChange(Math.max(1, currentPage - 1)), [currentPage, onPageChange])
  const handleNextPage = useCallback(() => onPageChange(Math.min(totalPages, currentPage + 1)), [currentPage, totalPages, onPageChange])
  const handleLastPage = useCallback(() => onPageChange(totalPages), [totalPages, onPageChange])

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

// Memoized toolbar component
export const Toolbar = memo(function Toolbar({
  onSearch,
  onFilter,
  onExport,
  onRefresh,
  searchPlaceholder = "Search...",
  filterOptions = [],
  className = ""
}: {
  onSearch: (query: string) => void
  onFilter: (filter: string) => void
  onExport: () => void
  onRefresh: () => void
  searchPlaceholder?: string
  filterOptions?: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg ${className}`}>
      <SearchBar onSearch={onSearch} placeholder={searchPlaceholder} />
      
      {filterOptions.length > 0 && (
        <FilterSelect
          options={filterOptions}
          value=""
          onValueChange={onFilter}
          placeholder="Filter by..."
        />
      )}
      
      <div className="flex items-center space-x-2 ml-auto">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  )
})

// Memoized card component
export const AnalyticsCard = memo(function AnalyticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = ""
}: {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: { value: number; label: string; positive: boolean }
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span className={`text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '+' : ''}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
