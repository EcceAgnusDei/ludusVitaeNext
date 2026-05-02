import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL?.trim();
const password = process.env.E2E_USER_PASSWORD?.trim();

test.describe("Parcours grille → Mon espace", () => {
  test.beforeEach(() => {
    test.skip(
      !email || !password,
      "Définissez E2E_USER_EMAIL et E2E_USER_PASSWORD (compte de test existant en base).",
    );
  });

  test("connexion, enregistrement en base, affichage du nom dans Mon espace", async ({
    page,
  }) => {
    const gridName = `e2e-${Date.now()}`;

    await page.goto("/");

    const signInButton = page.getByRole("button", { name: "Se connecter" });
    await expect(signInButton).toBeVisible({
      timeout: 60_000,
    });
    await signInButton.click();
    const signInDialog = page.getByRole("dialog", { name: "Se connecter" });
    await expect(signInDialog).toBeVisible();

    await signInDialog.locator("#signin-email").fill(email!);
    await signInDialog.locator("#signin-password").fill(password!);
    await signInDialog.getByRole("button", { name: "Connexion" }).click();

    await expect(page.getByRole("button", { name: "Déconnexion" })).toBeVisible(
      { timeout: 30_000 },
    );

    await page.goto("/jeu");

    const saveToDb = page.getByRole("button", { name: "Enregistrer en base" });
    await expect(saveToDb).toBeVisible({ timeout: 30_000 });
    await saveToDb.click();

    const saveDialog = page.getByRole("dialog", {
      name: "Enregistrer la grille",
    });
    await expect(saveDialog).toBeVisible();
    await saveDialog.getByLabel("Nom (facultatif)").fill(gridName);
    await saveDialog.getByRole("button", { name: "Enregistrer" }).click();

    const successDialog = page.getByRole("dialog", {
      name: "Enregistrement réussi",
    });
    await expect(successDialog).toBeVisible({ timeout: 30_000 });
    await expect(
      successDialog.getByText("La grille a été enregistrée avec succès."),
    ).toBeVisible();
    await successDialog.getByRole("button", { name: "Fermer" }).click();

    await page.goto("/mon-espace");

    await expect(page.getByText(gridName, { exact: true })).toBeVisible({
      timeout: 30_000,
    });
  });
});
