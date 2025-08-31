import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { planId } = await req.json();
    
    // Map plan IDs to prices in centavos (Asaas uses centavos)
    const planPrices = {
      basic: { value: 990, name: "Plano Básico" }, // R$ 9,90
      premium: { value: 2990, name: "Plano Premium" }, // R$ 29,90
      professional: { value: 4990, name: "Plano Professional" }, // R$ 49,90
    };

    const selectedPlan = planPrices[planId as keyof typeof planPrices];
    if (!selectedPlan) throw new Error("Invalid plan selected");

    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    if (!asaasApiKey) throw new Error("ASAAS_API_KEY not configured");

    // Get user profile for more complete data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', user.id)
      .single();

    // Create customer in Asaas if needed
    let customerId;
    const customerResponse = await fetch("https://www.asaas.com/api/v3/customers", {
      method: "POST",
      headers: {
        "access_token": asaasApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profile?.full_name || user.email.split('@')[0],
        email: user.email,
        phone: profile?.phone || "",
        cpfCnpj: "",
        notificationDisabled: false,
      }),
    });

    if (customerResponse.ok) {
      const customerData = await customerResponse.json();
      customerId = customerData.id;
    } else {
      // Try to find existing customer
      const searchResponse = await fetch(`https://www.asaas.com/api/v3/customers?email=${user.email}`, {
        headers: {
          "access_token": asaasApiKey,
        },
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          customerId = searchData.data[0].id;
        }
      }
    }

    if (!customerId) {
      throw new Error("Failed to create or find customer");
    }

    // Create subscription in Asaas
    const subscriptionResponse = await fetch("https://www.asaas.com/api/v3/subscriptions", {
      method: "POST",
      headers: {
        "access_token": asaasApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: selectedPlan.value / 100, // Convert centavos to reais
        nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        cycle: "MONTHLY",
        description: selectedPlan.name,
        endDate: null,
        maxPayments: null,
      }),
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      throw new Error(`Asaas API error: ${JSON.stringify(errorData)}`);
    }

    const subscriptionData = await subscriptionResponse.json();

    // Save subscription info to our database
    await supabaseClient.from("user_subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      asaas_subscription_id: subscriptionData.id,
      asaas_customer_id: customerId,
      status: 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return new Response(JSON.stringify({ 
      success: true,
      subscription: subscriptionData,
      paymentUrl: subscriptionData.invoiceUrl 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating Asaas payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});