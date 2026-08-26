// Волна приёмки (26.08.2026). Три вещи, которые `nuxt generate` не умеет сам.
//
// 1. 404.html. Генератор кладёт туда пустую SPA-оболочку, и это не настраивается
//    (список PRERENDER_NO_SSR_ROUTES в @nuxt/nitro-server захардкожен). Подменяем
//    оболочку на статическую страницу из public/404.html.
//
// 2. Заглушки-редиректы. routeRules с redirect при статической сборке
//    превращаются в HTML-файлы с <meta http-equiv="refresh">. Поисковик такую
//    заглушку индексирует как самостоятельную тонкую страницу — ровно тот
//    признак аффилиата, от которого сеть уходит. Дописываем в каждую noindex и
//    canonical на страницу-преемника, причём адрес преемника берётся из самой
//    заглушки, а не из второго списка, который разъедется с nuxt.config.
//
// 3. sitemap.xml. Раньше карта лежала в public/ и правилась руками — за неё уже
//    ловили пропущенные URL (Волна 116: не хватало 18 адресов). Теперь она
//    собирается из фактического дерева сборки, а lastmod берётся из mtime
//    ИСХОДНОГО .vue-файла страницы, а не из времени сборки. Проверяемость:
//    две сборки подряд без правок контента дают побайтово одинаковый sitemap.
//    changefreq и priority не выводятся вовсе — Google их игнорирует с 2023 года,
//    а Яндекс использует как слабую подсказку; писать в них выдуманные значения
//    смысла нет.
import { readdirSync, statSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = '.output/public';
const PAGES = 'app/pages';
const SITE = 'https://manipmo.ru';

const norm = (p) => p.split('\\').join('/');

function walk(dir, filter) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

// ─── 1. Статическая 404 вместо SPA-оболочки ─────────────────────────────────
{
  const src = 'public/404.html';
  const dst = join(OUT, '404.html');
  if (!existsSync(src)) throw new Error('Нет public/404.html — подменять 404 нечем');
  const before = existsSync(dst) ? statSync(dst).size : 0;
  copyFileSync(src, dst);
  console.log(`404.html: оболочка ${before} Б заменена статической страницей ${statSync(dst).size} Б`);
}

// ─── 2. noindex + canonical в заглушках-редиректах ──────────────────────────
const redirectPairs = [];
{
  const htmls = walk(OUT, (p) => p.endsWith('.html'));
  let patched = 0;
  for (const p of htmls) {
    let html = readFileSync(p, 'utf8');
    const m = html.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']\s*\d+\s*;\s*url=([^"']+)["']/i);
    if (!m) continue;
    const target = m[1].trim();
    const from = '/' + norm(relative(OUT, p)).replace(/index\.html$/, '');
    redirectPairs.push([from, target]);
    const add = [];
    if (!/<meta[^>]+name=["']robots["']/i.test(html)) {
      // follow, а не nofollow: вес по ссылке на преемника передать нужно,
      // в индексе быть — нет.
      add.push('<meta name="robots" content="noindex, follow">');
    }
    if (!/<link[^>]+rel=["']canonical["']/i.test(html)) {
      const abs = target.startsWith('http') ? target : SITE + target;
      add.push(`<link rel="canonical" href="${abs}">`);
    }
    if (!add.length) continue;
    html = html.replace(/<\/head>/i, `${add.join('')}</head>`);
    writeFileSync(p, html, 'utf8');
    patched++;
  }
  console.log(`Заглушки-редиректы: размечено noindex + canonical — ${patched} шт.`);
}

// ─── 3. sitemap.xml из дерева сборки, lastmod из mtime исходника ────────────
{
  const isStub = (html) => /http-equiv=["']refresh["']/i.test(html);
  const rows = [];
  for (const p of walk(OUT, (x) => x.endsWith('.html'))) {
    const rel = norm(relative(OUT, p));
    if (rel === '404.html' || rel === '200.html') continue;      // служебные, не страницы
    if (!rel.endsWith('index.html')) continue;
    const html = readFileSync(p, 'utf8');
    if (isStub(html)) continue;                                   // заглушки в карту не идут
    const dir = rel === 'index.html' ? '' : rel.slice(0, -'index.html'.length);
    const loc = `${SITE}/${dir}`;

    // Исходник страницы: /gruzy/konteyner/ → app/pages/gruzy/konteyner/index.vue
    const srcFile = join(PAGES, dir, 'index.vue');
    if (!existsSync(srcFile)) {
      console.warn(`  ! нет исходника для ${loc} — страница попадёт в карту без lastmod`);
      rows.push({ loc, lastmod: null });
      continue;
    }
    // Волна визуальной приёмки (26.08.2026). Здесь стояла обрезка до YYYY-MM-DD
    // с обоснованием «посекундная точность была бы ложной». Обрезка снята, и вот
    // почему: обе формы выводятся из ОДНОГО И ТОГО ЖЕ mtime, поэтому обрезка не
    // делает значение честнее — она делает его беднее. А когда весь раздел сайта
    // правится за одну волну (сейчас у 38 страниц mtime укладывается в семь минут:
    // 05:03:06, 05:06:18, 05:09:29 …), 38 РАЗНЫХ отметок схлопываются в одну
    // строку, и карта сайта начинает утверждать, что все страницы изменились
    // одновременно, — то есть ровно то ложное сообщение, которого обрезка
    // пыталась избежать. Полный W3C Datetime допускается sitemaps.org наравне
    // с датой и сохраняет различие, которое в исходниках реально есть.
    // Свойство «две сборки подряд без правок дают побайтово одинаковый sitemap»
    // сохраняется: mtime без правок не меняется.
    const d = new Date(statSync(srcFile).mtime);
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const p2 = (n) => String(Math.abs(n)).padStart(2, '0');
    const lastmod = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
      + `T${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`
      + `${sign}${p2(Math.trunc(off / 60))}:${p2(off % 60)}`;
    rows.push({ loc, lastmod });
  }
  rows.sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Собирается scripts/postbuild.mjs из фактического дерева сборки.',
    '     lastmod = дата последнего изменения исходного .vue страницы, не дата сборки:',
    '     повторная сборка без правок контента даёт этот же файл байт в байт. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows.map((r) => r.lastmod
      ? `  <url><loc>${r.loc}</loc><lastmod>${r.lastmod}</lastmod></url>`
      : `  <url><loc>${r.loc}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'sitemap.xml'), xml, 'utf8');
  const uniq = new Set(rows.map((r) => r.lastmod)).size;
  console.log(`sitemap.xml: ${rows.length} URL, различных lastmod — ${uniq}`);
}

// ─── 4. _redirects: настоящий 301 там, где хостинг это умеет ────────────────
// Заглушка с noindex + canonical из шага 2 работает на любом хостинге и потому
// остаётся основным решением. Этот файл — апгрейд для площадок, которые читают
// формат _redirects (Netlify, Cloudflare Pages): там же адреса начнут отдавать
// честный HTTP 301 вместо meta refresh, который передаёт вес хуже. Если хостинг
// формат не понимает, файл просто лежит без последствий. Список берётся из тех
// же заглушек, что и на шаге 2, — двух расходящихся источников правды нет.
{
  redirectPairs.sort((a, b) => a[0].localeCompare(b[0]));
  const width = Math.max(...redirectPairs.map((r) => r[0].length));
  const body = [
    '# Постоянные редиректы старых адресов. Сгенерировано scripts/postbuild.mjs',
    '# из заглушек, которые Nuxt создаёт по routeRules в nuxt.config.ts.',
    '# Формат понимают Netlify и Cloudflare Pages; на прочих хостингах те же',
    '# адреса обслуживаются заглушками с noindex + canonical.',
    '',
    ...redirectPairs.map(([from, to]) => `${from.padEnd(width)}  ${to}  301`),
    '',
  ].join('\n');
  writeFileSync(join(OUT, '_redirects'), body, 'utf8');
  console.log(`_redirects: ${redirectPairs.length} правил 301`);
}
