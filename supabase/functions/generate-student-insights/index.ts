import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  checkForPerformanceDecline,
  checkForBookmarkIssues,
  checkForHighAchiever,
} from "./flagCheckers.ts";

serve(async (req) => {
  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing environment variables" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active students
    const { data: students, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id, full_name")
      .eq("status", "active");

    if (fetchError) {
      console.error("Error fetching students:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!students || students.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No active students found" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Define extensible flag checkers array
    const flagCheckers = [
      checkForPerformanceDecline,
      checkForBookmarkIssues,
      checkForHighAchiever,
    ];

    let processedCount = 0;
    const errors: Array<{ student_id: string; error: string }> = [];

    // Process each student
    for (const student of students) {
      try {
        const activeFlags: string[] = [];

        // Run all flag checks
        for (const checker of flagCheckers) {
          const flag = await checker(student.id, supabase);
          if (flag) {
            activeFlags.push(flag);
          }
        }

        // Update user profile with new flags
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            active_flags: activeFlags,
            updated_at: new Date().toISOString(),
          })
          .eq("id", student.id);

        if (updateError) {
          console.error(`Error updating flags for ${student.id}:`, updateError);
          errors.push({
            student_id: student.id,
            error: updateError.message,
          });
        } else {
          processedCount++;
        }
      } catch (error) {
        console.error(`Error processing student ${student.id}:`, error);
        errors.push({
          student_id: student.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        total: students.length,
        errors,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

