import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Eye, CheckCircle, TrendingUp, Clock, Users, FileText, ChevronRight, Filter, Search } from 'lucide-react'
import { NewReportsTableRedesigned } from './new-reports-table-redesigned'
import { InReviewReportsTableRedesigned } from './in-review-reports-table-redesigned'
import { ResolvedReportsTableRedesigned } from './resolved-reports-table-redesigned'
import { getNewErrorReportsCount, getErrorReportsByStatus } from '@/lib/actions/error-reports'

export async function ErrorReportsManagementRedesigned() {
  const newReportsCount = await getNewErrorReportsCount()
  const newReports = await getErrorReportsByStatus('new')
  const inReviewReports = await getErrorReportsByStatus('reviewed')
  const resolvedReports = await getErrorReportsByStatus('resolved')

  // Calculate metrics for the dashboard
  const totalReports = newReports.length + inReviewReports.length + resolvedReports.length
  const avgResolutionTime = resolvedReports.length > 0 ? 
    Math.round(resolvedReports.reduce((acc, report) => {
      const created = new Date(report.created_at)
      const resolved = new Date(report.updated_at || report.created_at)
      return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) // days
    }, 0) / resolvedReports.length) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Error Reports Management
              </h1>
              <p className="text-slate-600 text-lg">
                Monitor and resolve user feedback to maintain question bank quality
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Search Reports
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Control Dashboard */}
      <div className="container mx-auto px-6 py-8">
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              Quality Control Dashboard
            </CardTitle>
            <CardDescription className="text-blue-100 text-base">
              Real-time insights into report management and resolution metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* New Reports Metric */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-200" />
                  </div>
                  <Badge variant="destructive" className="bg-red-500/20 text-red-100 border-red-400/30">
                    {newReportsCount}
                  </Badge>
                </div>
                <h3 className="text-white font-semibold text-lg">New Reports</h3>
                <p className="text-blue-100 text-sm">Require immediate attention</p>
              </div>

              {/* In Review Metric */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-200" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                    {inReviewReports.length}
                  </Badge>
                </div>
                <h3 className="text-white font-semibold text-lg">In Review</h3>
                <p className="text-blue-100 text-sm">Currently being processed</p>
              </div>

              {/* Resolved Metric */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-200" />
                  </div>
                  <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-400/30">
                    {resolvedReports.length}
                  </Badge>
                </div>
                <h3 className="text-white font-semibold text-lg">Resolved</h3>
                <p className="text-blue-100 text-sm">Successfully completed</p>
              </div>

              {/* Average Resolution Time */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-200" />
                  </div>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-100 border-purple-400/30">
                    {avgResolutionTime}d
                  </Badge>
                </div>
                <h3 className="text-white font-semibold text-lg">Avg. Resolution</h3>
                <p className="text-blue-100 text-sm">Time to resolve reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="new" className="w-full">
              <div className="border-b bg-slate-50/50">
                <TabsList className="grid w-full grid-cols-3 h-16 bg-transparent border-0 rounded-none">
                  <TabsTrigger 
                    value="new" 
                    className="flex items-center justify-center gap-3 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none h-16"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span>New Reports</span>
                      {newReportsCount > 0 && (
                        <Badge variant="destructive" className="ml-1 animate-pulse">
                          {newReportsCount}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="in-review" 
                    className="flex items-center justify-center gap-3 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-16"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      <span>In Review</span>
                      <Badge variant="secondary" className="ml-1">
                        {inReviewReports.length}
                      </Badge>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resolved" 
                    className="flex items-center justify-center gap-3 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none h-16"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Resolved</span>
                      <Badge variant="outline" className="ml-1 text-green-600 border-green-600">
                        {resolvedReports.length}
                      </Badge>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="new" className="m-0 p-6">
                <NewReportsTableRedesigned />
              </TabsContent>

              <TabsContent value="in-review" className="m-0 p-6">
                <InReviewReportsTableRedesigned />
              </TabsContent>

              <TabsContent value="resolved" className="m-0 p-6">
                <ResolvedReportsTableRedesigned />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
