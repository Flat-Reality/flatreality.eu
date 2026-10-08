import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.115.0";

const projectUrl = Deno.env.get("SUPABASE_URL")!;
const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const serviceKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(projectUrl, serviceKey, { auth: { persistSession: false } });
const publicKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const authClient = createClient(projectUrl, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
const allowedOrigins = new Set(["https://flatreality.eu", "https://www.flatreality.eu", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]);
const categories = new Set(["studio", "rain-heart", "the-nick", "fr-partners"]);
const deliveryOptions = new Set(["website", "rain-heart", "the-nick"]);
const defaultAdminGroupIds = ["44b21558-be01-48f5-86ee-dd7c1cb07d0c", "92dfddc6-10de-4aad-ba63-10e0459e187a"];
let cachedGitHubToken: string | null | undefined;
let graphToken: { value: string; expiresAt: number } | null = null;

function cors(req: Request) { const origin = req.headers.get("origin") || ""; return { "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://flatreality.eu", "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-microsoft-provider-token", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" }; }
function json(req: Request, body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } }); }

function tokenClaims(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return {}; }
}

async function getGraphToken(tenantId: string) {
  if (graphToken && graphToken.expiresAt > Date.now() + 60_000) return graphToken.value;
  const clientId = Deno.env.get("ENTRA_CLIENT_ID") || "9f293a7f-8c33-4743-92a4-db923a32a61c";
  const clientSecret = Deno.env.get("ENTRA_CLIENT_SECRET");
  if (!clientSecret) throw new Error("Microsoft administration access is not configured.");
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" });
  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error("Microsoft administration access is unavailable.");
  graphToken = { value: result.access_token, expiresAt: Date.now() + Number(result.expires_in || 3600) * 1000 };
  return graphToken.value;
}

async function verifyAdmin(req: Request) {
  const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!bearer) return { ok: false, status: 401, error: "Sign in with Microsoft to continue." };
  const { data, error } = await authClient.auth.getUser(bearer);
  if (error || !data.user) return { ok: false, status: 401, error: "Your Microsoft session is invalid or expired." };
  const azure = data.user.identities?.find(identity => identity.provider === "azure");
  if (!azure) return { ok: false, status: 403, error: "Use the approved Microsoft work account." };

  const tenantId = Deno.env.get("ENTRA_TENANT_ID") || "ca5ad43b-0a46-4cfd-9bdb-f8fdf508be8d";
  const identity = azure.identity_data || {};
  let objectId = String(identity.oid || data.user.user_metadata?.oid || "");
  let signedInTenant = String(identity.tid || data.user.user_metadata?.tid || "");
  const providerToken = req.headers.get("x-microsoft-provider-token") || "";

  if ((!objectId || !signedInTenant) && providerToken) {
    const claims = tokenClaims(providerToken);
    signedInTenant = signedInTenant || String(claims.tid || "");
    const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me?$select=id", { headers: { Authorization: `Bearer ${providerToken}` } });
    const profile = await profileResponse.json();
    if (profileResponse.ok) objectId = objectId || String(profile.id || "");
  }

  if (signedInTenant !== tenantId || !objectId) return { ok: false, status: 403, error: "This account is not part of the approved Flat Reality tenant." };
  const configuredGroupIds = (Deno.env.get("ENTRA_ADMIN_GROUP_IDS") || "").split(",").map(value => value.trim()).filter(Boolean);
  const groupIds = configuredGroupIds.length ? configuredGroupIds : defaultAdminGroupIds;

  const appToken = await getGraphToken(tenantId);
  const membershipResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(objectId)}/checkMemberGroups`, {
    method: "POST",
    headers: { Authorization: `Bearer ${appToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ groupIds })
  });
  const membership = await membershipResponse.json();
  if (!membershipResponse.ok) return { ok: false, status: 503, error: "Microsoft group membership could not be verified." };
  if (!Array.isArray(membership.value) || !membership.value.length) return { ok: false, status: 403, error: "Your account is not assigned to Administration or Operations." };
  return { ok: true, userId: data.user.id, tenantId, objectId };
}

