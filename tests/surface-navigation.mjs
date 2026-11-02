/** Responsive navigation preserves the active surface and unsent draft. */
export async function navigateSurface(page, name) {
  const direct = page.getByRole("button", { name, exact: true });
  if (
    (await page.evaluate(() => innerWidth >= 768)) ||
    (await direct.isVisible())
  )
    return direct.click();
  await page.getByRole("button", { name: "Spaces", exact: true }).click();
  const menu = page.locator(".spaces-menu");
  await menu
    .getByRole("button", {
      name: name === "Tools" ? "Capabilities" : name,
      exact: true,
    })
    .click();
  await menu.waitFor({ state: "hidden" });
}
