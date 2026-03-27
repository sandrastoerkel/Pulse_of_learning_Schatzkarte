// generate-jitsi-jwt — Supabase Edge Function
// Generates a JaaS JWT for Jitsi video meetings (RS256)
// Migrated from: lerngruppen_db.py generate_jaas_jwt()

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Auth: verify the calling user via Supabase JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Request body ---
    const { user_name, user_id, is_moderator = false, room = "*", user_email = "" } =
      await req.json();

    if (!user_name || !user_id) {
      return new Response(
        JSON.stringify({ error: "user_name and user_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Secrets ---
    const appId = Deno.env.get("JAAS_APP_ID");
    const keyId = Deno.env.get("JAAS_KEY_ID");
    const privateKeyPem = Deno.env.get("JAAS_PRIVATE_KEY");

    if (!appId || !keyId || !privateKeyPem) {
      return new Response(
        JSON.stringify({ error: "JaaS configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Import RSA private key ---
    const privateKey = await jose.importPKCS8(privateKeyPem, "RS256");

    // --- Build JWT (identical payload structure to Python version) ---
    const now = Math.floor(Date.now() / 1000);

    const jwt = await new jose.SignJWT({
      iss: "chat",
      aud: "jitsi",
      sub: appId,
      room: room,
      exp: now + 7200, // 2 hours
      nbf: now - 10,
      context: {
        user: {
          name: user_name,
          email: user_email,
          id: user_id,
          moderator: is_moderator ? "true" : "false",
          avatar: "",
        },
        features: {
          livestreaming: "false",
          recording: "false",
          transcription: "false",
          "outbound-call": "false",
          "sip-outbound-call": "false",
        },
      },
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: keyId })
      .sign(privateKey);

    return new Response(
      JSON.stringify({ token: jwt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "JWT generation failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
