// Волна 123: 3D-наклон карточек по позиции курсора. Проверено ПЕРЕД написанием:
// на этом сайте уже есть один клиентский эффект над карточками —
// scroll-reveal.client.ts (fade/translateY при попадании в вьюпорт), но он не
// пишет --rx/--ry и не считает угол по курсору. Второго одинакового
// тилт-контроллера тоже не было — это первый на сайте, поэтому пишем новый, а не
// расширяем чужой. Гейты те же, что у reveal: ±6°, JS пишет только
// CSS-переменные, сам transform/box-shadow — в main.css, ничего не
// показывает/не прячет сам скрипт.
//
// Карточки: .cargo-card — единственная на сайте визуально насыщенная сетка
// «услуг» на главной (шесть типов груза с иконкой и фактами). Отдельного
// фото-тизера парка на главной этот
// сайт не имеет (в /park/ есть только сравнительная таблица + один фото файла
// KMU) — плодить тизер на единственной реальной фотографии значило бы либо
// показать одну и ту же машину трижды, либо купить/сгенерировать новые фото,
// что не входит в эту волну. .cargo-card — честный и не пустой выбор.
const SELECTOR = '.cargo-card'
const MAX_DEG = 6

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(pointer: fine)')

  let cards: HTMLElement[] = []
  let attached = false

  function onMove(e: PointerEvent) {
    const card = e.currentTarget as HTMLElement
    const rect = card.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    card.style.setProperty('--ry', ((px - 0.5) * 2 * MAX_DEG).toFixed(2) + 'deg')
    card.style.setProperty('--rx', ((0.5 - py) * 2 * MAX_DEG).toFixed(2) + 'deg')
    card.style.setProperty('--gx', (px * 100).toFixed(1) + '%')
    card.style.setProperty('--gy', (py * 100).toFixed(1) + '%')
  }

  function reset(card: HTMLElement) {
    card.style.removeProperty('--rx')
    card.style.removeProperty('--ry')
    card.style.removeProperty('--gx')
    card.style.removeProperty('--gy')
  }

  function onLeave(e: PointerEvent) {
    reset(e.currentTarget as HTMLElement)
  }

  function detachAll() {
    cards.forEach((c) => {
      c.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerleave', onLeave)
      reset(c)
    })
    attached = false
  }

  function setup() {
    detachAll()
    cards = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR))
    if (!cards.length) return
    if (reduceMotion.matches || !finePointer.matches) return
    cards.forEach((c) => {
      c.addEventListener('pointermove', onMove)
      c.addEventListener('pointerleave', onLeave)
    })
    attached = true
  }

  reduceMotion.addEventListener('change', setup)
  finePointer.addEventListener('change', setup)

  // Тот же жизненный цикл, что у scroll-reveal.client.ts: первая загрузка ждёт
  // разрешения Suspense (иначе можно навесить слушатели на ещё не смонтированные
  // узлы), внутренняя SPA-навигация — 'page:finish' (маршрут сменился, но
  // приложение не перезагружалось, поэтому 'app:suspense:resolve' второй раз
  // не сработает).
  nuxtApp.hook('app:suspense:resolve', () => {
    setTimeout(setup, 0)
  })
  nuxtApp.hook('page:finish', () => {
    if (nuxtApp.isHydrating) return
    setTimeout(setup, 0)
  })
})
