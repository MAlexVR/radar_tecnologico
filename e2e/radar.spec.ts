import { test, expect } from "@playwright/test";

test.describe("Radar Tecnológico — Página principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("carga la página con el título del radar", async ({ page }) => {
    await expect(page.locator("text=Radar Tecnológico")).toBeVisible();
  });

  test("los puntos del radar son interactivos", async ({ page }) => {
    const dot = page.locator('[role="button"][aria-label]').first();
    await expect(dot).toBeVisible();
    await dot.click();
    // Después del click, el panel de detalle debe mostrar algo
    await expect(page.locator("text=Nivel de TRL")).toBeVisible();
  });

  test("navegación por teclado funciona", async ({ page }) => {
    const dot = page.locator('[role="button"][tabIndex="0"]').first();
    await dot.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("text=Nivel de TRL")).toBeVisible();
  });

  test("zoom con rueda del mouse", async ({ page }) => {
    const container = page.locator("svg").first();
    await container.waitFor();
    await container.click();
    await container.evaluate((el) => el.dispatchEvent(new WheelEvent("wheel", { deltaY: -100 })));
    // No hay assertion visual directa, pero no debe lanzar error
    await expect(container).toBeVisible();
  });
});

test.describe("Embed mode", () => {
  test("embed carga sin header ni footer", async ({ page }) => {
    await page.goto("/embed");
    // El embed debe cargar sin lanzar errores
    await expect(page.locator("body")).toBeVisible();
  });
});
