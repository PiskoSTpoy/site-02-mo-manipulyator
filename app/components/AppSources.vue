<script setup lang="ts">
// Блок «Источники, проверено …».
//
// Зачем отдельным компонентом: фактура на сайте протухает молча. Норма меняется,
// текст остаётся, и сайт годами повторяет отменённый приказ (ровно это нашлось
// в Волне 14 — ФНП №533, утратившие силу 01.01.2021). Дата проверки рядом
// со ссылкой делает протухание видимым — и читателю, и тому, кто правит сайт.
defineProps<{
  items: Array<{ label: string; href: string }>
  date?: string
}>()
</script>

<template>
  <aside class="srcbox" aria-labelledby="srcbox-title">
    <h2 id="srcbox-title" class="srcbox__title">Источники, проверено {{ date || '12.08.2026' }}</h2>
    <ul class="srcbox__list">
      <!-- Внешний первоисточник открываем в новой вкладке (чтобы не терять страницу),
           внутреннюю ссылку — в текущей: новая вкладка на свой же сайт только мешает. -->
      <li v-for="s in items" :key="s.href">
        <a
          :href="s.href"
          :target="s.href.startsWith('http') ? '_blank' : undefined"
          :rel="s.href.startsWith('http') ? 'noopener' : undefined"
        >{{ s.label }}</a>
      </li>
    </ul>
    <p class="srcbox__note">
      Дата рядом со ссылкой — не украшение: если она старше года, считайте цифры на этой странице
      требующими перепроверки и спрашивайте актуальные при заявке.
    </p>
  </aside>
</template>

<style scoped>
/* Волна визуальной приёмки. Была пунктирная рамка — единственная пунктирная
   линия на всём сайте, и читалась она как «черновик, вырезать по контуру».
   Стало: та же мятная поверхность, что у плитки итога в конфигураторе и у
   честной полосы метрик, с радиусом крупной панели. Блок источников —
   не служебная сноска, а доказательная база страницы, и выглядеть он должен
   как часть сайта, а не как временная заглушка. */
.srcbox {
  margin-top: clamp(28px, 4vw, 44px);
  border: 1px solid var(--accent-line);
  border-radius: var(--r-lg);
  padding: clamp(20px, 2.6vw, 28px);
  background: var(--accent-soft);
}
.srcbox__title {
  font-family: var(--sans);
  font-size: var(--fs-2xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--accent-ink);
}
/* Маркер — тот же скруглённый квадратик, что и в .prose ul: один набор
   на весь сайт, а не второй список с браузерным disc. */
.srcbox__list { margin: 14px 0 0; padding-left: 0; list-style: none; font-size: var(--fs-sm); color: var(--muted); }
.srcbox__list li { position: relative; padding-left: 22px; }
.srcbox__list li::before { content: ''; position: absolute; left: 0; top: .58em; width: 7px; height: 7px; border-radius: 2.5px; background: var(--accent); }
.srcbox__list li + li { margin-top: 8px; }
.srcbox__list a { color: var(--accent-ink); }
.srcbox__list a:hover { color: var(--ink); }
.srcbox__note { margin-top: 12px; font-size: var(--fs-xs); color: var(--muted); max-width: 72ch; }
</style>
