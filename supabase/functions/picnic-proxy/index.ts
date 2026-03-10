// Picnic API proxy edge function v3 — pure JS MD5, no external deps
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// ─── Pure JS MD5 (RFC 1321) ───────────────────────────────────────────────
// Inlined to avoid any dependency issues in Supabase edge runtime.
function md5(str: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function binlMD5(x: number[], len: number) {
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = md5ff(a, b, c, d, x[i], 7, -680876936); d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819); b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897); d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341); b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416); d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063); b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682); d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290); b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510); d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713); b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691); d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335); b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438); d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961); b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467); d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473); b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5], 4, -378558); d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562); b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060); d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632); b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174); d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979); b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487); d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520); b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = md5ii(a, b, c, d, x[i], 6, -198630844); d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905); b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571); d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523); b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359); d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380); b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070); d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259); b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }

  function str2binl(str: string) {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << i % 32;
    }
    return bin;
  }

  function binl2hex(binarray: number[]) {
    const hexTab = "0123456789abcdef";
    let str = "";
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
        hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
    }
    return str;
  }

  // Encode to UTF-8 first
  const utf8 = unescape(encodeURIComponent(str));
  return binl2hex(binlMD5(str2binl(utf8), utf8.length * 8));
}
// ─── End MD5 ──────────────────────────────────────────────────────────────

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

      const secret = md5(password);

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

      // Extract selling units from the nested response
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
