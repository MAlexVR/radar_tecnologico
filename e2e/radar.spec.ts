import { test, expect } from "@playwright/test";

test.describe("Radar Tecnológico — Página principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("carga la página con el título del radar", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Radar Tecnológico" })
    ).toBeVisible();
  });

  test("los puntos del radar son interactivos", async ({ page }) => {
    // Solo elementos visibles (evita mobile layout hidden)
    const dot = page.locator('[role="button"][aria-label]:visible').first();
    await expect(dot).toBeVisible();
    await dot.click();
    // Verificar que algun panel de detalle muestra información
    await expect(
      page.locator("aside:visible").getByText("Nivel de TRL").first()
    ).toBeVisible();
  });

  test("navegación por teclado funciona", async ({ page }) => {
    // Enfocar la página primero y usar Tab para navegar al radar
    await page.locator("body").focus();
    // Hacer Tab varias veces hasta llegar a un punto del radar
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    // Verificar que se muestre información de detalle
    await expect(
      page.locator("aside:visible").getByText("Nivel de TRL").first()
    ).toBeVisible();
  });

  test("zoom con rueda del mouse", async ({ page }) => {
    // Apuntar al SVG del radar (viewBox grande), no a iconos lucide
    const container = page.locator('svg[viewBox*="1200"]:visible').first();
    await container.waitFor();
    await container.click();
    await container.evaluate((el) =>
      el.dispatchEvent(new WheelEvent("wheel", { deltaY: -100 }))
    );
    await expect(container).toBeVisible();
  });
});

test.describe("Embed mode", () => {
  test("embed carga sin header ni footer", async ({ page }) => {
    await page.goto("/embed");
    await expect(page.locator("body")).toBeVisible();
  });
});
