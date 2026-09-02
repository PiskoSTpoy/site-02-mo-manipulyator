<script setup lang="ts">
// AppBlogArticle — обёртка вокруг содержимого статьи блога, добавляет 3 UX-элемента:
//   1. reading-progress-bar сверху (fixed, scaleX по скроллу внутри <main>/<article>)
//   2. Table of contents (ToC) — если в статье ≥3 <h2>: desktop sticky-сайдбар справа,
//      mobile — collapsable <details>, встроенный сразу перед первым <h2> статьи
//   3. related-posts — 3 карточки других статей блога в конце
// Все элементы получают JS-мутации ТОЛЬКО после 'app:suspense:resolve', чтобы не
// повторить ту же гидратационную гонку, что была найдена и исправлена в scroll-reveal
// (см. plugins/scroll-reveal.client.ts и раздел «Волна 10» в content-plan.md).

import { ref, computed, onBeforeUnmount, onMounted, nextTick } from 'vue'

const props = defineProps<{
  currentHref: string
}>()

const nuxtApp = useNuxtApp()

// Статичный список всех статей блога (тот же, что в pages/blog/index.vue) —
// правда, а не выдуманные связи. Related = все, кроме текущей.
const ALL_POSTS: Array<{ href: string; title: string; excerpt: string }> = [
  {
    href: '/blog/propusk-mkad-ttk-gruzovik/',
    title: 'Пропуск на МКАД и ТТК для грузовиков',
    excerpt: 'Три зоны ограничения, порядок оформления через РНИС и mos.ru, штрафы и честное расхождение источников по порогу массы.',
  },
  {
    href: '/blog/gruzovoy-moment-kak-schitat/',
    title: 'Грузовой момент манипулятора — как считать',
    excerpt: 'Формула M = G × L на реальном примере — почему один вес груза без вылета стрелы не отвечает на вопрос, справится ли манипулятор.',
  },
  {
    href: '/blog/ohrannaya-zona-lep-manipulyator/',
    title: 'Манипулятор под проводами — почему короткая стрела не значит «безопасно»',
    excerpt: 'Вылет 7,53–18,7 м по паспортам парка, работа с борта и порог 30 метров из пункта 112 ФНП №461 — линии свыше 50 В, включая бытовые 0,4 кВ в СНТ.',
  },
  {
    href: '/blog/attestaciya-operatora-kmu/',
    title: 'Допуск оператора КМУ — чем он отличается от допуска крановщика',
    excerpt: 'Профстандарт 40.252, два независимых документа вместо одного, порог применимости ФНП в 4 т·м и приказ о назначении на конкретную машину.',
  },
  {
    href: '/blog/ustroystvo-kmu/',
    title: 'Устройство КМУ — стрела, узлы и ограничитель грузоподъёмности',
    excerpt: 'Два типа стрелы, из чего собрана установка и как ограничитель по ФНП №461 физически не даёт превысить паспортную грузовую диаграмму.',
  },
  {
    href: '/blog/komponovka-i-upravlenie-kmu/',
    title: 'За кабиной или сзади: компоновка и управление КМУ',
    excerpt: 'Расположение стрелы на шасси и способ управления — рычаги или радиоуправление — определяют, какой груз повезёт манипулятор.',
  },
  {
    href: '/blog/spetsrazreshenie-negabarit-manipulyator/',
    title: 'Спецразрешение на негабарит для манипулятора — когда оно нужно',
    excerpt: 'Крупногабаритный груз — это габариты сверх 12/20 м длины, 2,55 м ширины или 4 м высоты, а не масса. Отдельная от пропуска МКАД/ТТК разрешительная система.',
  },
]

const relatedPosts = computed(() =>
  ALL_POSTS.filter((p) => p.href !== props.currentHref).slice(0, 3),
)

const rootEl = ref<HTMLElement | null>(null)
const progressEl = ref<HTMLElement | null>(null)
const tocItems = ref<Array<{ id: string; text: string }>>([])
const activeId = ref('')

// Транслитерация кириллицы → латиница для человекочитаемых #якорей.
const TR: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(text: string, index: number): string {
  const lower = (text || '').toLowerCase()
  let out = ''
  for (const ch of lower) {
    if (Object.prototype.hasOwnProperty.call(TR, ch)) out += TR[ch]
    else if (/[a-z0-9]/.test(ch)) out += ch
    else out += '-'
  }
  out = out.replace(/-+/g, '-').replace(/^-|-$/g, '')
  // ограничиваем длину, чтобы URL был вменяемым
  if (out.length > 60) out = out.slice(0, 60).replace(/-[^-]*$/, '')
  return out || `toc-${index + 1}`
}

