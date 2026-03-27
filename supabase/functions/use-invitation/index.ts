// use-invitation — Supabase Edge Function
// Validates an invitation token, adds user to group, marks token as used
// Migrated from: lerngruppen_db.py use_invitation()
// Called by the React app when a user clicks an invite link

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Auth: get the calling user's JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing authorization header", group_id: null }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Supabase client with service_role (needs to bypass RLS for group operations) ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    // --- Also create a user-scoped client to get the authenticated user ---
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: "Nicht authentifiziert", group_id: null }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Request body ---
    const { token } = await req.json();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Token fehlt", group_id: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Get user_id: use legacy_user_id from profiles if available ---
    const { data: profile } = await db
      .from("profiles")
      .select("legacy_user_id")
      .eq("id", user.id)
      .single();

    const userId = profile?.legacy_user_id || user.id;

    // --- 1. Get invitation + group info ---
    const { data: invitation, error: invError } = await db
      .from("group_invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (invError || !invitation) {
      return new Response(
        JSON.stringify({ success: false, message: "Ungültiger Einladungslink", group_id: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 2. Check if already used ---
    if (invitation.used_at) {
      return new Response(
        JSON.stringify({ success: false, message: "Einladung wurde bereits verwendet", group_id: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 3. Check expiry ---
    if (invitation.expires_at) {
      const expiresAt = new Date(invitation.expires_at);
      if (new Date() > expiresAt) {
        return new Response(
          JSON.stringify({ success: false, message: "Einladung ist abgelaufen", group_id: null }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- 4. Check if user is already in a group ---
    const { data: existingMembership } = await db
      .from("group_members")
      .select("group_id, learning_groups(name)")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (existingMembership) {
      const groupName = (existingMembership as any).learning_groups?.name || "einer Gruppe";
      return new Response(
        JSON.stringify({
          success: false,
          message: `Du bist bereits in der Gruppe '${groupName}'`,
          group_id: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 5. Add user to group ---
    const groupId = invitation.group_id;
    const { error: addError } = await db
      .from("group_members")
      .insert({ group_id: groupId, user_id: userId });

    if (addError) {
      return new Response(
        JSON.stringify({ success: false, message: "Fehler beim Beitreten", group_id: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 6. Mark invitation as used ---
    await db
      .from("group_invitations")
      .update({ used_at: new Date().toISOString(), used_by: userId })
      .eq("token", token);

    // --- 7. Get group name for response ---
    const { data: group } = await db
      .from("learning_groups")
      .select("name")
      .eq("group_id", groupId)
      .single();

    const groupName = group?.name || "";

    return new Response(
      JSON.stringify({
        success: true,
        message: `Willkommen in der Gruppe '${groupName}'!`,
        group_id: groupId,
        // The React app can call send-email with type "welcome" after this succeeds
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Interner Fehler", group_id: null, details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
