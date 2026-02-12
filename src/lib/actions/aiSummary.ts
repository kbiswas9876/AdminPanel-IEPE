'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentProfile, getStudentAnalytics } from './student-analytics'

// Helper to fetch revision hub data
async function getStudentRevisionHubMirrorData(userId: string) {
  const supabase = createAdminClient()
  
  const { data: bookmarks } = await supabase
    .from('bookmarked_questions')
    .select('*')
    .eq('user_id', userId)

  return { bookmarks: bookmarks || [] }
}

export async function generateAISummary(
  userId: string
): Promise<{ success: boolean; summary?: string; message?: string }> {
  // Check if OpenAI key is configured
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      success: false,
      message: 'AI Assistant is not configured. Please add OPENAI_API_KEY to environment variables.'
    }
  }

  try {
    // Gather comprehensive student data
    const [profile, analytics, revisionData] = await Promise.all([
      getStudentProfile(userId),
      getStudentAnalytics(userId),
      getStudentRevisionHubMirrorData(userId)
    ])

    if (!profile) {
      return { success: false, message: 'Student profile not found' }
    }

    // Fetch recent test performance
    const supabase = createAdminClient()
    const { data: recentTests } = await supabase
      .from('test_results')
      .select('score, total_correct, total_incorrect, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(10)

    // Calculate trend
    const calcAccuracy = (tests: any[]) => {
      const total = tests.reduce((s, t) => s + (t.total_correct || 0) + (t.total_incorrect || 0), 0)
      const correct = tests.reduce((s, t) => s + (t.total_correct || 0), 0)
      return total > 0 ? ((correct / total) * 100).toFixed(1) : 'N/A'
    }

    const last3Accuracy = recentTests && recentTests.length >= 3 ? 
      calcAccuracy(recentTests.slice(0, 3)) : 'N/A'
    const last10Accuracy = recentTests && recentTests.length >= 10 ? 
      calcAccuracy(recentTests) : 'N/A'

    // Build prompt
    const prompt = `You are an expert academic advisor. Analyze the following student performance data and provide a concise, 3-bullet point summary for an administrator. Highlight strengths, weaknesses, and ONE key actionable recommendation.

Student Data:
- Overall Accuracy: ${analytics.averageAccuracy}%
- Last 3 Tests Average Accuracy: ${last3Accuracy}%
- Last 10 Tests Average Accuracy: ${last10Accuracy}%
- Total Tests Taken: ${analytics.totalTests}
- Total Bookmarked Questions: ${revisionData.bookmarks?.length || 0}
- Active Flags: ${profile.active_flags?.join(', ') || 'None'}

Summary (3 bullet points):
`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful academic advisor assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const summary = data.choices[0]?.message?.content || 'Unable to generate summary'

    return { success: true, summary }
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate summary'
    }
  }
}

