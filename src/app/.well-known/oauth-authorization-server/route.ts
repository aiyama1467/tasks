import {
  authServerMetadataHandlerClerk,
  metadataCorsOptionsRequestHandler,
} from "@clerk/mcp-tools/next";

// 認可サーバメタデータ (RFC 8414)。多くの MCP クライアントは認可サーバを
// MCP サーバと同じ origin で探すため、ここで Clerk の各エンドポイント
// (authorize / token / register) を広告して橋渡しする。
const clerkHandler = authServerMetadataHandlerClerk();

// Clerk は openid / public_metadata / offline_access などを scopes_supported に
// 含めるが、クライアント(Claude 等)はここから要求 scope を導出するため、
// DCR で登録したクライアントに付与されない scope を要求して invalid_scope に
// なる。このリソースで実際に使う scope だけに絞り、PRM 側と一致させる。
const ALLOWED_SCOPES = ["profile", "email"];

async function GET() {
  const res = await clerkHandler();
  const metadata = (await res.json()) as Record<string, unknown>;
  metadata.scopes_supported = ALLOWED_SCOPES;
  return Response.json(metadata, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "*",
      "cache-control": "max-age=3600",
    },
  });
}

const corsHandler = metadataCorsOptionsRequestHandler();

export { corsHandler as OPTIONS, GET };
