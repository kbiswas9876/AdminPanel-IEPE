'use client'

import { useState, useMemo } from 'react'

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
}

export interface PaginationResult<T> {
  paginatedData: T[]
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    startIndex: number
    endIndex: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export function usePagination<T>(
  data: T[],
  initialPageSize: number = 25
): {
  paginatedData: T[]
  pagination: PaginationResult<T>['pagination']
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPreviousPage: () => void
} {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const pagination = useMemo(() => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const hasNextPage = currentPage < totalPages
    const hasPreviousPage = currentPage > 1

    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage
    }
  }, [data.length, currentPage, pageSize])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, pageSize])

  const handleSetCurrentPage = (page: number) => {
    const totalPages = Math.ceil(data.length / pageSize)
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const handleSetPageSize = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(Math.ceil(data.length / pageSize))
  const goToNextPage = () => {
    const totalPages = Math.ceil(data.length / pageSize)
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return {
    paginatedData,
    pagination,
    setCurrentPage: handleSetCurrentPage,
    setPageSize: handleSetPageSize,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage
  }
}
