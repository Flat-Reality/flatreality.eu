import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.115.0";

const projectUrl = Deno.env.get("SUPABASE_URL")!;
const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const serviceKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(projectUrl, serviceKey, { auth: { persistSession: false } });
const allowedOrigins = new Set(["https://flatreality.eu", "https://www.flatreality.eu", "http://localhost:5173", "http://127.0.0.1:5173"]);
const categories = new Set(["studio", "rain-heart", "the-nick", "fr-partners"]);
const deliveryOptions = new Set(["website", "rain-heart", "the-nick"]);
const encoder = new TextEncoder();

function cors(req: Request) { const origin = req.headers.get("origin") || ""; return { "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://flatreality.eu", "Access-Control-Allow-Headers": "content-type, x-channel-password, apikey, authorization", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" }; }
function json(req: Request, body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } }); }
async function sha256(value: string) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value)); return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join(""); }
function constantTimeEqual(a: string, b: string) { if (a.length !== b.length) return false; let result = 0; for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; }
async function requestKey(req: Request) { const address = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown"; return sha256(address); }

async function verifyPassword(req: Request) {
  const password = req.headers.get("x-channel-password") || "";
  const key = await requestKey(req);
  const now = Date.now();
  const { data: attempt } = await db.from("channel_admin_attempts").select("attempts,window_started_at").eq("request_key", key).maybeSingle();
  const activeWindow = attempt && now - new Date(attempt.window_started_at).getTime() < 15 * 60 * 1000;
  if (activeWindow && attempt.attempts >= 10) return { ok: false, rateLimited: true };
  const { data: config, error } = await db.from("channel_admin_config").select("password_hash").eq("singleton", true).single();
  if (error || !config) return { ok: false, serverError: true };
  const ok = constantTimeEqual(await sha256(password), config.password_hash);
  if (ok) { await db.from("channel_admin_attempts").delete().eq("request_key", key); return { ok: true }; }
  await db.from("channel_admin_attempts").upsert({ request_key: key, attempts: activeWindow ? attempt.attempts + 1 : 1, window_started_at: activeWindow ? attempt.window_started_at : new Date().toISOString(), updated_at: new Date().toISOString() });
  return { ok: false };
}

function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96); }
function bytesToBase64(bytes: Uint8Array) { let binary = ""; const size = 0x8000; for (let offset = 0; offset < bytes.length; offset += size) binary += String.fromCharCode(...bytes.subarray(offset, offset + size)); return btoa(binary); }

async function uploadToGitHub(file: File) {
  const token = Deno.env.get("GITHUB_CHANNEL_TOKEN");
  if (!token) throw new Error("GitHub uploads are not configured yet. Add GITHUB_CHANNEL_TOKEN to the Edge Function secrets.");
  const repository = Deno.env.get("GITHUB_CONTENT_REPOSITORY") || "Flat-Reality/GitHubSharedContent";
  const branch = Deno.env.get("GITHUB_CONTENT_BRANCH") || "main";
  const now = new Date();
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 48) || "media";
  const path = `channel/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}-${baseName}.${extension}`;
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${path}`, { method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "FR-Channel" }, body: JSON.stringify({ message: `channel: upload ${baseName}.${extension}`, content: bytesToBase64(new Uint8Array(await file.arrayBuffer())), branch }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message ? `GitHub: ${result.message}` : `GitHub upload failed (${response.status}).`);
  return { path, url: result.content?.download_url || `https://raw.githubusercontent.com/${repository}/${branch}/${path}` };
}

async function dispatchRebuild() {
  const token = Deno.env.get("GITHUB_CHANNEL_TOKEN");
  if (!token) return;
  await fetch("https://api.github.com/repos/Flat-Reality/flatreality.eu/dispatches", { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "FR-Channel" }, body: JSON.stringify({ event_type: "channel-published" }) });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);
  const auth = await verifyPassword(req);
  if (!auth.ok) {
    if (auth.rateLimited) return json(req, { error: "Too many attempts. Try again in 15 minutes." }, 429);
    if (auth.serverError) return json(req, { error: "Admin authentication is not configured." }, 503);
    return json(req, { error: "Incorrect password." }, 401);
  }
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      if (form.get("action") !== "upload") return json(req, { error: "Invalid upload action." }, 400);
      const file = form.get("file");
      if (!(file instanceof File)) return json(req, { error: "Choose a file." }, 400);
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
      if (!allowed.includes(file.type)) return json(req, { error: "Unsupported media type." }, 415);
      if (file.size > 10 * 1024 * 1024) return json(req, { error: "For reliable publishing, files are limited to 10 MB." }, 413);
      const uploaded = await uploadToGitHub(file);
      return json(req, { success: 1, path: uploaded.path, file: { url: uploaded.url } });
    }
    const body = await req.json();
    const action = String(body.action || "");
    if (action === "login") return json(req, { ok: true });
    if (action === "list") { const { data, error } = await db.from("channel_articles").select("*").order("updated_at", { ascending: false }).limit(100); if (error) throw error; return json(req, { articles: data }); }
    if (action !== "save") return json(req, { error: "Unknown action." }, 400);
    const title = String(body.title || "").trim();
    const category = String(body.category || "");
    const excerpt = String(body.excerpt || "").trim().slice(0, 320);
    const slug = slugify(String(body.slug || title));
    const status = body.status === "draft" ? "draft" : "published";
    if (!title || title.length > 160) return json(req, { error: "Title must be between 1 and 160 characters." }, 400);
    if (!slug) return json(req, { error: "Enter a valid URL slug." }, 400);
    if (!categories.has(category)) return json(req, { error: "Choose a valid category." }, 400);
    if (!excerpt) return json(req, { error: "Write at least one paragraph before saving." }, 400);
    if (!body.content || !Array.isArray(body.content.blocks)) return json(req, { error: "Article content is invalid." }, 400);
    if (JSON.stringify(body.content).length > 1_000_000) return json(req, { error: "Article content is too large." }, 413);
    const channels = Array.from(new Set(["website", ...(Array.isArray(body.delivery_channels) ? body.delivery_channels : [])])).filter(channel => deliveryOptions.has(channel));
    const record = { slug, title, category, excerpt, content: body.content, cover_url: body.cover_url || null, cover_path: body.cover_path || null, delivery_channels: channels, status, published_at: status === "published" ? new Date().toISOString() : null, updated_at: new Date().toISOString() };
    const query = db.from("channel_articles");
    const result = body.id ? await query.update(record).eq("id", body.id).select().single() : await query.insert(record).select().single();
    if (result.error) throw result.error;
    if (status === "published") await dispatchRebuild();
    return json(req, { article: result.data });
  } catch (error) { console.error(error); return json(req, { error: error instanceof Error ? error.message : "Unexpected server error." }, 500); }
});
