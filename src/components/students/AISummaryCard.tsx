'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { generateAISummary } from '@/lib/actions/aiSummary'

export function AISummaryCard({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    
    const result = await generateAISummary(userId)
    
    if (result.success) {
      setSummary(result.summary!)
    } else {
      setError(result.message!)
    }
    
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Assistant Summary
        </CardTitle>
        <CardDescription>
          Get AI-powered insights and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!summary && !error && (
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Summary
              </>
            )}
          </Button>
        )}
        
        {error && (
          <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        )}
        
        {summary && (
          <div className="space-y-3">
            <div className="prose prose-sm">
              <p className="whitespace-pre-wrap">{summary}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerate}
              disabled={loading}
            >
              Regenerate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

