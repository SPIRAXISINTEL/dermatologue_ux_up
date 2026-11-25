import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
const roots = ["assets/js", "functions", "tests"];
const files = [];
function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) { const full = join(dir, entry.name); if (entry.isDirectory()) walk(full); else if (entry.isFile() && full.endsWith(".js")) files.push(full); } }
for (const root of roots) walk(root);
for (const file of files) { execFileSync(process.execPath, ["--check", file], { stdio: "inherit" }); }
console.log(`Syntax OK: ${files.length} JavaScript files.`);