let rafId: number | null = null
let scrollHandler: (() => void) | null = null
let io: IntersectionObserver | null = null
let unhook: (() => void) | null = null
const cleanupFns: Array<() => void> = []

function updateProgress() {
  rafId = null
  if (!progressEl.value || !rootEl.value) return
  const main = rootEl.value.querySelector<HTMLElement>('main, article')
  if (!main) return
  const mainTop = main.getBoundingClientRect().top + window.scrollY
  const readable = main.offsetHeight - window.innerHeight
  if (readable <= 0) {
    progressEl.value.style.transform = 'scaleX(0)'
    return
  }
  const p = Math.min(1, Math.max(0, (window.scrollY - mainTop) / readable))
  progressEl.value.style.transform = `scaleX(${p})`
}

function onScroll() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(updateProgress)
}

function scrollToId(id: string, ev: Event) {
  const el = document.getElementById(id)
  if (!el) return
  ev.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
  // Без переноса фокуса клавиатурный пользователь после клика по оглавлению
  // остаётся в самом оглавлении: страница уехала, а следующий Tab продолжает
  // перебирать пункты ToC, а не содержимое раздела (WCAG 2.4.3).
  // Нативный переход по <a href="#id"> делает это сам, здесь preventDefault —
  // значит фокус переносим руками.
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

async function setup() {
  if (typeof window === 'undefined' || !rootEl.value) return

  const main = rootEl.value.querySelector<HTMLElement>('main, article')
  if (!main) return

  // Progressive enhancement: показываем progress-бар только после того, как JS проснулся.
  rootEl.value.classList.add('is-enhanced')

  // Собираем h2 из тела статьи (внутри <main>/<article>), пропускаем h2 из FAQ-заголовка
  // и «Оставить заявку» — они не являются секциями содержания статьи.
  // (На практике оставляем ВСЕ h2 внутри main — это и есть скелет статьи, включая FAQ.)
  const h2s = Array.from(main.querySelectorAll<HTMLHeadingElement>('h2'))
  const items: Array<{ id: string; text: string }> = []
  const usedIds = new Set<string>()
  h2s.forEach((h, i) => {
    if (!h.id) {
      let base = slugify(h.textContent || '', i)
      let candidate = base
      let n = 2
      while (usedIds.has(candidate) || document.getElementById(candidate)) {
        candidate = `${base}-${n++}`
      }
      h.id = candidate
    }
    usedIds.add(h.id)
    // чтобы якорь не «прятался» под sticky-nav (76px) + reading-progress (3px)
    h.style.scrollMarginTop = '96px'
    items.push({ id: h.id, text: (h.textContent || '').trim() })
  })

  tocItems.value = items.length >= 3 ? items : []

  // Скролл-подписка: reading-progress активна ВСЕГДА (в т.ч. под reduced-motion),
  // но у самого бара нет transition — заливка идёт rAF-обновлением transform.
  scrollHandler = onScroll
  window.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('resize', scrollHandler, { passive: true })
  updateProgress()

  // Ждём отрисовки ToC (v-if по tocItems), затем переносим mobile-details ToC внутрь
  // тела статьи, сразу перед первым h2 — чтобы визуально ToC был «в начале статьи»,
  // а не над хлебными крошками (в разметке компонента он лежит рядом со slot).
  if (items.length >= 3) {
    await nextTick()
    const mobileToc = rootEl.value.querySelector<HTMLElement>('.toc-mobile')
    const firstH2 = h2s[0]
    if (mobileToc && firstH2 && firstH2.parentNode) {
      firstH2.parentNode.insertBefore(mobileToc, firstH2)
    }

    // Highlight текущего h2 через IntersectionObserver — тот же зазор -100/-60%
    // даёт понятный «активный раздел» на десктоп-сайдбаре.
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
          if (visible.length) {
            visible.sort(
              (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
            )
            activeId.value = visible[0].id
          } else {
            // fallback: если ни один h2 не в rootMargin — считаем активным ближайший выше
            const scrollY = window.scrollY
            let closest = ''
            for (const h of h2s) {
              const top = h.getBoundingClientRect().top + scrollY
              if (top <= scrollY + 120) closest = h.id
              else break
            }
            if (closest) activeId.value = closest
          }
        },
        { rootMargin: '-100px 0px -60% 0px', threshold: 0 },
      )
      h2s.forEach((h) => io!.observe(h))
    }
  }

  cleanupFns.push(() => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler)
      window.removeEventListener('resize', scrollHandler)
      scrollHandler = null
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (io) {
      io.disconnect()
      io = null
    }
  })
}

