/** Follow the actual menu for secondary screens; primary tabs stay directly available. */
export async function navigateSurface(page, name) {
  const direct = page.getByRole("button", { name, exact: true });
  if (await direct.isVisible()) return direct.click();
  await page
    .getByRole("navigation", { name: "Main", exact: true })
    .getByRole("button", { name: "Today", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name, exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}
