<script setup lang="ts">
// Иллюстрация грузового момента у формулы тарифа (визуальный якорь секции #tarif).
//
// Почему это не декор: сайт уже объясняет текстом (FAQ на главной, /park/,
// /blog/gruzovoy-moment-kak-schitat/), что грузовой момент — произведение массы
// груза на вылет стрелы, и что именно поэтому у самой мощной КМУ парка (22,4 т·м)
// почти самый короткий вылет. Схема делает эту зависимость видимой, а не добавляет
// новый факт. Числа на схеме не подписаны конкретной моделью намеренно: сама
// формула — общая физика КМУ, а не характеристика одной машины (те уже есть
// в таблице парка).
//
// Лёгкий скролл-параллакс: только translateY через transform (без влияния на
// layout → без CLS), отключается при prefers-reduced-motion (JS-проверка + CSS-
// дублирующий фолбэк). Компонент используется один раз, на главной, и монтируется
// заново при каждом переходе на страницу (обычный жизненный цикл Vue-компонента) —
// поэтому, в отличие от ГЛОБАЛЬНОГО плагина scroll-reveal.client.ts, никакой
// гонки с 'app:suspense:resolve' здесь нет и быть не может: onMounted всегда
// вызывается после того, как этот конкретный узел уже в DOM.
import { onMounted, onUnmounted, ref } from 'vue'

const el = ref<HTMLElement | null>(null)
let ticking = false
let reduced = false
let mq: MediaQueryList | null = null

function onScroll() {
  if (reduced || !el.value) return
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    if (!el.value) return
    const rect = el.value.getBoundingClientRect()
    const vh = window.innerHeight || 1
    // -1 (элемент у нижнего края экрана) .. 1 (у верхнего), 0 — по центру
    const progress = (rect.top + rect.height / 2 - vh / 2) / vh
    const clamped = Math.max(-1, Math.min(1, progress))
    el.value.style.transform = `translateY(${(clamped * -12).toFixed(1)}px)`
  })
}

function applyMotionPreference() {
  reduced = !!mq?.matches
  if (reduced) {
    if (el.value) el.value.style.transform = 'none'
  } else {
    onScroll()
  }
}

onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  applyMotionPreference()
  mq.addEventListener('change', applyMotionPreference)
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  mq?.removeEventListener('change', applyMotionPreference)
})
</script>

<template>
  <div class="torque">
    <div ref="el" class="torque__panel" aria-hidden="true">
      <svg viewBox="0 0 300 200" focusable="false">
        <title>Схема грузового момента: вылет стрелы L и масса груза G</title>
        <line x1="14" y1="168" x2="222" y2="168" style="stroke:var(--line);stroke-width:2" />
        <rect x="22" y="140" width="26" height="28" rx="4" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:2" />
        <line x1="35" y1="140" x2="204" y2="62" style="stroke:var(--accent);stroke-width:6" stroke-linecap="round" />
        <circle cx="204" cy="62" r="7" style="fill:var(--card);stroke:var(--accent-ink);stroke-width:3" />
        <line x1="204" y1="69" x2="204" y2="102" style="stroke:var(--accent-ink);stroke-width:2.5" />
        <rect x="182" y="102" width="44" height="34" rx="5" style="fill:var(--card);stroke:var(--accent-ink);stroke-width:2.5" />
        <text x="204" y="124" text-anchor="middle" font-size="16" font-weight="700" style="fill:var(--accent-ink);font-family:var(--display)">G</text>
        <line x1="35" y1="184" x2="204" y2="184" style="stroke:var(--muted);stroke-width:1.6" marker-start="url(#torqueArrowStart)" marker-end="url(#torqueArrowEnd)" />
        <text x="119" y="199" text-anchor="middle" font-size="13" font-weight="700" style="fill:var(--muted);font-family:var(--display)">L — вылет</text>
        <defs>
          <marker id="torqueArrowEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" style="fill:var(--muted)" />
          </marker>
          <marker id="torqueArrowStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M10 0 L0 5 L10 10 Z" style="fill:var(--muted)" />
          </marker>
        </defs>
      </svg>
    </div>
    <p class="torque__formula">
      Грузовой момент: <b>M = G × L</b> — масса груза (G) на вылете стрелы (L), т·м.
      Чем дальше нужно достать, тем меньше остаётся грузоподъёмности на конце — это же
      число решает, какая машина попадёт в <NuxtLink to="/park/">таблицу парка</NuxtLink>
      под ваш груз.
    </p>
  </div>
</template>

<style scoped>
.torque { display: grid; gap: 14px; }
.torque__panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 16px;
  will-change: transform;
}
.torque__panel svg { display: block; width: 100%; height: auto; }
.torque__formula { font-size: var(--fs-sm); color: var(--muted); max-width: 42ch; }
.torque__formula b { color: var(--accent-ink); font-family: var(--display); }
.torque__formula a { color: var(--accent-ink); font-weight: 700; }

@media (prefers-reduced-motion: reduce) {
  .torque__panel { transform: none !important; }
}
</style>
