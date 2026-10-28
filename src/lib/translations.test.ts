import assert from "node:assert/strict";
import test from "node:test";
import { translate } from "./translations";
test("Testeo de cambio de idioma", () => {
  assert.equal(translate("Catálogo", "es"), "Catálogo");
  assert.equal(translate("Catálogo", "en"), "Catalog");
  assert.equal(translate("Arroz integral", "en"), "Arroz integral");
  assert.equal(translate("Motivo de rechazo: escribe un valor de hasta 1000 caracteres", "en"), "Rejection reason: enter up to 1000 characters");
});
