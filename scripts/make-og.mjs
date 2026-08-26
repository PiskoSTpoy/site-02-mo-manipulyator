// Волна приёмки (26.08.2026). Картинка для og:image.
//
// До этой волны ни одна страница сайта не отдавала og:image: ссылка на сайт в
// мессенджере или соцсети разворачивалась голым текстом. Нового изображения не
// заводим и ничего не рисуем «под бренд» — берём тот самый кадр, который уже
// стоит постером фонового видео на главной (Pexels License, автор указан на
// /park/), и кадрируем его под 1200×630. Это честно: в превью человек видит ту
// же картинку, что и на первом экране сайта.
//
// Запуск: node scripts/make-og.mjs  (из директории app)
import sharp from 'sharp';
import { statSync } from 'node:fs';

const SRC = 'public/images/hero/hero-timber-poster.jpg';
const OUT = 'public/images/og/manip-mo-og.jpg';

await sharp(SRC)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

console.log(`${OUT}: ${(statSync(OUT).size / 1024).toFixed(0)} КБ, 1200×630`);
