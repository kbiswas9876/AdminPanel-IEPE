// Export utilities for CSV and Excel formats

// CSV Export
export async function exportToCSV(data: any[], filename: string): Promise<void> {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers from the first row
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Excel Export (using xlsx library)
export async function exportToExcel(data: any[], filename: string): Promise<void> {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Dynamic import of xlsx
  const XLSX = await import('xlsx')
  
  // Create workbook
  const workbook = XLSX.utils.book_new()
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  
  // Create and download file
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Format data for export
export function formatUserDataForExport(users: any[], columns: string[]): any[] {
  return users.map(user => {
    const formattedUser: any = {}
    
    columns.forEach(column => {
      switch (column) {
        case 'created_at':
          formattedUser[column] = new Date(user.created_at).toLocaleString()
          break
        case 'updated_at':
          formattedUser[column] = user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'
          break
        case 'status':
          formattedUser[column] = user.status.charAt(0).toUpperCase() + user.status.slice(1)
          break
        case 'role':
          formattedUser[column] = user.role.charAt(0).toUpperCase() + user.role.slice(1)
          break
        default:
          formattedUser[column] = user[column] || ''
      }
    })
    
    return formattedUser
  })
}

// Get export statistics
export function getExportStats(users: any[]): {
  totalUsers: number
  statusCounts: Record<string, number>
  roleCounts: Record<string, number>
  dateRange: { earliest: string; latest: string }
} {
  const statusCounts: Record<string, number> = {}
  const roleCounts: Record<string, number> = {}
  let earliestDate = new Date()
  let latestDate = new Date(0)

  users.forEach(user => {
    // Count statuses
    statusCounts[user.status] = (statusCounts[user.status] || 0) + 1
    
    // Count roles
    roleCounts[user.role] = (roleCounts[user.role] || 0) + 1
    
    // Track date range
    const createdDate = new Date(user.created_at)
    if (createdDate < earliestDate) {
      earliestDate = createdDate
    }
    if (createdDate > latestDate) {
      latestDate = createdDate
    }
  })

  return {
    totalUsers: users.length,
    statusCounts,
    roleCounts,
    dateRange: {
      earliest: earliestDate.toLocaleDateString(),
      latest: latestDate.toLocaleDateString()
    }
  }
}

// Validate export data
export function validateExportData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.length === 0) {
    errors.push('No data to export')
  }
  
  if (data.length > 10000) {
    errors.push('Too many records to export at once (max 10,000)')
  }
  
  // Check for required fields
  const requiredFields = ['id', 'email']
  const firstRow = data[0]
  if (firstRow) {
    requiredFields.forEach(field => {
      if (!(field in firstRow)) {
        errors.push(`Missing required field: ${field}`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
