import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TestItem = { name: string; grams?: number; ml?: number; state?: string };

function defaultItems(): TestItem[] {
  return [
    { name: "arroz, branco, cozido", grams: 120, state: "cozido" },
    { name: "frango, peito, grelhado", grams: 150, state: "grelhado" },
    { name: "feijao carioca cozido", grams: 80, state: "cozido" },
    { name: "ovo de galinha cozido", grams: 50, state: "cozido" },
    { name: "salada verde", grams: 50 },
    { name: "suco de laranja", ml: 200, state: "liquido" },
    { name: "azeite de oliva", ml: 15, state: "liquido" },
    { name: "molho de tomate", grams: 40, state: "pronto" },
    { name: "pão francês", grams: 50 },
    { name: "manteiga", grams: 10 },
    { name: "batata frita", grams: 80, state: "frito" },
    { name: "macarrão cozido", grams: 100, state: "cozido" },
    { name: "carne bovina grelhada", grams: 150, state: "grelhado" },
    { name: "peixe grelhado", grams: 120, state: "grelhado" },
    { name: "queijo minas", grams: 30 },
    { name: "arroz integral cozido", grams: 100, state: "cozido" },
    { name: "feijão preto cozido", grams: 80, state: "cozido" },
    { name: "granola", grams: 40 },
    { name: "iogurte natural integral", grams: 170 },
    { name: "leite integral", ml: 200 },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, preset } = await req.json().catch(() => ({ items: undefined, preset: undefined }));
    const testItems: TestItem[] = Array.isArray(items) && items.length > 0
      ? items
      : defaultItems();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/nutrition-calc`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: testItems, locale: "pt-BR" }),
    });

    const bodyText = await res.text();
    let payload: any = null;
    try { payload = JSON.parse(bodyText); } catch { /* keep raw */ }

    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, status: res.status, body: payload ?? bodyText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resolved: any[] = Array.isArray(payload?.resolved) ? payload.resolved : [];
    const totals = payload?.totals ?? null;

    const coverage = {
      total_items: testItems.length,
      matched: resolved.filter((r) => r?.matched_food_id && (Number(r?.effective_grams) || 0) > 0).length,
      unmatched: resolved.filter((r) => !r?.matched_food_id).map((r) => r?.input?.name || ""),
      zero_grams: resolved.filter((r) => (Number(r?.effective_grams) || 0) === 0).map((r) => r?.input?.name || ""),
    };

    return new Response(JSON.stringify({ success: true, preset: preset || "default", coverage, totals, resolved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


