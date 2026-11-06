/** Reproduce the embedded engine from a verified upstream checkout.
 * Usage: node scripts/vendor_longmemory.mjs /path/to/LongMemory
 * The adapter selects the memory-only profile; no upstream server/connectors,
 * credential discovery, external model, or independent SQLite store is shipped.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
const upstream = path.resolve(process.argv[2] || "");
const commit = "8badf44d48d0d72a07e1ea3daf1ecbd76ae1a357";
if (!process.argv[2] || execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], {encoding:"utf8"}).trim() !== commit)
  throw new Error("Supply the exact pinned LongMemory checkout");
const output = new URL("../packages/memory/vendor/", import.meta.url);
await mkdir(output, {recursive:true});
const result = await build({
  entryPoints:[path.join(upstream,"src/core/create_memory.ts")],
  outfile:new URL("longmemory.mjs",output).pathname,
  platform:"node", target:"node24", format:"esm", bundle:true, minify:true,
  legalComments:"inline", metafile:true,
  plugins:[{name:"canonical-memory-store",setup(b){
    b.onResolve({filter:/stores\/sqlite\/sqlite_store\.js$/},()=>({path:new URL("../packages/memory/sqlite-profile.mjs",import.meta.url).pathname}));
    b.onResolve({filter:/^stemmer$/},()=>({path:new URL("../node_modules/stemmer/index.js",import.meta.url).pathname}));
  }}],
});
await copyFile(path.join(upstream,"LICENSE"),new URL("LICENSE-LongMemory.txt",output));
await copyFile(new URL("../node_modules/stemmer/license",import.meta.url),new URL("LICENSE-stemmer.txt",output));
await writeFile(new URL("provenance.json",output),JSON.stringify({
  upstream:"https://github.com/CaviraOSS/LongMemory",commit,license:"Apache-2.0",
  entry:"src/core/create_memory.ts",profile:"memory-only, authorized rebuildable projection",
  adaptation:"SQLite store import resolves to the explicitly unsupported adapter; the upstream in-memory engine is otherwise unchanged.",
  files:Object.keys(result.metafile.inputs).map(p=>{const absolute=path.resolve(p);return absolute.startsWith(upstream+path.sep)?path.relative(upstream,absolute):absolute.startsWith(path.resolve("node_modules")+path.sep)?path.relative(path.resolve("node_modules"),absolute):p.replace(/^.*packages\/memory\//,"packages/memory/");}),
},null,2)+"\n");
console.log("Pinned LongMemory embedded engine built.");
