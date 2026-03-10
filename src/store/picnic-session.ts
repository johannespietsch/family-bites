/**
 * In-memory Picnic session store.
 * Credentials are never persisted — the user must log in each session.
 */

let session: { authKey: string; userId?: string } | null = null;

export function getPicnicSession() {
  return session;
}

export function setPicnicSession(s: { authKey: string; userId?: string }) {
  session = s;
}

export function clearPicnicSession() {
  session = null;
}

export function isPicnicConnected() {
  return session !== null;
}
