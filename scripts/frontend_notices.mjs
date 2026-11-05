import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
/** License closure of modules actually included in the frontend build. */
export function frontendNotices() {
  return {
    name: "aksara-frontend-notices",
    async generateBundle() {
      const folders = new Map();
      for (const id of this.getModuleIds()) {
        if (!id.includes("node_modules")) continue;
        let folder = path.dirname(id.split("?")[0]);
        while (folder.includes("node_modules")) {
          if (folders.has(folder)) break;
          try {
            const pkg = JSON.parse(
              await readFile(path.join(folder, "package.json"), "utf8"),
            );
            if (pkg.name) {
              folders.set(folder, pkg);
              break;
            }
          } catch {}
          const parent = path.dirname(folder);
          if (parent === folder) break;
          folder = parent;
        }
      }
      const inventory = [],
        texts = [];
      for (const [folder, pkg] of [...folders].sort((a, b) =>
        a[1].name.localeCompare(b[1].name),
      )) {
        const files = [];
        for (const item of await readdir(folder, { withFileTypes: true }))
          if (
            item.isFile() &&
            /^(license|copying|notice|copyright)/i.test(item.name)
          ) {
            files.push(item.name);
            texts.push(
              `\n===== ${pkg.name}@${pkg.version}: ${item.name} =====\n` +
                (await readFile(path.join(folder, item.name), "utf8")),
            );
          }
        if (!pkg.license && !files.length)
          throw Error(`Missing frontend license: ${pkg.name}`);
        inventory.push({
          name: pkg.name,
          version: pkg.version,
          license: pkg.license,
          repository: pkg.repository,
          files,
        });
      }
      texts.unshift(
        "Aksara frontend dependency notices. Dependencies retain their own licenses.\nBlockNote core/react/shadcn are unmodified MPL-2.0 dependencies; corresponding upstream source:\nhttps://github.com/TypeCellOS/BlockNote/tree/262fb815a25e892b7a6e4d06b63df19a9ae5d6a8\nAksara source and integration: https://github.com/yohn-maistre/aksara-core\n",
      );
      this.emitFile({
        type: "asset",
        fileName: "licenses/frontend-NOTICE.txt",
        source: texts.join("\n"),
      });
      this.emitFile({
        type: "asset",
        fileName: "licenses/frontend-inventory.json",
        source: JSON.stringify(inventory, null, 2) + "\n",
      });
    },
  };
}
