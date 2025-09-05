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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Error Reports Management</h1>
        <p className="text-muted-foreground">
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
              <TabsTrigger value="new" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                New Reports
                {newReportsCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {newReportsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="in-review" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                In Review
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolved
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