// Регистрируем обработчик до того, как Suspense разрешится (setup() выполняется
// синхронно во время set-up фазы компонента, до mount, и hook вешается заранее).
unhook = nuxtApp.hook('app:suspense:resolve', () => {
  // nextTick, чтобы DOM slot-контента уже был выставлен
  nextTick(() => setup())
})

// ВАЖНО: 'app:suspense:resolve' срабатывает ТОЛЬКО на первой загрузке приложения.
// При внутренней SPA-навигации (клик по ссылке на статью из /blog/) он НЕ вызывается
// повторно — из-за этого оглавление не появлялось вовсе, h2 оставались без id
// (ломая якоря ToC), а полоса reading-progress стояла на нуле всю статью.
// Реальный баг этого Nuxt-паттерна, воспроизводился кликом из /blog/, здесь закрыт.
// nuxtApp.isHydrating гарантирует, что на ПЕРВОЙ загрузке setup() не вызовется дважды:
// там отработает хук выше, а этот onMounted-путь промолчит.
onMounted(() => {
  if (!nuxtApp.isHydrating) nextTick(() => setup())
})

onBeforeUnmount(() => {
  if (unhook) {
    unhook()
    unhook = null
  }
  cleanupFns.forEach((fn) => fn())
  cleanupFns.length = 0
})
</script>

<template>
  <div ref="rootEl" class="blog-article">
    <div ref="progressEl" class="reading-progress" aria-hidden="true"></div>

    <slot />

    <!-- Mobile ToC: рендерится здесь, JS-мутация перенесёт её в начало тела статьи -->
    <details v-if="tocItems.length >= 3" class="toc-mobile">
      <summary>Содержание · {{ tocItems.length }} {{ tocItems.length === 1 ? 'раздел' : tocItems.length < 5 ? 'раздела' : 'разделов' }}</summary>
      <nav aria-label="Содержание статьи">
        <ol class="toc-list">
          <li v-for="item in tocItems" :key="item.id" :class="{ 'is-active': item.id === activeId }">
            <a
              :href="`#${item.id}`"
              :aria-current="item.id === activeId ? 'location' : undefined"
              @click="scrollToId(item.id, $event)"
            >{{ item.text }}</a>
          </li>
        </ol>
      </nav>
    </details>

    <!-- Desktop sticky-sidebar ToC (виден только на широких экранах).
         <nav>, а не <aside>: это навигация по документу, и роль должна это отражать. -->
    <nav v-if="tocItems.length >= 3" class="toc-desktop" aria-label="Содержание статьи">
      <p class="toc-title">На этой странице</p>
      <ol class="toc-list">
        <li v-for="item in tocItems" :key="item.id" :class="{ 'is-active': item.id === activeId }">
          <a
            :href="`#${item.id}`"
            :aria-current="item.id === activeId ? 'location' : undefined"
            @click="scrollToId(item.id, $event)"
          >{{ item.text }}</a>
        </li>
      </ol>
    </nav>

    <!-- Related posts -->
    <section v-if="relatedPosts.length" class="related section wrap" aria-label="Другие статьи блога">
      <div class="section-head">
        <span class="eyebrow">Читать дальше</span>
        <h2>Другие статьи блога</h2>
      </div>
      <div class="related__grid">
        <NuxtLink v-for="p in relatedPosts" :key="p.href" class="related__card card" :to="p.href">
          <h3>{{ p.title }}</h3>
          <p>{{ p.excerpt }}</p>
          <span class="related__more">Читать →</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.blog-article { position: relative; }

/* ---------- Reading progress bar ---------- */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left center;
  z-index: 30;
  pointer-events: none;
  /* Progressive enhancement: скрываем до появления .is-enhanced на обёртке —
     no-JS-пользователь бесполезного пустого бара не увидит вовсе */
  opacity: 0;
  will-change: transform;
}
.blog-article.is-enhanced .reading-progress {
  opacity: 1;
  transition: opacity 0.25s ease;
}
@media (prefers-reduced-motion: reduce) {
  .blog-article.is-enhanced .reading-progress { transition: none; }
}

