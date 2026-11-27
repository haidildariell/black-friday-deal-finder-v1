// DealSleuth entry program (Node 22, standard library only).
//
// The site itself lives in app/ as plain static files: index.html plus its
// stylesheet, deal data and app logic, with no build step and no network
// request. The screenshots in screenshots/ are real renders of that site.
//
// This program hands the entry in. It copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json there,
// the summary the judge reads, built with the vendored make.fun library.
// vendor/makefun-frontend.ts is the kit's copy, left exactly as shipped.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copyTree(name) {
  const from = join(repoRoot, name);
  if (!existsSync(from)) return;
  cpSync(from, join(outDir, name), { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree("app");
copyTree("screenshots");

// Gate caps for this competition: at most 4 screenshots of 256 KiB each,
// app/ at most 993 files and 16 MiB, and the dossier text at most 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
