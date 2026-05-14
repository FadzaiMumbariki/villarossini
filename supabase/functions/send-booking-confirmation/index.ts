import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "reservations@villarossini.it";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { to, guestName, roomType, checkIn, checkOut } = await req.json();

    if (!to || !guestName || !roomType || !checkIn || !checkOut) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const payload = {
      from: FROM_EMAIL,
      to: [to],
      subject: "Your Villa Rossini reservation is confirmed",
      html: `
        <div style="font-family: Georgia,serif; color:#2b1f14; padding:24px;">
          <h2 style="margin:0 0 12px 0;">Reservation Confirmed</h2>
          <p>Dear ${guestName},</p>
          <p>Thank you for choosing Villa Rossini.</p>
          <p><strong>Room:</strong> ${roomType}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p>We look forward to welcoming you to Tuscany.</p>
        </div>
      `
    };

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!emailRes.ok) {
      const detail = await emailRes.text();
      return new Response(JSON.stringify({ error: "Email provider error", detail }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected error", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});