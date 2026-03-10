import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PICNIC_BASE = "https://storefront-prod.nl.picnicinternational.com/api/15";

const PICNIC_HEADERS: Record<string, string> = {
  "User-Agent": "okhttp/3.12.2",
  "Content-Type": "application/json; charset=UTF-8",
};

const PICNIC_EXTRA_HEADERS: Record<string, string> = {
  "x-picnic-agent": "30100;1.15.232-15154",
  "x-picnic-did": "3C417201548B2E3B",
};

/**
 * MD5 hash using Deno std crypto (WebCrypto doesn't support MD5).
 * Picnic requires password to be MD5-hashed before sending.
 */
async function md5(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, password, authKey, searchTerm, productId, count } =
      await req.json();

    // ──────────────────────────────────────────────
    // ACTION: login
    // ──────────────────────────────────────────────
    if (action === "login") {
      if (!email || !password) {
        return jsonResponse({ error: "Email and password are required" }, 400);
      }

      const secret = await md5(password);

      const res = await fetch(`${PICNIC_BASE}/user/login`, {
        method: "POST",
        headers: PICNIC_HEADERS,
        body: JSON.stringify({ key: email, secret, client_id: 30100 }),
      });

      if (!res.ok) {
        const err = await res.text();
        return jsonResponse(
          { error: `Picnic login failed: ${err}` },
          res.status
        );
      }

      const picnicAuth = res.headers.get("x-picnic-auth");
      if (!picnicAuth) {
        return jsonResponse({ error: "No auth key received from Picnic" }, 500);
      }

      const data = await res.json();
      return jsonResponse({
        authKey: picnicAuth,
        userId: data.user_id,
        secondFactorRequired: data.second_factor_authentication_required,
      });
    }

    // ──────────────────────────────────────────────
    // ACTION: search
    // ──────────────────────────────────────────────
    if (action === "search") {
      if (!authKey || !searchTerm) {
        return jsonResponse({ error: "authKey and searchTerm are required" }, 400);
      }

      const res = await fetch(
        `${PICNIC_BASE}/pages/search-page-results?search_term=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: {
            ...PICNIC_HEADERS,
            ...PICNIC_EXTRA_HEADERS,
            "x-picnic-auth": authKey,
          },
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return jsonResponse({ error: `Picnic search failed: ${err}` }, res.status);
      }

      const raw = await res.json();

      // Extract selling units from the nested response (same approach as picnic-api)
      const products = extractSellingUnits(raw);
      return jsonResponse({ products });
    }

    // ──────────────────────────────────────────────
    // ACTION: addToCart
    // ──────────────────────────────────────────────
    if (action === "addToCart") {
      if (!authKey || !productId) {
        return jsonResponse({ error: "authKey and productId are required" }, 400);
      }

      const res = await fetch(`${PICNIC_BASE}/cart/add_product`, {
        method: "POST",
        headers: {
          ...PICNIC_HEADERS,
          "x-picnic-auth": authKey,
        },
        body: JSON.stringify({ product_id: productId, count: count || 1 }),
      });

      if (!res.ok) {
        const err = await res.text();
        return jsonResponse({ error: `Add to cart failed: ${err}` }, res.status);
      }

      const data = await res.json();
      return jsonResponse({ success: true, cart: data });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (error: unknown) {
    console.error("Picnic proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Recursively extract sellingUnit objects from the Picnic search response.
 * The response structure is deeply nested; we walk the tree looking for sellingUnit keys.
 */
function extractSellingUnits(obj: any): any[] {
  const results: any[] = [];

  function walk(node: any) {
    if (!node || typeof node !== "object") return;
    if (node.sellingUnit) {
      results.push(node.sellingUnit);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else {
      Object.values(node).forEach(walk);
    }
  }

  walk(obj);
  return results;
}
