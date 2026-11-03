/** Compact distribution builder. Runtime code is bundled; native SQLite stays
 * external. Source-relative asset paths retain their relocatable logical URLs. */
import { build } from "esbuild";
import { builtinModules, createRequire } from "node:module";
import {
  readFile,
  writeFile,
  mkdir,
  cp,
  readdir,
  realpath,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = path.resolve(
  process.argv[2] || path.join(root, "dist/compact-host"),
);
if (output === root || root.startsWith(output + path.sep))
  throw Error("Choose a separate output directory under this repository");
const externals = ["@libsql/client", "xxhash-wasm"];
const inputs = new Set(),
  packages = new Map();
const ignored = /\.(?:map|d\.(?:ts|cts|mts))$/;
await mkdir(output, { recursive: true });
for (const relative of [
  "scripts/aksara.mjs",
  "packages/gateway/mcp.mjs",
  "packages/runtime-pi/worker.mjs",
]) {
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  const result = await build({
    absWorkingDir: root,
    entryPoints: [relative],
    outfile: destination,
    platform: "node",
    target: "node24",
    format: "esm",
    bundle: true,
    minify: true,
    external: externals,
    banner: {
      js: 'import {createRequire as __aksaraRequire} from "node:module"; const require=__aksaraRequire(import.meta.url);',
    },
    metafile: true,
    logLevel: "warning",
    legalComments: "none",
    plugins: [
      {
        name: "relocatable-project-assets",
        setup(builder) {
          builder.onLoad({ filter: /\.mjs$/ }, async ({ path: source }) => {
            if (
              !source.startsWith(root + path.sep) ||
              source.includes(path.sep + "node_modules" + path.sep)
            )
              return;
            const logical = path.relative(root, source);
            let reference = path
              .relative(path.dirname(relative), logical)
              .split(path.sep)
              .join("/");
            if (!reference.startsWith(".")) reference = "./" + reference;
            const contents = (await readFile(source, "utf8")).replace(
              /\bimport\.meta\.url\b/g,
              `new URL(${JSON.stringify(reference)},import.meta.url).href`,
            );
            return { contents, loader: "js", resolveDir: path.dirname(source) };
          });
        },
      },
    ],
  });
  for (const source of Object.keys(result.metafile.inputs))
    inputs.add(path.resolve(root, source));
  const unexpected = Object.values(result.metafile.outputs)
    .flatMap((x) => x.imports)
    .filter(
      (x) =>
        x.external &&
        !builtinModules.includes(x.path) &&
        !x.path.startsWith("node:") &&
        !externals.includes(x.path) &&
        !["bufferutil", "utf-8-validate"].includes(x.path),
    );
  if (unexpected.length)
    throw Error(
      "Unpackaged runtime dependency: " +
        unexpected.map((x) => x.path).join(", "),
    );
}
// Preserve normal Node native-addon resolution, including installed platform
// optional packages. No UI packages or build toolchain are shipped.
async function locate(name, from) {
  for (let dir = from; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, "node_modules", name, "package.json");
    try {
      return path.dirname(await realpath(candidate));
    } catch {}
    if (path.dirname(dir) === dir)
      throw Error("Missing runtime package " + name);
  }
}
const copied = new Set();
async function copyPackage(name, from, optional = false) {
  let source;
  try {
    source = await locate(name, from);
  } catch (error) {
    if (optional) return;
    throw error;
  }
  if (copied.has(source)) return;
  copied.add(source);
  const metadata = JSON.parse(
    await readFile(path.join(source, "package.json"), "utf8"),
  );
  const relative = path.relative(root, source);
  if (
    !relative.startsWith("node_modules" + path.sep) &&
    !relative.includes(path.sep + "node_modules" + path.sep)
  )
    throw Error("Unexpected external package location");
  await cp(source, path.join(output, relative), {
    recursive: true,
    filter: (file) =>
      !ignored.test(file) &&
      !file.includes(
        path.sep + "node_modules" + path.sep + "node_modules" + path.sep,
      ),
  });
  packages.set(source, metadata);
  for (const dep of Object.keys(metadata.dependencies || {}))
    await copyPackage(dep, source);
  for (const dep of Object.keys(metadata.optionalDependencies || {}))
    await copyPackage(dep, source, true);
}
for (const name of externals) await copyPackage(name, root);
// One complete notice file avoids hundreds of additional tiny extraction files.
for (const input of inputs) {
  let folder = path.dirname(input);
  while (folder.startsWith(root + path.sep)) {
    try {
      const metadata = JSON.parse(
        await readFile(path.join(folder, "package.json"), "utf8"),
      );
      if (metadata.name) {
        packages.set(folder, metadata);
        break;
      }
    } catch {}
    folder = path.dirname(folder);
  }
}
const inventory = [],
  notices = [];
for (const [folder, metadata] of [...packages].sort((a, b) =>
  a[1].name.localeCompare(b[1].name),
)) {
  const files = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    if (
      item.isFile() &&
      /^(?:license|copying|notice|copyright)/i.test(item.name)
    ) {
      files.push(item.name);
      notices.push(
        `\n===== ${metadata.name}@${metadata.version} / ${item.name} =====\n` +
          (await readFile(path.join(folder, item.name), "utf8")),
      );
    }
  }
  if (!metadata.license && !files.length)
    throw Error("Missing dependency license: " + metadata.name);
  inventory.push({
    name: metadata.name,
    version: metadata.version,
    license: metadata.license,
    files,
  });
}
await mkdir(path.join(output, "third_party/npm"), { recursive: true });
await writeFile(
  path.join(output, "third_party/npm/NOTICE.txt"),
  notices.join("\n"),
);
await writeFile(
  path.join(output, "third_party/npm/inventory.json"),
  JSON.stringify(inventory, null, 2) + "\n",
);
async function sizes(folder) {
  let files = 0,
    bytes = 0;
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const full = path.join(folder, item.name);
    if (item.isDirectory()) {
      const s = await sizes(full);
      files += s.files;
      bytes += s.bytes;
    } else if (item.isFile()) {
      files++;
      bytes += (await stat(full)).size;
    }
  }
  return { files, bytes };
}
console.log(
  JSON.stringify({
    output,
    ...(await sizes(output)),
    bundled_packages: inventory.length,
    external_packages: copied.size,
  }),
);
