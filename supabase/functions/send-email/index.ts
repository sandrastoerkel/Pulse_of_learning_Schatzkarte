// send-email — Supabase Edge Function
// Sends invitation and welcome emails via Resend API
// Migrated from: lerngruppen_db.py send_invitation_email() + send_welcome_email()

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Email Templates ─────────────────────────────────────────────────────────

function invitationHtml(groupName: string, inviteUrl: string): string {
  return `<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;">
      <h2 style="margin: 0;">🎉 Du wurdest eingeladen!</h2>
      <h3 style="margin: 10px 0 0 0;">Lerngruppe: ${groupName}</h3>
    </div>
    <p style="margin-top: 20px;">Hallo!</p>
    <p>Du wurdest zur Lerngruppe <strong>"${groupName}"</strong> eingeladen.</p>
    <p style="text-align: center; margin: 25px 0;">
      <a href="${inviteUrl}"
         style="background: #667eea; color: white; padding: 12px 30px;
                border-radius: 25px; text-decoration: none; font-weight: bold;">
        Jetzt beitreten
      </a>
    </p>
    <p style="font-size: 0.9em; color: #666;">
      Oder kopiere diesen Link:<br>
      <a href="${inviteUrl}">${inviteUrl}</a>
    </p>
    <p style="font-size: 0.85em; color: #999;">Der Link ist 7 Tage gültig.</p>
  </div>
</body>
</html>`;
}

function invitationText(groupName: string, inviteUrl: string): string {
  return `Hallo!

Du wurdest zur Lerngruppe "${groupName}" eingeladen!

Klicke auf diesen Link, um beizutreten:
${inviteUrl}

Der Link ist 7 Tage gültig.

Viel Spaß beim Lernen!`;
}

function welcomeHtml(
  childName: string,
  groupName: string,
  startDate: string,
  meetingInfo: string,
  schatzkarte_url: string
): string {
  return `<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;">
      <h2 style="margin: 0;">Willkommen, ${childName}!</h2>
      <h3 style="margin: 10px 0 0 0;">Lerngruppe: ${groupName}</h3>
    </div>

    <div style="background: #f0f9ff; border-radius: 10px; padding: 15px; margin-top: 20px;">
      <h4 style="margin: 0 0 10px 0; color: #0369a1;">Deine Lernreise</h4>
      <p style="margin: 5px 0;"><strong>Startdatum:</strong> ${startDate || "wird noch bekannt gegeben"}</p>
      <p style="margin: 5px 0;"><strong>Treffen:</strong> ${meetingInfo || "Wird noch vom Coach geplant"}</p>
    </div>

    <div style="background: #f0fdf4; border-radius: 10px; padding: 15px; margin-top: 15px;">
      <h4 style="margin: 0 0 10px 0; color: #166534;">So funktioniert's</h4>
      <p style="margin: 5px 0;">1. Oeffne die <strong>Schatzkarte</strong> zum Lernen</p>
      <p style="margin: 5px 0;">2. Beim Treffen oeffnest du den <strong>Video-Chat</strong></p>
      <p style="margin: 5px 0;">3. Tipp: Oeffne beides in eigenen Browser-Tabs!</p>
    </div>

    <p style="text-align: center; margin: 25px 0;">
      <a href="${schatzkarte_url}"
         style="background: #667eea; color: white; padding: 12px 30px;
                border-radius: 25px; text-decoration: none; font-weight: bold;">
        Zur Schatzkarte
      </a>
    </p>

    <p style="font-size: 0.85em; color: #999; text-align: center;">
      Hebe diese Email auf — so findest du den Link immer wieder!
    </p>
  </div>
</body>
</html>`;
}

function welcomeText(
  childName: string,
  groupName: string,
  startDate: string,
  meetingInfo: string,
  schatzkarte_url: string
): string {
  return `Hallo ${childName}!

Willkommen in der Lerngruppe "${groupName}"!

${startDate ? `Startdatum: ${startDate}` : "Startdatum: wird noch bekannt gegeben"}
Treffen: ${meetingInfo || "Wird noch vom Coach geplant"}

So funktioniert's:
1. Oeffne die Schatzkarte: ${schatzkarte_url}
2. Beim Treffen oeffnest du den Video-Chat (Link auf der Schatzkarte)
3. Tipp: Oeffne beides in eigenen Browser-Tabs!

Viel Spass bei der Lernreise!`;
}

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("SENDER_EMAIL") || "onboarding@resend.dev";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { type } = body;

    let subject: string;
    let htmlBody: string;
    let textBody: string;
    let toEmail: string;

    if (type === "invitation") {
      const { to_email, group_name, invite_url } = body;
      if (!to_email || !group_name || !invite_url) {
        return new Response(
          JSON.stringify({ error: "to_email, group_name, and invite_url are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      toEmail = to_email;
      subject = `Einladung zur Lerngruppe "${group_name}"`;
      htmlBody = invitationHtml(group_name, invite_url);
      textBody = invitationText(group_name, invite_url);

    } else if (type === "welcome") {
      const { to_email, child_name, group_name, start_date = "", meeting_info = "", schatzkarte_url = "" } = body;
      if (!to_email || !child_name || !group_name) {
        return new Response(
          JSON.stringify({ error: "to_email, child_name, and group_name are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      toEmail = to_email;
      subject = `Willkommen in der Lerngruppe "${group_name}"!`;
      htmlBody = welcomeHtml(child_name, group_name, start_date, meeting_info, schatzkarte_url);
      textBody = welcomeText(child_name, group_name, start_date, meeting_info, schatzkarte_url);

    } else {
      return new Response(
        JSON.stringify({ error: 'type must be "invitation" or "welcome"' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Send via Resend API ───
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [toEmail],
        subject: subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      return new Response(
        JSON.stringify({ error: "Email sending failed", details: errorData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, message_id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Email sending failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
