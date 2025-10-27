// Flag checker functions for the Insight Engine

export async function checkForPerformanceDecline(
  userId: string,
  supabase: any
): Promise<string | null> {
  try {
    // Fetch last 10 test results
    const { data: tests, error } = await supabase
      .from('test_results')
      .select('score, total_correct, total_incorrect, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Error fetching tests for ${userId}:`, error);
      return null;
    }

    if (!tests || tests.length < 7) {
      return null; // Need at least 7 tests for meaningful comparison
    }

    const last3 = tests.slice(0, 3);
    const previous7 = tests.slice(3, 10);

    const calcAccuracy = (subset: any[]) => {
      const total = subset.reduce((sum, t) => sum + (t.total_correct || 0) + (t.total_incorrect || 0), 0);
      const correct = subset.reduce((sum, t) => sum + (t.total_correct || 0), 0);
      return total > 0 ? (correct / total) * 100 : 0;
    };

    const avgLast3 = calcAccuracy(last3);
    const avgPrevious7 = calcAccuracy(previous7);

    // 15% drop threshold
    if (avgPrevious7 > 0 && avgLast3 < avgPrevious7 * 0.85) {
      return 'PERFORMANCE_DECLINE';
    }

    return null;
  } catch (error) {
    console.error(`Error in checkForPerformanceDecline for ${userId}:`, error);
    return null;
  }
}

export async function checkForBookmarkIssues(
  userId: string,
  supabase: any
): Promise<string | null> {
  try {
    const { data: bookmarks, error } = await supabase
      .from('bookmarked_questions')
      .select('question_id, metadata')
      .eq('user_id', userId);

    if (error) {
      console.error(`Error fetching bookmarks for ${userId}:`, error);
      return null;
    }

    if (!bookmarks || bookmarks.length === 0) {
      return null;
    }

    // Count bookmarks with low success ratio
    const lowSuccessCount = bookmarks.filter((b: any) => {
      const successRatio = b.metadata?.success_ratio || 0;
      return successRatio < 0.5;
    }).length;

    const lowSuccessPercent = (lowSuccessCount / bookmarks.length) * 100;

    if (lowSuccessPercent > 30) {
      return 'HIGH_BOOKMARK_RATE_LOW_SUCCESS';
    }

    return null;
  } catch (error) {
    console.error(`Error in checkForBookmarkIssues for ${userId}:`, error);
    return null;
  }
}

export async function checkForHighAchiever(
  userId: string,
  supabase: any
): Promise<string | null> {
  try {
    const { data: tests, error } = await supabase
      .from('test_results')
      .select('score, total_correct, total_incorrect, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Error fetching tests for high achiever check for ${userId}:`, error);
      return null;
    }

    if (!tests || tests.length < 5) {
      return null;
    }

    const calcAccuracy = (subset: any[]) => {
      const total = subset.reduce((sum, t) => sum + (t.total_correct || 0) + (t.total_incorrect || 0), 0);
      const correct = subset.reduce((sum, t) => sum + (t.total_correct || 0), 0);
      return total > 0 ? (correct / total) * 100 : 0;
    };

    const overallAccuracy = calcAccuracy(tests);

    // Check for consistent improvement
    if (tests.length >= 10) {
      const first5 = tests.slice(5, 10);
      const last5 = tests.slice(0, 5);

      if (first5.length >= 5 && last5.length >= 5) {
        const firstAvg = calcAccuracy(first5);
        const lastAvg = calcAccuracy(last5);

        if (overallAccuracy > 90 && lastAvg > firstAvg) {
          return 'HIGH_ACHIEVER';
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error in checkForHighAchiever for ${userId}:`, error);
    return null;
  }
}

