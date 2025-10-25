import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface ReportConfig {
  name: string
  metrics: string[]
  dateRange: {
    from: Date
    to: Date
  }
  groupBy: 'day' | 'week' | 'month'
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  filters: {
    status?: string[]
    role?: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: ReportConfig = await request.json()
    const supabase = createAdminClient()

    // Fetch data based on selected metrics
    const reportData = await generateReportData(supabase, config)

    // Generate file based on format
    const filename = `${config.name || 'report'}_${new Date().toISOString().split('T')[0]}`
    
    if (config.format === 'csv') {
      const csvContent = await generateCSVContent(reportData, config)
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    } else if (config.format === 'excel') {
      const excelBuffer = await generateExcelContent(reportData, config)
      return new NextResponse(new Uint8Array(excelBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`
        }
      })
    } else {
      // For PDF, we'll return a simple HTML report for now
      // In a real implementation, you'd use a library like Puppeteer or jsPDF
      const htmlContent = generateHTMLReport(reportData, config)
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${filename}.html"`
        }
      })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateReportData(supabase: any, config: ReportConfig): Promise<Record<string, any[]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any[]> = {}

  // Fetch user registrations
  if (config.metrics.includes('registrations')) {
    const { data: registrations } = await supabase
      .from('user_profiles')
      .select('created_at, status')
      .gte('created_at', config.dateRange.from.toISOString())
      .lte('created_at', config.dateRange.to.toISOString())
      .order('created_at', { ascending: true })

    data.registrations = registrations || []
  }

  // Fetch approvals
  if (config.metrics.includes('approvals')) {
    const { data: approvals } = await supabase
      .from('user_profiles')
      .select('created_at, updated_at, status')
      .eq('status', 'active')
      .gte('updated_at', config.dateRange.from.toISOString())
      .lte('updated_at', config.dateRange.to.toISOString())
      .order('updated_at', { ascending: true })

    data.approvals = approvals || []
  }

  // Fetch activity data
  if (config.metrics.includes('activity')) {
    const { data: activities } = await supabase
      .from('user_activity_log')
      .select('*')
      .gte('created_at', config.dateRange.from.toISOString())
      .lte('created_at', config.dateRange.to.toISOString())
      .order('created_at', { ascending: true })

    data.activities = activities || []
  }

  // Fetch performance data (if available)
  if (config.metrics.includes('performance')) {
    // This would typically come from test results or performance tables
    data.performance = []
  }

  // Fetch engagement data
  if (config.metrics.includes('engagement')) {
    const { data: engagement } = await supabase
      .from('user_activity_log')
      .select('user_id, activity_type, created_at')
      .gte('created_at', config.dateRange.from.toISOString())
      .lte('created_at', config.dateRange.to.toISOString())

    data.engagement = engagement || []
  }

  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateCSVContent(data: Record<string, any[]>, config: ReportConfig): Promise<string> {
  const rows: string[] = []
  
  // Add headers
  const headers = ['Date', 'Metric', 'Value', 'Details']
  rows.push(headers.join(','))

  // Process each metric
  for (const metric of config.metrics) {
    const metricData = data[metric] || []
    
    if (metric === 'registrations') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metricData.forEach((item: Record<string, any>) => {
        rows.push([
          new Date(item.created_at).toISOString().split('T')[0],
          'Registration',
          '1',
          `Status: ${item.status}`
        ].join(','))
      })
    } else if (metric === 'approvals') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metricData.forEach((item: Record<string, any>) => {
        rows.push([
          new Date(item.updated_at).toISOString().split('T')[0],
          'Approval',
          '1',
          `User approved`
        ].join(','))
      })
    } else if (metric === 'activity') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metricData.forEach((item: Record<string, any>) => {
        rows.push([
          new Date(item.created_at).toISOString().split('T')[0],
          'Activity',
          '1',
          `${item.activity_type}: ${item.description || ''}`
        ].join(','))
      })
    }
  }

  return rows.join('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateExcelContent(data: Record<string, any[]>, config: ReportConfig): Promise<Buffer> {
  // This is a simplified version - in a real implementation, you'd use the xlsx library
  const csvContent = await generateCSVContent(data, config)
  return Buffer.from(csvContent, 'utf-8')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateHTMLReport(data: Record<string, any[]>, config: ReportConfig): string {
  const totalRegistrations = data.registrations?.length || 0
  const totalApprovals = data.approvals?.length || 0
  const totalActivities = data.activities?.length || 0

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${config.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .metric { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .metric h3 { margin-top: 0; color: #333; }
        .value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .date-range { color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${config.name}</h1>
        <div class="date-range">
          ${config.dateRange.from.toLocaleDateString()} - ${config.dateRange.to.toLocaleDateString()}
        </div>
      </div>
      
      ${config.metrics.includes('registrations') ? `
        <div class="metric">
          <h3>User Registrations</h3>
          <div class="value">${totalRegistrations}</div>
          <p>New user registrations in the selected period</p>
        </div>
      ` : ''}
      
      ${config.metrics.includes('approvals') ? `
        <div class="metric">
          <h3>Account Approvals</h3>
          <div class="value">${totalApprovals}</div>
          <p>Accounts approved in the selected period</p>
        </div>
      ` : ''}
      
      ${config.metrics.includes('activity') ? `
        <div class="metric">
          <h3>User Activity</h3>
          <div class="value">${totalActivities}</div>
          <p>Total user activities in the selected period</p>
        </div>
      ` : ''}
      
      <div class="metric">
        <h3>Report Generated</h3>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `
}
