// Волна приёмки (26.08.2026). Генерация WebP-вариантов рядом с исходными JPEG.
//
// Зачем: критерий img-modern-formats. На сайте три растровых файла и ни одного
// современного формата — при том что sharp уже стоит в devDependencies с Волны 105.
//
// Правила, которые скрипт соблюдает и которые важнее самой конвертации:
//  · исходник НЕ удаляется и НЕ перезаписывается — он остаётся фолбэком в <img src>;
//  · если WebP получился не меньше оригинала, он удаляется, а разметка остаётся
//    с одним <img>. На фотографиях WebP почти всегда выигрывает, на схемах и
//    скриншотах — нет, и подсовывать более тяжёлый файл «ради галочки» бессмысленно;
//  · размеры (width/height) не меняются: <picture> обязан отдавать оба источника
//    одного размера, иначе вёрстка прыгает при смене формата.
//
// Запуск: node scripts/make-webp.mjs  (из директории app)
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'public/images';
const QUALITY = 80;

// Постер <video> в конвертацию не идёт сознательно. У атрибута poster нет
// механизма выбора формата: <picture> вокруг него не поставишь, и переключение
// на WebP — решение «всё или ничего» для всех браузеров сразу. Ради 59 КБ на
// декоративном фоновом видео такой размен не нужен; JPEG остаётся.
const SKIP = ['public/images/hero/hero-timber-poster.jpg'];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (['.jpg', '.jpeg', '.png'].includes(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

const norm = (p) => p.split('\\').join('/');
const files = walk(ROOT).filter((p) => !SKIP.includes(norm(p)));
if (files.length === 0) {
  console.log('Растровых исходников в public/images не найдено.');
  process.exit(0);
}

for (const src of files) {
  const out = src.replace(/\.(jpe?g|png)$/i, '.webp');
  const meta = await sharp(src).metadata();
  await sharp(src).webp({ quality: QUALITY, effort: 6 }).toFile(out);
  const a = statSync(src).size;
  const b = statSync(out).size;
  if (b >= a) {
    unlinkSync(out);
    console.log(`${src}: WebP вышел ${(b / 1024).toFixed(0)} КБ против ${(a / 1024).toFixed(0)} КБ — удалён, остаётся оригинал`);
  } else {
    console.log(`${src} (${meta.width}×${meta.height}): ${(a / 1024).toFixed(0)} КБ → ${(b / 1024).toFixed(0)} КБ WebP (−${(100 - (b / a) * 100).toFixed(0)}%)`);
  }
}
