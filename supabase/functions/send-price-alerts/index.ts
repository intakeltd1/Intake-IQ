import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Favorite {
  id: string;
  user_id: string;
  product_url: string;
  product_title: string | null;
  product_image: string | null;
}

interface PriceHistory {
  price: number;
  rrp: number | null;
  recorded_date: string;
  product_title: string | null;
}

interface UserProfile {
  id: string;
  email: string | null;
}

interface AlertToSend {
  user_id: string;
  user_email: string;
  product_url: string;
  product_title: string;
  current_price: number;
  alert_type: 'lowest_30_days' | 'rrp_discount_40';
  discount_percent?: number;
  previous_low?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting price alert check...");

    // Get all favorites with user info
    const { data: favorites, error: favError } = await supabase
      .from("favorites")
      .select("id, user_id, product_url, product_title, product_image");

    if (favError) {
      console.error("Error fetching favorites:", favError);
      throw favError;
    }

    if (!favorites || favorites.length === 0) {
      console.log("No favorites found");
      return new Response(
        JSON.stringify({ success: true, message: "No favorites to check", alertsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${favorites.length} favorites to check`);

    // Get unique user IDs and fetch their emails
    const userIds = [...new Set(favorites.map(f => f.user_id))];
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    const userEmailMap = new Map<string, string>();
    profiles?.forEach(p => {
      if (p.email) userEmailMap.set(p.id, p.email);
    });

    // Get unique product URLs
    const productUrls = [...new Set(favorites.map(f => f.product_url))];

    // Fetch 30-day price history for all favorited products
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    const { data: priceHistory, error: phError } = await supabase
      .from("price_history")
      .select("product_url, price, rrp, recorded_date, product_title")
      .in("product_url", productUrls)
      .gte("recorded_date", thirtyDaysAgoStr)
      .order("recorded_date", { ascending: true });

    if (phError) {
      console.error("Error fetching price history:", phError);
      throw phError;
    }

    // Group price history by product URL
    const pricesByProduct = new Map<string, PriceHistory[]>();
    priceHistory?.forEach(ph => {
      const existing = pricesByProduct.get(ph.product_url) || [];
      existing.push(ph);
      pricesByProduct.set(ph.product_url, existing);
    });

    // Check today's alerts already sent
    const today = new Date().toISOString().split("T")[0];
    const { data: sentAlerts, error: sentError } = await supabase
      .from("price_alert_history")
      .select("user_id, product_url, alert_type")
      .eq("sent_date", today);

    if (sentError) {
      console.error("Error fetching sent alerts:", sentError);
      throw sentError;
    }

    const sentAlertKeys = new Set(
      sentAlerts?.map(a => `${a.user_id}:${a.product_url}:${a.alert_type}`) || []
    );

    // Determine which alerts to send
    const alertsToSend: AlertToSend[] = [];

    for (const favorite of favorites) {
      const userEmail = userEmailMap.get(favorite.user_id);
      if (!userEmail) {
        console.log(`No email for user ${favorite.user_id}, skipping`);
        continue;
      }

      const history = pricesByProduct.get(favorite.product_url);
      if (!history || history.length < 2) {
        continue; // Need at least 2 data points
      }

      const prices = history.map(h => h.price);
      const currentPrice = prices[prices.length - 1];
      const minPrice = Math.min(...prices);
      const latestRecord = history[history.length - 1];
      const rrp = latestRecord.rrp;

      // Check if current price is the lowest in 30 days
      if (currentPrice <= minPrice) {
        const alertKey = `${favorite.user_id}:${favorite.product_url}:lowest_30_days`;
        if (!sentAlertKeys.has(alertKey)) {
          // Find previous low (excluding current)
          const previousPrices = prices.slice(0, -1);
          const previousLow = previousPrices.length > 0 ? Math.min(...previousPrices) : currentPrice;
          
          alertsToSend.push({
            user_id: favorite.user_id,
            user_email: userEmail,
            product_url: favorite.product_url,
            product_title: favorite.product_title || latestRecord.product_title || "Product",
            current_price: currentPrice,
            alert_type: "lowest_30_days",
            previous_low: previousLow,
          });
        }
      }

      // Check if 40%+ off RRP
      if (rrp && rrp > 0) {
        const discountPercent = ((rrp - currentPrice) / rrp) * 100;
        if (discountPercent >= 40) {
          const alertKey = `${favorite.user_id}:${favorite.product_url}:rrp_discount_40`;
          if (!sentAlertKeys.has(alertKey)) {
            alertsToSend.push({
              user_id: favorite.user_id,
              user_email: userEmail,
              product_url: favorite.product_url,
              product_title: favorite.product_title || latestRecord.product_title || "Product",
              current_price: currentPrice,
              alert_type: "rrp_discount_40",
              discount_percent: Math.round(discountPercent),
            });
          }
        }
      }
    }

    console.log(`Found ${alertsToSend.length} alerts to send`);

    // Group alerts by user to send one email per user
    const alertsByUser = new Map<string, AlertToSend[]>();
    alertsToSend.forEach(alert => {
      const existing = alertsByUser.get(alert.user_email) || [];
      existing.push(alert);
      alertsByUser.set(alert.user_email, existing);
    });

    let emailsSent = 0;
    let alertsRecorded = 0;

    for (const [userEmail, alerts] of alertsByUser) {
      // Build email content
      const alertHtml = alerts.map(alert => {
        if (alert.alert_type === "lowest_30_days") {
          return `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <h3 style="margin: 0 0 8px; color: #16a34a;">🎉 30-Day Low Price!</h3>
              <p style="margin: 0 0 4px; font-weight: bold;">${alert.product_title}</p>
              <p style="margin: 0 0 8px; font-size: 24px; color: #16a34a;">£${alert.current_price.toFixed(2)}</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">This is the lowest price in the last 30 days!</p>
              <a href="${alert.product_url}" style="display: inline-block; margin-top: 12px; background: #7c3aed; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px;">View Product</a>
            </div>
          `;
        } else {
          return `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <h3 style="margin: 0 0 8px; color: #dc2626;">🔥 ${alert.discount_percent}% Off RRP!</h3>
              <p style="margin: 0 0 4px; font-weight: bold;">${alert.product_title}</p>
              <p style="margin: 0 0 8px; font-size: 24px; color: #dc2626;">£${alert.current_price.toFixed(2)}</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Massive discount on your favorited product!</p>
              <a href="${alert.product_url}" style="display: inline-block; margin-top: 12px; background: #7c3aed; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px;">View Product</a>
            </div>
          `;
        }
      }).join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #7c3aed; margin: 0;">Price Alert! 💰</h1>
            <p style="color: #6b7280; margin-top: 8px;">Great news about your favorited products</p>
          </div>
          ${alertHtml}
          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">You're receiving this because you favorited these products on Intake.</p>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "Intake <onboarding@resend.dev>",
          to: [userEmail],
          subject: `🔔 Price Alert: ${alerts.length} product${alerts.length > 1 ? "s" : ""} on sale!`,
          html: emailHtml,
        });

        console.log(`Email sent to ${userEmail}:`, emailResponse);
        emailsSent++;

        // Record the alerts as sent
        for (const alert of alerts) {
          const { error: insertError } = await supabase
            .from("price_alert_history")
            .insert({
              user_id: alert.user_id,
              product_url: alert.product_url,
              alert_type: alert.alert_type,
              product_title: alert.product_title,
              alert_price: alert.current_price,
              sent_date: today,
            });

          if (insertError) {
            console.error("Error recording alert:", insertError);
          } else {
            alertsRecorded++;
          }
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${userEmail}:`, emailError);
      }
    }

    console.log(`Price alert check complete. Emails sent: ${emailsSent}, Alerts recorded: ${alertsRecorded}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        alertsRecorded,
        totalAlertsFound: alertsToSend.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-price-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);