import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('advice hub uses distinct descriptive article-card CTA anchors', () => {
  const html = read('conseils/index.html');
  assert.doesNotMatch(html, /<a class=["']read["'][^>]*>Lire cet article\s*→<\/a>/i);
  for (const phrase of ['guide sur l’acné adulte', 'causes de la chute de cheveux', 'causes des taches pigmentaires', 'protection solaire', 'cicatrices d’acné']) assert.match(html, new RegExp(phrase, 'i'));
});

test('Arabic language-switch footer anchors identify their specific French destination', () => {
  const files = ['ar/index.html', 'ar/dermatologie-medicale-tanger/index.html', 'ar/medecine-esthetique-tanger/index.html'];
  const html = files.map(read).join('\n');
  assert.doesNotMatch(html, /النسخة الفرنسية/);
  assert.match(html, /الصفحة الرئيسية باللغة الفرنسية/);
  assert.match(html, /صفحة الأمراض الجلدية بالفرنسية/);
  assert.match(html, /صفحة الطب التجميلي بالفرنسية/);
});

test('homepage brand anchor is concise while clinic descriptor remains visible outside the link', () => {
  const html = read('index.html');
  assert.match(html, /class="brand-lockup"/);
  assert.match(html, /class="brand-caption">Dermatologue · Tanger/);
  assert.doesNotMatch(html, /<a class="brand" href="\/">[\s\S]*?<small>Dermatologue · Tanger<\/small>/);
});

test('articles library has a distinct publication intent from the patient advice hub', () => {
  const articles = read('articles/index.html');
  const advice = read('conseils/index.html');
  assert.match(articles, /<title>Publications dermatologiques/);
  assert.match(articles, /<h1>Publications dermatologiques : dossiers pour les patients/);
  assert.match(advice, /<title>Conseils dermatologiques à Tanger/);
  assert.match(advice, /<h1[^>]*>Conseils dermatologiques à Tanger/);
  assert.doesNotMatch(articles, /<h1>Articles dermatologiques à Tanger/);
});

test('four thin pages now include additional page-specific information', () => {
  for (const [path, phrase] of [
    ['videos/index.html', 'Préparer une consultation à partir d’une vidéo'],
    ['ar/dermatologie-medicale-tanger/index.html', 'متابعة الحالة بعد الاستشارة'],
    ['conseils/cicatrices-acne/index.html', 'Préparer un échange sur les marques d’acné'],
    ['ar/contact/index.html', 'معلومات مفيدة قبل الاتصال بالعيادة']
  ]) assert.match(read(path), new RegExp(phrase));
});

test('articles hub resolves the latest Seobility content and meta findings', () => {
  const html = read('articles/index.html');
  const description = html.match(/<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']([^"']+)["'])[^>]*>/i)?.[1] || '';
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const text = main.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  assert.ok(description.length > 80 && description.length < 160, `Meta description should stay concise; got ${description.length} characters`);
  assert.match(h1, /Publications dermatologiques/i);
  assert.match(text, /publications dermatologiques/i, 'H1 phrase should appear naturally in body copy');
  assert.ok(text.split(/\s+/).length >= 500, `Expected at least 500 main-content words; got ${text.split(/\s+/).length}`);
});

test('appointment card on the advice hub uses a concise link instead of a whole-card anchor', () => {
  const html = read('conseils/index.html');
  assert.match(html, /<article class="post"><div aria-hidden="true" class="thumb[^>]*>RDV<\/div>/);
  assert.match(html, /<a class="read" href="\/#rendez-vous">Prendre rendez-vous au cabinet à Tanger →<\/a>/);
  assert.doesNotMatch(html, /<a class="post" href="\/#rendez-vous">[\s\S]*?Demander un rendez-vous au cabinet/);
});

test('clinic structured data has factual opening hours and no invented ratings', () => {
  const html = read('index.html');
  assert.match(html, /"openingHoursSpecification"/);
  assert.match(html, /"geo"/);
  assert.doesNotMatch(html, /"aggregateRating"|"review"/);
});

