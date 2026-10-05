// CORS compartilhado entre as Edge Functions.
// Restringe a origem aos domínios conhecidos do app + portas de dev.
export const ALLOWED_ORIGINS = [
  "https://drive.rottasconstrutora.com.br",
  "http://localhost:8080", // porta real do Vite (vite.config.ts)
  "http://localhost:5173",
  "http://localhost:3000",
];

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
