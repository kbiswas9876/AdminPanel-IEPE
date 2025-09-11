import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Eye, CheckCircle } from 'lucide-react'
import { NewReportsTable } from './new-reports-table'
import { InReviewReportsTable } from './in-review-reports-table'
import { ResolvedReportsTable } from './resolved-reports-table'
import { getNewErrorReportsCount } from '@/lib/actions/error-reports'

export async function ErrorReportsManagement() {
  const newReportsCount = await getNewErrorReportsCount()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Error Reports Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and manage user-submitted error reports for questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Quality Control Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and resolve user feedback to maintain question bank quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">New Reports</span>
                <span className="sm:hidden">New</span>
                {newReportsCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {newReportsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="in-review" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">In Review</span>
                <span className="sm:hidden">Review</span>
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Resolved</span>
                <span className="sm:hidden">Done</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-6">
              <NewReportsTable />
            </TabsContent>

            <TabsContent value="in-review" className="mt-6">
              <InReviewReportsTable />
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              <ResolvedReportsTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
