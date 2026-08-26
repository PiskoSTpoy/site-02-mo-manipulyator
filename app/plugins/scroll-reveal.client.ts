// Скролл-реколы секций и карточек сайта.
// Работает глобально на всех страницах (не завязано на конкретный шаблон):
// на каждой смене маршрута размечает секции/карточки атрибутом data-reveal
// и наблюдает через IntersectionObserver. Если IO недоступен или почему-то
// не сработал за ~2.2с — принудительно показывает все элементы (fallback).
// При prefers-reduced-motion реколы не скрывают контент вовсе (см. также CSS-фолбэк
// в main.css: [data-reveal] сразу видим при reduced motion).
// Пользователь без JS никогда не увидит data-reveal (атрибут добавляется только тут) —
// это и есть noscript-фолбэк по построению.

// Волна визуальной приёмки (26.08.2026). Из списка убран '.section'.
// Причина: секция и каждая карточка внутри неё играли ОДНО И ТО ЖЕ движение
// (выезд на 18px + проявление), поэтому весь сайт сверху донизу состоял из одной
// повторяющейся анимации, а секция ещё и «съедала» стагтер своих же карточек —
// они начинали выезжать, уже будучи внутри выезжающего блока. Осталось одно
// авторское движение: плитки собираются в bento-сетку. Текст и заголовки
// разделов видны сразу, без анимации, — они и есть содержание страницы.
const TARGET_SELECTOR = [
  '.bento__card',
  '.keysy-card',
  '.cargo-card',
  '.dir-card',
  '.honest-bar',
  '.park-card',
  '.step',
  '.stat-bar__item',
  '.geo-item',
  '.post-card',
].join(', ')

const FALLBACK_TIMEOUT_MS = 2200
const STAGGER_STEP_MS = 70
const STAGGER_CAP = 8

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  let observer: IntersectionObserver | null = null
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null

  function revealAll(targets: NodeListOf<Element> | Element[]) {
    targets.forEach((el) => el.classList.add('is-revealed'))
  }

  function setup() {
    if (fallbackTimer) clearTimeout(fallbackTimer)
    if (observer) observer.disconnect()

    const targets = Array.from(document.querySelectorAll(TARGET_SELECTOR))
    if (!targets.length) return

    // группируем по родителю, чтобы карточки внутри одной сетки/грида
    // разъезжались по времени (stagger), а не все разом
    const byParent = new Map<Element | null, Element[]>()
    targets.forEach((el) => {
      const parent = el.parentElement
      if (!byParent.has(parent)) byParent.set(parent, [])
      byParent.get(parent)!.push(el)
    })
    byParent.forEach((siblings) => {
      siblings.forEach((el, i) => {
        el.setAttribute('data-reveal', '')
        const delay = Math.min(i, STAGGER_CAP) * STAGGER_STEP_MS
        ;(el as HTMLElement).style.setProperty('--reveal-delay', `${delay}ms`)
      })
    })

    if (prefersReducedMotion.matches) {
      // при reduced-motion не анимируем вовсе — сразу показываем всё
      revealAll(targets)
      return
    }

    if (!('IntersectionObserver' in window)) {
      revealAll(targets)
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    targets.forEach((el) => observer!.observe(el))

    // защитный фолбэк: если по какой-то причине IO не отработал вовремя
    // (например, страница уже полностью проскроллена программно, редкие
    // браузерные баги) — не оставляем контент невидимым навсегда
    fallbackTimer = setTimeout(() => revealAll(targets), FALLBACK_TIMEOUT_MS)
  }

  // при живой смене reduced-motion в рантайме — сразу показать всё, отключив анимацию
  prefersReducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'))
      if (observer) observer.disconnect()
      if (fallbackTimer) clearTimeout(fallbackTimer)
    }
  })

  // ПЕРВАЯ ЗАГРУЗКА обязана ждать именно 'app:suspense:resolve' — момент, когда
  // обёртка <Suspense> вокруг <NuxtPage> (см. layouts/default.vue) реально
  // разрешилась для текущей страницы. Это НЕ то же самое, что 'app:mounted' (тот
  // фиксирует только момент монтирования корневого приложения) и НЕ то же самое,
  // что window 'load' — оба этих события могут случиться раньше, чем асинхронная
  // гидратация Suspense-контента для конкретной страницы фактически завершится.
  // Пока это не так, мутация DOM (простановка data-reveal/--reveal-delay) попадает
  // прямо в процесс гидратации, и Vue детектирует это как «Hydration style
  // mismatch» — реально воспроизведено и исправлено так при живой проверке волны 10.
  nuxtApp.hook('app:suspense:resolve', () => {
    setTimeout(setup, 0)
  })

  // ИСПРАВЛЕНО В ВОЛНЕ 12. Прежний комментарий здесь утверждал, что этот же хук
  // покрывает и смену маршрута — это НЕВЕРНО: 'app:suspense:resolve' срабатывает
  // только один раз, на первой загрузке приложения. При внутренней SPA-навигации
  // setup() не вызывался вовсе, и на новой странице reveal просто не работал
  // (элементы не получали data-reveal → оставались видимы без анимации; контент не
  // пропадал, но задуманного поведения не было). Тот же корень, что у бага ToC и
  // reading-progress в AppBlogArticle.vue.
  // 'page:finish' срабатывает после завершения перехода; на первой загрузке путь
  // отсекается проверкой isHydrating, чтобы не дублировать хук выше.
  // setup() идемпотентен (в начале сам отключает observer и сбрасывает таймер).
  nuxtApp.hook('page:finish', () => {
    if (nuxtApp.isHydrating) return
    setTimeout(setup, 0)
  })
})