function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96); }
function bytesToBase64(bytes: Uint8Array) { let binary = ""; const size = 0x8000; for (let offset = 0; offset < bytes.length; offset += size) binary += String.fromCharCode(...bytes.subarray(offset, offset + size)); return btoa(binary); }

async function getGitHubToken() {
  if (cachedGitHubToken !== undefined) return cachedGitHubToken;
  const environmentToken = Deno.env.get("GITHUB_CHANNEL_TOKEN");
  if (environmentToken) return cachedGitHubToken = environmentToken;
  const { data, error } = await db.rpc("channel_github_token");
  if (error) console.error("Unable to read the GitHub token from Vault", error);
  cachedGitHubToken = !error && typeof data === "string" && data ? data : null;
  return cachedGitHubToken;
}

async function uploadToGitHub(file: File) {
  const token = await getGitHubToken();
  if (!token) throw new Error("GitHub uploads are not configured yet. Add GITHUB_CHANNEL_TOKEN to the Edge Function secrets.");
  const repository = Deno.env.get("GITHUB_CONTENT_REPOSITORY") || "Flat-Reality/flatreality.eu";
  const branch = Deno.env.get("GITHUB_CONTENT_BRANCH") || "main";
  const now = new Date();
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 48) || "media";
  const path = `public/assets/channel/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}-${baseName}.${extension}`;
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${path}`, { method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "FR-Channel" }, body: JSON.stringify({ message: `channel: upload ${baseName}.${extension}`, content: bytesToBase64(new Uint8Array(await file.arrayBuffer())), branch }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message ? `GitHub: ${result.message}` : `GitHub upload failed (${response.status}).`);
  return { path, url: result.content?.download_url || `https://raw.githubusercontent.com/${repository}/${branch}/${path}` };
}

async function dispatchRebuild() {
  const token = await getGitHubToken();
  if (!token) return;
  await fetch("https://api.github.com/repos/Flat-Reality/flatreality.eu/dispatches", { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "FR-Channel" }, body: JSON.stringify({ event_type: "channel-published" }) });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);
  const auth = await verifyAdmin(req);
  if (!auth.ok) {
    return json(req, { error: auth.error }, auth.status);
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
    const requestedStatus = body.status === "draft" ? "draft" : "published";
    const publicationDate = new Date(String(body.published_at || ""));
    if (!title || title.length > 160) return json(req, { error: "Title must be between 1 and 160 characters." }, 400);
    if (!slug) return json(req, { error: "Enter a valid URL slug." }, 400);
    if (!categories.has(category)) return json(req, { error: "Choose a valid category." }, 400);
    if (!excerpt) return json(req, { error: "Write at least one paragraph before saving." }, 400);
    if (Number.isNaN(publicationDate.getTime())) return json(req, { error: "Choose a valid transmission date." }, 400);
    if (!body.content || !Array.isArray(body.content.blocks)) return json(req, { error: "Article content is invalid." }, 400);
    if (JSON.stringify(body.content).length > 1_000_000) return json(req, { error: "Article content is too large." }, 413);
    const channels = Array.from(new Set(["website", ...(Array.isArray(body.delivery_channels) ? body.delivery_channels : [])])).filter(channel => deliveryOptions.has(channel));
    const status = requestedStatus === "draft" ? "draft" : publicationDate.getTime() > Date.now() ? "scheduled" : "published";
    const record = { slug, title, category, excerpt, content: body.content, cover_url: body.cover_url || null, cover_path: body.cover_path || null, delivery_channels: channels, status, published_at: publicationDate.toISOString(), updated_at: new Date().toISOString() };
    const query = db.from("channel_articles");
    const result = body.id ? await query.update(record).eq("id", body.id).select().single() : await query.insert(record).select().single();
    if (result.error) throw result.error;
    if (status === "published") await dispatchRebuild();
    return json(req, { article: result.data });
  } catch (error) { console.error(error); return json(req, { error: error instanceof Error ? error.message : "Unexpected server error." }, 500); }
});
