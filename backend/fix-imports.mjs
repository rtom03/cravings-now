import fs from "node:fs";
import path from "node:path";

const SKIP = new Set(["node_modules", "dist", ".git"]);
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) =>
      SKIP.has(e.name)
        ? []
        : e.isDirectory()
          ? walk(path.join(d, e.name))
          : /\.tsx?$/.test(e.name)
            ? [path.join(d, e.name)]
            : [],
    );

const re =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}(?:\/[^"']*)?)\2/g;
const unresolved = [];

for (const file of walk(".")) {
  const src = fs.readFileSync(file, "utf8");
  const out = src.replace(re, (m, pre, q, spec) => {
    if (/\.(m?js|cjs|json)$/.test(spec)) return m;
    const base = path.resolve(path.dirname(file), spec);
    let fixed = null;
    if (fs.existsSync(base + ".ts") || fs.existsSync(base + ".tsx"))
      fixed = spec + ".js";
    else if (fs.existsSync(path.join(base, "index.ts")))
      fixed = spec.replace(/\/$/, "") + "/index.js";
    if (!fixed) {
      unresolved.push(`${file}: ${spec}`);
      return m;
    }
    return `${pre}${q}${fixed}${q}`;
  });
  if (out !== src) fs.writeFileSync(file, out);
}

console.log(
  unresolved.length
    ? "Unresolved:\n" + unresolved.join("\n")
    : "All imports fixed",
);
