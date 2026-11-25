import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const htmlFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

test('all root-relative local assets referenced by HTML exist in the deployment package', () => {
  const missing = [];
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/(?:src|href)=["'](\/(?:assets|favicon)[^"']*)["']/gi)) {
      const path = decodeURIComponent(match[1].split(/[?#]/)[0]);
      if (!existsSync(resolve(root, `.${path}`))) missing.push(`${file}: ${path}`);
    }
  }
  assert.deepEqual(missing, [], `Missing local asset references:\n${missing.join('\n')}`);
});

test('homepage clinic structured data uses typed entities and parses as JSON', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length >= 1);
  const graph = scripts.map(m => JSON.parse(m[1])).find(x => Array.isArray(x['@graph']));
  assert.ok(graph, 'Expected a connected JSON-LD graph');
  const types = graph['@graph'].map(x => x['@type']);
  assert.ok(types.includes('MedicalClinic'));
  assert.ok(types.includes('Person'));
  assert.ok(types.includes('WebSite'));
});

test('French and Arabic article/video hubs expose crawlable explanatory content', () => {
  const article = readFileSync(join(root, 'articles/index.html'), 'utf8');
  const videos = readFileSync(join(root, 'videos/index.html'), 'utf8');
  const arabicHome = readFileSync(join(root, 'ar/index.html'), 'utf8');
  const arabicAesthetic = readFileSync(join(root, 'ar/medecine-esthetique-tanger/index.html'), 'utf8');
  assert.match(article, /bibliothèque rassemble des informations générales/i);
  assert.match(videos, /darija marocaine/i);
  assert.match(arabicHome, /استشارة جلدية قريبة من وسط مدينة طنجة/);
  assert.match(arabicAesthetic, /تقييم البشرة واختيار الإجراء المناسب/);
});

test('Windows deployment scripts use the existing Pages project and run tests first', () => {
  const deploy = readFileSync(join(root, 'DEPLOY-CLOUDFLARE.bat'), 'utf8');
  assert.match(deploy, /npm test/);
  assert.match(deploy, /npm run check/);
  assert.match(deploy, /pages deploy \. --project-name=dermtanger/);
  const preview = readFileSync(join(root, 'START-LOCAL-PREVIEW.bat'), 'utf8');
  assert.match(preview, /http.server 8080/);
});


test('D1 migration helper validates the existing database and exports before migration', () => {
  const bat = readFileSync(join(root, 'APPLY-D1-MIGRATIONS-WINDOWS.bat'), 'utf8');
  assert.match(bat, /f66b8595-d025-44e5-bc89-a32f69909509/);
  assert.ok(bat.indexOf('d1 export dermatologue-tanger-cms --remote') < bat.indexOf('d1 migrations apply dermatologue-tanger-cms --remote'));
  assert.match(bat, /d1-backup-before-migrations\.sql/);
  assert.match(bat, /cms_articles/);
  assert.match(bat, /cms_videos/);
  assert.match(bat, /cms_audit_log/);
});
