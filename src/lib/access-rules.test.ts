import assert from "node:assert/strict";
import test from "node:test";
import { canAccessPath, safeReturnPath } from "./access-rules";
test("Testeo de la proteccion de rutas", () => {
  for (const path of ["https://evil.invalid", "//evil.invalid", "/\\evil.invalid", "/products", "/requestevil", null]) assert.equal(safeReturnPath(path), "/dashboard");
  assert.equal(safeReturnPath("/request/create?productId=rice"), "/request/create?productId=rice");
});
test("Validacion de la funcionalidad del proxy", () => {
  assert.equal(canAccessPath("/admin", "DONANTE"), false);
  assert.equal(canAccessPath("/admin", "ADMINISTRADOR"), true);
  assert.equal(canAccessPath("/donation/1/edit", "BENEFICIARIO"), false);
  assert.equal(canAccessPath("/donation/create", "DONANTE"), true);
  assert.equal(canAccessPath("/request/create", "DONANTE"), false);
  assert.equal(canAccessPath("/dashboard", "unknown"), false);
});
