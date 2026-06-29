import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandlerClerk,
} from "@clerk/mcp-tools/next";

// Protected Resource Metadata (RFC 9728): MCP クライアント(Claude)が
// 認可サーバ = Clerk を発見するための well-known エンドポイント。
const handler = protectedResourceHandlerClerk({
  scopes_supported: ["profile", "email"],
});
const corsHandler = metadataCorsOptionsRequestHandler();

export { corsHandler as OPTIONS, handler as GET };
