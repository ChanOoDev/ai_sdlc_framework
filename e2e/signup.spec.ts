import { test, expect } from "@playwright/test";

test.describe("Signup", () => {
  test("should display signup form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Create account" }).click();
    // HTML5 validation prevents submission
    await expect(page.getByLabel("Full Name")).toHaveAttribute("required");
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Login", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL("/signup");
  });
});

test.describe("Dashboard", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should redirect to login from doctors page", async ({ page }) => {
    await page.goto("/dashboard/doctors");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should redirect to login from patients page", async ({ page }) => {
    await page.goto("/dashboard/patients");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should redirect to login from consultations page", async ({ page }) => {
    await page.goto("/dashboard/consultations");
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Full Login Flow", () => {
  test.skip("should login and navigate to doctors page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill("admin1234");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Navigate to doctors
    await page.getByRole("link", { name: "Doctors" }).click();
    await expect(page).toHaveURL(/.*dashboard\/doctors/);
    await expect(page.getByText("Doctors")).toBeVisible();
  });
});
