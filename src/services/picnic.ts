/**
 * Picnic API client — talks to our edge function proxy.
 *
 * Credentials are kept in-memory (per-session) and never stored persistently.
 * To improve Picnic product matching in the future:
 *   - Use fuzzy matching or NLP to map ingredient names → Picnic products
 *   - Let users pick from multiple search results
 *   - Cache product IDs for recurring ingredients
 */

import { supabase } from "@/integrations/supabase/client";

export interface PicnicProduct {
  id: string;
  name: string;
  imageUrl?: string;
  priceText?: string;
  unitQuantity?: string;
}

export interface PicnicSession {
  authKey: string;
  userId?: string;
}

const FUNCTION_NAME = "picnic";

/** Log in to Picnic and return a session auth key */
export async function picnicLogin(
  email: string,
  password: string
): Promise<PicnicSession> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { action: "login", email, password },
  });
  if (error) throw new Error(error.message || "Login request failed");
  if (data?.error) throw new Error(data.error);
  return { authKey: data.authKey, userId: data.userId };
}

/** Search for a product on Picnic */
export async function picnicSearch(
  authKey: string,
  searchTerm: string
): Promise<PicnicProduct[]> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { action: "search", authKey, searchTerm },
  });
  if (error) throw new Error(error.message || "Search request failed");
  if (data?.error) throw new Error(data.error);

  // Map raw Picnic selling units to our simplified type
  return (data.products || []).slice(0, 5).map((p: any) => ({
    id: p.id || p.product_id || "",
    name: p.name || p.display_name || "Unknown product",
    imageUrl: p.image_url,
    priceText: p.display_price,
    unitQuantity: p.unit_quantity,
  }));
}

/** Add a product to the Picnic shopping cart */
export async function picnicAddToCart(
  authKey: string,
  productId: string,
  count = 1
): Promise<void> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { action: "addToCart", authKey, productId, count },
  });
  if (error) throw new Error(error.message || "Add to cart failed");
  if (data?.error) throw new Error(data.error);
}

/**
 * Batch operation: search for each ingredient and add the first match to cart.
 */
export async function picnicSyncShoppingList(
  authKey: string,
  items: { name: string; quantity: number; unit: string }[],
  onProgress?: (current: number, total: number, itemName: string) => void
): Promise<{ added: string[]; failed: string[] }> {
  const added: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.(i + 1, items.length, item.name);

    try {
      const results = await picnicSearch(authKey, item.name);
      if (results.length === 0) {
        failed.push(item.name);
        continue;
      }
      await picnicAddToCart(authKey, results[0].id, 1);
      added.push(item.name);
    } catch {
      failed.push(item.name);
    }
  }

  return { added, failed };
}
