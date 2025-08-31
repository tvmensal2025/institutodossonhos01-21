import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "*",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const term = (await req.json()).term as string;
    if (!term || term.length < 2) {
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Search profiles first
    const { data: profiles, error: profilesErr } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, email, phone, city")
      .not("user_id", "is", null)
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
      .order("full_name", { ascending: true })
      .limit(50);

    if (profilesErr) console.error("profiles search error", profilesErr);

    const uniqueById = new Map<string, any>();
    (profiles ?? []).forEach((p) => {
      if (!p.user_id) return;
      uniqueById.set(p.user_id, {
        user_id: p.user_id,
        full_name: p.full_name ?? p.email ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        city: p.city ?? "",
      });
    });

    // If less than 50, try from user_profiles as fallback (if table exists)
    if (uniqueById.size < 50) {
      try {
        const { data: up, error: upErr } = await supabaseAdmin
          .from("user_profiles")
          .select("user_id, full_name, email, phone, city")
          .not("user_id", "is", null)
          .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
          .order("full_name", { ascending: true })
          .limit(50);
        if (!upErr) {
          (up ?? []).forEach((p) => {
            if (!p.user_id) return;
            if (!uniqueById.has(p.user_id)) {
              uniqueById.set(p.user_id, {
                user_id: p.user_id,
                full_name: p.full_name ?? p.email ?? "",
                email: p.email ?? "",
                phone: p.phone ?? "",
                city: p.city ?? "",
              });
            }
          });
        }
      } catch (_e) {
        // ignore if table missing
      }
    }

    const result = Array.from(uniqueById.values()).slice(0, 50);

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("search-users error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});


