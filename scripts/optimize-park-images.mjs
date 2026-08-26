// Волна 105: ресайз/сжатие скачанных
// исходников Wikimedia/Pexels до веб-разумных размеров. Исходники — 4128×2322 (Kanglim,
// Commons) и 6000×8000 (park-hero, Pexels), по 5.1–6.5 МБ каждый — публиковать в таком
// виде нельзя (LCP/трафик). Инструмент: sharp, mozjpeg, качество 78.
import sharp from 'sharp';
import { statSync } from 'node:fs';

// ВАЖНО: src===out — скрипт сжимает файл, который уже лежит в public/. Повторный
// запуск на уже обработанном файле означает повторное JPEG-сжатие (генерационные
// потери) без какой-либо пользы. Поэтому задание волны закомментировано сразу
// после того, как отработало один раз — раскомментировать только если нужно
// пересобрать конкретный файл заново из свежего оригинала в этом же пути.
const jobs = [
  // Волна 105 — уже обработаны, не перезапускать без свежего оригинала:
  // { src: 'public/images/park/kanglim-ks1256g-ii.jpg', out: 'public/images/park/kanglim-ks1256g-ii.jpg', width: 1280 },
  // park-hero: исходник ПОРТРЕТНЫЙ (6000×8000) — сайт показывает его как
  // bento-карточку рядом с текстом, а не полноширинным альбомным баннером,
  // поэтому 900 px по ширине (не 1920, как для альбомных исходников)
  // достаточно и для карточки, и для 2x-дисплеев.
  // { src: 'public/images/hero/park-hero.jpg', out: 'public/images/hero/park-hero.jpg', width: 900 },
];

for (const job of jobs) {
  const before = statSync(job.src).size;
  const buf = await sharp(job.src).rotate().resize({ width: job.width, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  await sharp(buf).toFile(job.out + '.tmp');
  const { renameSync } = await import('node:fs');
  renameSync(job.out + '.tmp', job.out);
  const after = statSync(job.out).size;
  console.log(`${job.src}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
}