/* ---------- Mobile ToC (collapsable details) ---------- */
.toc-mobile {
  display: block;
  max-width: 74ch;
  margin: 0 0 24px;
  padding: 0;
}
@media (min-width: 1300px) {
  .toc-mobile { display: none; }
}
.toc-mobile > summary {
  cursor: pointer;
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  background: var(--accent-soft);
  /* --accent на --accent-soft = 4.45:1 — ниже минимума 4.5:1 для текста 0.86rem */
  color: var(--accent-ink);
  padding: 10px 16px;
  border-radius: 100px;
  font-weight: 700;
  font-size: var(--fs-sm);
  border: 1px solid transparent;
  transition: border-color 0.15s ease;
}
.toc-mobile > summary:hover { border-color: var(--accent); }
.toc-mobile > summary::-webkit-details-marker { display: none; }
.toc-mobile > summary::before {
  content: "";
  display: inline-block;
  width: 14px; height: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232F7A4F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") center/contain no-repeat;
  transition: transform 0.2s ease;
}
.toc-mobile[open] > summary::before { transform: rotate(180deg); }
.toc-mobile .toc-list {
  margin-top: 12px;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow);
}
@media (prefers-reduced-motion: reduce) {
  .toc-mobile > summary,
  .toc-mobile > summary::before { transition: none; }
}

/* ---------- Desktop sticky-sidebar ToC ---------- */
.toc-desktop { display: none; }
@media (min-width: 1300px) {
  .toc-desktop {
    display: block;
    position: fixed;
    top: 110px;
    /* На >1300 viewport остаётся 60+ px справа от .wrap (max 1180 + 60 pad);
       на >1500 сайдбар садится в свободную полосу без наложения на .prose (74ch ≈ 720px) */
    right: max(16px, calc((100vw - var(--maxw)) / 2 - 40px));
    width: 240px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding: 18px 16px;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    font-size: var(--fs-xs);
    z-index: 15;
  }
}
.toc-desktop .toc-title {
  font-family: var(--display);
  font-weight: 700;
  font-size: var(--fs-xs);
  color: var(--accent);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0 0 12px;
}

/* ---------- Shared ToC list styles ---------- */
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 4px;
}
.toc-list li { line-height: 1.35; }
.toc-list a {
  display: flex;
  align-items: center;
  /* пункт оглавления — тап-таргет, а не строка текста (WCAG 2.5.8) */
  min-height: 32px;
  padding: 7px 10px;
  color: var(--muted);
  text-decoration: none;
  border-left: 2px solid transparent;
  border-radius: 4px;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  font-size: var(--fs-sm);
}
.toc-list a:hover { color: var(--accent-ink); }
.toc-list li.is-active > a {
  /* активный пункт: цвет + рамка слева + жир + aria-current в разметке —
     состояние не передаётся одним лишь цветом (WCAG 1.4.1) */
  color: var(--accent-ink);
  border-left-color: var(--accent);
  background: var(--accent-soft);
  font-weight: 600;
}
@media (prefers-reduced-motion: reduce) {
  .toc-list a { transition: none; }
}

/* ---------- Related posts ---------- */
.related {
  padding-block: clamp(32px, 5vw, 60px);
  border-top: 1px solid var(--line);
  margin-top: 24px;
}
.related__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.related__card {
  display: block;
  padding: 22px;
  text-decoration: none;
}
.related__card h3 {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: var(--fs-md);
  line-height: 1.3;
}
.related__card p {
  margin-top: 10px;
  color: var(--muted);
  font-size: var(--fs-sm);
  line-height: 1.5;
}
.related__more {
  display: inline-block;
  margin-top: 14px;
  color: var(--accent);
  font-weight: 700;
  font-size: var(--fs-sm);
}
@media (max-width: 900px) {
  .related__grid { grid-template-columns: 1fr; }
}

/* Отключаем staggered fade-in scroll-reveal для related-cards при reduced-motion
   (плагин scroll-reveal уже уважает reduced-motion; правило дублирует CSS-фолбэк
   на случай, если .related__card когда-то попадёт в TARGET_SELECTOR плагина). */
@media (prefers-reduced-motion: reduce) {
  .related__card { transition: none !important; opacity: 1 !important; transform: none !important; }
}
</style>
