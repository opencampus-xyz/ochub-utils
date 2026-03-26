/**
 * Reads id_token and access_token from the URL hash fragment and writes
 * them to localStorage so the OCConnect SDK picks them up on init.
 *
 * Call this **before** OCConnect mounts (e.g. at module scope in your
 * providers file). It is safe to call in SSR — it no-ops when
 * `window` is not available.
 */
export function injectHashTokens(): void {
  if (typeof window === 'undefined') return;

  const hash = new URLSearchParams(window.location.hash.slice(1));
  const idToken = hash.get('id_token');
  const accessToken = hash.get('access_token');

  if (!idToken || !accessToken) return;

  const payload = JSON.parse(atob(idToken.split('.')[1]));
  localStorage.setItem(
    'oc-token-storage',
    JSON.stringify({
      id_token: idToken,
      access_token: accessToken,
      expired: payload.exp,
    }),
  );
}
