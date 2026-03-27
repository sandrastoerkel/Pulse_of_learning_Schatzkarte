// complete-challenge — Supabase Edge Function
// Closes a challenge and calculates XP with streak bonuses
// Migrated from: gamification_db.py complete_challenge() + calculate_streak() + update_user_stats()

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Config (1:1 from gamification_db.py) ────────────────────────────────────

const XP_CONFIG = {
  challenge_completed: 10,
  prediction_exact: 25,
  exceeded_expectation: 50,
  streak_bonus_3: 1.2,
  streak_bonus_7: 1.5,
  streak_bonus_30: 2.0,
};

const LEVELS: Record<number, { name: string; min_xp: number }> = {
  1: { name: "Anfänger", min_xp: 0 },
  2: { name: "Entdecker", min_xp: 100 },
  3: { name: "Lernender", min_xp: 250 },
  4: { name: "Aufsteiger", min_xp: 500 },
  5: { name: "Übertreffer", min_xp: 1000 },
  6: { name: "Meister", min_xp: 2000 },
  7: { name: "Experte", min_xp: 5000 },
  8: { name: "Champion", min_xp: 10000 },
};

function calculateLevel(xp: number): number {
  for (let level = 8; level >= 1; level--) {
    if (xp >= LEVELS[level].min_xp) return level;
  }
  return 1;
}

// ─── Streak calculation (1:1 from gamification_db.py) ────────────────────────

function calculateStreak(
  currentStreak: number,
  lastActivityDate: string | null
): number {
  const today = new Date().toISOString().slice(0, 10);

  if (!lastActivityDate) return 1;

  if (lastActivityDate === today) {
    // Already active today — keep current streak
    return currentStreak;
  }

  // Check if last activity was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (lastActivityDate === yesterdayStr) {
    return currentStreak + 1;
  }

  // Streak broken
  return 1;
}

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Nicht authentifiziert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Request body ---
    const { challenge_id, actual_result, reflection = "" } = await req.json();

    if (challenge_id === undefined || actual_result === undefined) {
      return new Response(
        JSON.stringify({ error: "challenge_id and actual_result are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Step 1: Get challenge ---
    const { data: challenge, error: challengeError } = await db
      .from("challenges")
      .select("*")
      .eq("id", challenge_id)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: "Challenge nicht gefunden" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (challenge.completed) {
      return new Response(
        JSON.stringify({ error: "Challenge bereits abgeschlossen" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = challenge.user_id;
    const prediction = challenge.prediction;

    // --- Step 2: Determine outcome (with note inversion) ---
    const taskDesc: string = challenge.task_description || "";
    const isNoteType = taskDesc.startsWith("[note]");

    let outcome: string;
    let baseXp: number;

    if (isNoteType) {
      // For grades: lower actual = better (1 is best in German system)
      if (actual_result < prediction) {
        outcome = "exceeded";
        baseXp = XP_CONFIG.challenge_completed + XP_CONFIG.exceeded_expectation;
      } else if (actual_result === prediction) {
        outcome = "exact";
        baseXp = XP_CONFIG.challenge_completed + XP_CONFIG.prediction_exact;
      } else {
        outcome = "below";
        baseXp = XP_CONFIG.challenge_completed;
      }
    } else {
      // For scores: higher actual = better
      if (actual_result > prediction) {
        outcome = "exceeded";
        baseXp = XP_CONFIG.challenge_completed + XP_CONFIG.exceeded_expectation;
      } else if (actual_result === prediction) {
        outcome = "exact";
        baseXp = XP_CONFIG.challenge_completed + XP_CONFIG.prediction_exact;
      } else {
        outcome = "below";
        baseXp = XP_CONFIG.challenge_completed;
      }
    }

    // --- Step 3: Calculate streak ---
    const { data: userData, error: userDataError } = await db
      .from("users")
      .select("current_streak, last_activity_date, xp_total, longest_streak")
      .eq("user_id", userId)
      .single();

    if (userDataError || !userData) {
      return new Response(
        JSON.stringify({ error: "User nicht gefunden" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newStreak = calculateStreak(
      userData.current_streak || 0,
      userData.last_activity_date
    );

    // --- Step 4: Apply streak bonus ---
    let xpEarned: number;
    if (newStreak >= 30) {
      xpEarned = Math.floor(baseXp * XP_CONFIG.streak_bonus_30);
    } else if (newStreak >= 7) {
      xpEarned = Math.floor(baseXp * XP_CONFIG.streak_bonus_7);
    } else if (newStreak >= 3) {
      xpEarned = Math.floor(baseXp * XP_CONFIG.streak_bonus_3);
    } else {
      xpEarned = baseXp;
    }

    // --- Step 5: Update challenge ---
    await db
      .from("challenges")
      .update({
        actual_result: actual_result,
        outcome: outcome,
        xp_earned: xpEarned,
        reflection: reflection,
        completed: true,
      })
      .eq("id", challenge_id);

    // --- Step 6: Log activity ---
    const today = new Date().toISOString().slice(0, 10);
    await db.from("activity_log").insert({
      user_id: userId,
      activity_date: today,
      activity_type: "challenge_completed",
      xp_earned: xpEarned,
      details: JSON.stringify({
        subject: challenge.subject,
        outcome: outcome,
        prediction: prediction,
        actual: actual_result,
      }),
    });

    // --- Step 7: Update user stats ---
    const newXp = (userData.xp_total || 0) + xpEarned;
    const newLevel = calculateLevel(newXp);
    const longestStreak = Math.max(userData.longest_streak || 0, newStreak);

    await db
      .from("users")
      .update({
        xp_total: newXp,
        level: newLevel,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
      })
      .eq("user_id", userId);

    // --- Response ---
    const oldLevel = calculateLevel(newXp - xpEarned);

    return new Response(
      JSON.stringify({
        challenge_id: challenge_id,
        outcome: outcome,
        prediction: prediction,
        actual_result: actual_result,
        xp_earned: xpEarned,
        streak: newStreak,
        total_xp: newXp,
        level: newLevel,
        level_up: newLevel > oldLevel,
        streak_bonus: newStreak >= 3,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Challenge completion failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
