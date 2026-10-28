
let refreshing: Promise<boolean> | null = null;
export async function sessionFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (response.status !== 401) return response;
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" }).then((r) => r.ok).catch(() => false).finally(() => { refreshing = null; });
  return await refreshing ? fetch(url, options) : response;
}
export async function clientApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await sessionFetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No se pudo completar la operación");
  return data as T;
}
