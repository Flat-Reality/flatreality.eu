import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://flatreality.eu",
  "https://www.flatreality.eu",
]);

const allowedServices = new Set([
  "game-design-narrative",
  "unity-development-prototyping",
  "art-ui",
  "audio-sound",
  "production-management",
  "inclusive-design-accessibility",
  "implementation-support",
  "something-else",
]);

const allowedCollaboration = new Set(["One-time Project", "Production Module", "Ongoing Support", "Not Sure Yet"]);
const allowedStages = new Set(["Concept / Idea", "Prototype", "In Production", "Released / Live"]);
const allowedBudgets = new Set(["Under €500", "€500–€2,000", "€2,000–€10,000", "€10,000+", "Not Sure Yet"]);
const allowedTimelines = new Set(["As Soon As Possible", "Within a Month", "1–3 Months", "Flexible / Not Sure Yet"]);

function corsHeaders(origin: string | null) {
  const local = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
  const accepted = origin && (allowedOrigins.has(origin) || local) ? origin : "https://flatreality.eu";
  return {
    "Access-Control-Allow-Origin": accepted,
    "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(origin: string | null, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const stringValue = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

async function digest(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (request.method !== "POST") return json(origin, { saved: false, error: "Method not allowed." }, 405);
  if (origin && !allowedOrigins.has(origin) && !origin.startsWith("http://localhost:") && !origin.startsWith("http://127.0.0.1:")) {
    return json(origin, { saved: false, error: "Origin not allowed." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 32_000) return json(origin, { saved: false, error: "Request too large." }, 413);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(origin, { saved: false, error: "Invalid request." }, 400);
  }

  if (stringValue(payload.company_website, 200)) return json(origin, { saved: false, error: "Unable to submit this request." }, 400);

  const name = stringValue(payload.name, 120);
  const organization = stringValue(payload.organization, 160);
  const email = stringValue(payload.email, 254).toLowerCase();
  const projectUrl = stringValue(payload.project_url, 500);
  const projectDescription = stringValue(payload.project_description, 6000);
  const collaborationModel = stringValue(payload.collaboration_model, 80);
  const projectStage = stringValue(payload.project_stage, 80);
  const budgetRange = stringValue(payload.budget_range, 80);
  const timeline = stringValue(payload.timeline, 80);
  const sourcePage = stringValue(payload.source_page, 120) || "Flat Reality Partners / Outsourcing";
  const privacyNoticeVersion = stringValue(payload.privacy_notice_version, 40);
  const marketingConsent = payload.marketing_consent === true;
  const selectedServices = [...new Set(Array.isArray(payload.selected_services) ? payload.selected_services.filter(value => typeof value === "string" && allowedServices.has(value)) : [])];

  if (name.length < 2 || projectDescription.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(origin, { saved: false, error: "Please complete the required contact fields." }, 422);
  }
  if (!selectedServices.length || !allowedCollaboration.has(collaborationModel) || !allowedStages.has(projectStage) || !allowedBudgets.has(budgetRange) || !allowedTimelines.has(timeline)) {
    return json(origin, { saved: false, error: "Please complete every project selection." }, 422);
  }
  if (payload.privacy_acknowledged !== true || !privacyNoticeVersion) {
    return json(origin, { saved: false, error: "Please review the privacy notice before submitting." }, 422);
  }
  if (projectUrl) {
    try {
      const parsed = new URL(projectUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      return json(origin, { saved: false, error: "Please enter a valid project URL." }, 422);
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json(origin, { saved: false, error: "Submission service is unavailable." }, 503);
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("cf-connecting-ip") || "unknown";
  const requestKey = await digest(`${forwarded}:${email}`);
  const { data: allowed, error: rateError } = await supabase.rpc("consume_partner_inquiry_rate_limit", { p_request_key: requestKey, p_limit: 5, p_window: "01:00:00" });
  if (rateError) return json(origin, { saved: false, error: "Submission service is unavailable." }, 503);
  if (!allowed) return json(origin, { saved: false, error: "Too many attempts. Please try again later." }, 429);

  const { data, error } = await supabase.from("partner_inquiries").insert({
    name,
    organization,
    email,
    project_url: projectUrl,
    project_description: projectDescription,
    selected_services: selectedServices,
    collaboration_model: collaborationModel,
    project_stage: projectStage,
    budget_range: budgetRange,
    timeline,
    source_page: sourcePage,
    privacy_acknowledged: true,
    privacy_notice_version: privacyNoticeVersion,
    marketing_consent: marketingConsent,
    marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
  }).select("id, reference").single();

  if (error || !data) {
    console.error("partner inquiry insert failed", error?.code);
    return json(origin, { saved: false, error: "The inquiry could not be saved. Please try again." }, 500);
  }

  return json(origin, { saved: true, inquiry_id: data.id, reference: data.reference }, 201);
});
