export function safeReturnPath(value: string | null | undefined) {
  if (!value || /[\\\u0000-\u001f]/.test(value)) return "/dashboard";
  return /^\/(dashboard|admin|donation|request)(\/|\?|$)/.test(value) ? value : "/dashboard";
}

export function canAccessPath(path: string, role: string) {
  if (path === "/admin" || path.startsWith("/admin/")) return role === "ADMINISTRADOR";
  if (path === "/donation" || path.startsWith("/donation/")) return role === "DONANTE";
  if (path === "/request" || path.startsWith("/request/")) return role === "BENEFICIARIO";
  return ["DONANTE", "BENEFICIARIO", "ADMINISTRADOR"].includes(role);
}
