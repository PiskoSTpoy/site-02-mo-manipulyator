// Волна 123: сжатие скачанного оригинала
// фонового видео hero до веб-разумного размера + извлечение постера.
// ffmpeg-static вместо системного ffmpeg, до/после в консоли, с добавлением
// необязательной обрезки (trimStart/trimDuration) — источник этого сайта
// длиннее целевого лупа 8-20с, поэтому берём фрагмент, а не всё видео целиком.
//
// ВАЖНО: исходник — НЕ в public/. В раздачу уходит только сжатая версия.
// Источник (автор/лицензия/ссылка) см. content-plan.md, «Волна 123».
import { execFileSync } from 'node:child_process';
import { statSync, mkdirSync, existsSync } from 'node:fs';
import ffmpegPath from 'ffmpeg-static';

const jobs = [
  {
    src: 'scripts/source-assets/hero-timber-original.mp4',
    outVideo: 'public/videos/hero-timber.mp4',
    outPoster: 'public/images/hero/hero-timber-poster.jpg',
    // Оригинал 1920x1080/46с — не выше 1280px по широкой стороне (ТЗ).
    width: 1280,
    // Исходник длиннее целевого лупа (8-20с ТЗ): берём 14-секундный фрагмент
    // из середины ролика, где кран уже поднимает груз (не стартовый наезд
    // камеры и не хвост с отъездом).
    trimStart: '00:00:05',
    trimDuration: '00:00:14',
    posterAt: '00:00:02',
  },
];

for (const job of jobs) {
  if (!existsSync(job.src)) {
    console.error(`Пропуск: исходник не найден — ${job.src}. Скачайте оригинал в scripts/source-assets/ перед запуском.`);
    continue;
  }
  mkdirSync('public/videos', { recursive: true });
  mkdirSync('public/images/hero', { recursive: true });

  const before = statSync(job.src).size;

  const args = ['-y'];
  if (job.trimStart) args.push('-ss', job.trimStart);
  args.push('-i', job.src);
  if (job.trimDuration) args.push('-t', job.trimDuration);
  args.push(
    '-an',
    '-vf', `scale=${job.width}:-2:flags=lanczos`,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    job.outVideo,
  );

  execFileSync(ffmpegPath, args, { stdio: 'inherit' });

  // Постер — кадр из УЖЕ сжатого (и обрезанного) файла, тот же тайминг ленты.
  execFileSync(ffmpegPath, [
    '-y',
    '-ss', job.posterAt,
    '-i', job.outVideo,
    '-frames:v', '1',
    '-q:v', '3',
    job.outPoster,
  ], { stdio: 'inherit' });

  const afterVideo = statSync(job.outVideo).size;
  const afterPoster = statSync(job.outPoster).size;
  console.log(
    `${job.src}: ${(before / 1024 / 1024).toFixed(2)} MB -> ${job.outVideo}: ${(afterVideo / 1024 / 1024).toFixed(2)} MB` +
    ` | постер ${job.outPoster}: ${(afterPoster / 1024).toFixed(0)} KB`
  );
  if (afterVideo > 3 * 1024 * 1024) {
    console.warn(`ВНИМАНИЕ: ${job.outVideo} тяжелее 3 МБ (цель ТЗ — 2–3 МБ). Поднимите CRF (например 30–32) и перезапустите.`);
  }
}
