/** Desktop rail or the focus-trapped phone drawer; wait through dialog dismissal. */
export async function navigateSurface(page, name) {
  const direct = page.getByRole("button", { name, exact: true });
  if (
    (await page.evaluate(() => innerWidth >= 768)) ||
    (await direct.isVisible())
  )
    return direct.click();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name, exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}
