import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Create a Stripe Checkout Session (test or live depending on key). Returns hosted URL.
export const createStripeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { package_id: string; origin: string }) => data)
  .handler(async ({ data, context }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Stripe not configured");

    const { data: pkg, error } = await context.supabase
      .from("packages").select("id, name, description, price_monthly")
      .eq("id", data.package_id).maybeSingle();
    if (error || !pkg) throw new Error("Package not found");

    const amountKes = Math.round(Number(pkg.price_monthly) * 100); // Stripe uses smallest unit
    const body = new URLSearchParams();
    body.append("mode", "payment");
    body.append("success_url", `${data.origin}/app/subscription?stripe=success&pkg=${pkg.id}&sid={CHECKOUT_SESSION_ID}`);
    body.append("cancel_url", `${data.origin}/app/subscription?stripe=cancel`);
    body.append("payment_method_types[]", "card");
    body.append("customer_email", context.claims?.email ?? "");
    body.append("line_items[0][quantity]", "1");
    body.append("line_items[0][price_data][currency]", "kes");
    body.append("line_items[0][price_data][unit_amount]", String(amountKes));
    body.append("line_items[0][price_data][product_data][name]", `Digistream - ${pkg.name}`);
    if (pkg.description) body.append("line_items[0][price_data][product_data][description]", pkg.description);
    body.append("metadata[package_id]", pkg.id);
    body.append("metadata[user_id]", context.userId);

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = await resp.json() as any;
    if (!resp.ok) throw new Error(json.error?.message ?? "Stripe error");
    return { url: json.url as string, id: json.id as string };
  });

// Confirm a Stripe checkout session after redirect and return payment details.
export const confirmStripeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { session_id: string }) => data)
  .handler(async ({ data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Stripe not configured");
    const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(data.session_id)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const json = await resp.json() as any;
    if (!resp.ok) throw new Error(json.error?.message ?? "Stripe error");
    return {
      id: json.id as string,
      payment_status: json.payment_status as string,
      amount_total: (json.amount_total ?? 0) / 100,
      currency: (json.currency as string ?? "kes").toUpperCase(),
      customer_email: json.customer_details?.email ?? null,
    };
  });
