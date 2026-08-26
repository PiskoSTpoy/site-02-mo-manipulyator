<script setup lang="ts">
// Line-art иконки шести типов груза для карточек раздела «Грузы» на главной.
// Чисто декоративные (родитель ставит aria-hidden): смысл груза уже назван текстом
// рядом (`c.name`), иконка — не единственный носитель информации, а визуальный якорь.
// Стиль — тот же, что у иконок в шапке/CTA-панели (layouts/default.vue): stroke
// currentColor, без заливки, 1.8px, скруглённые концы; цвет задаёт обёртка через CSS.
defineProps<{ slug: string }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">
    <!-- сруб и брус: убывающий стек бруса -->
    <template v-if="slug === 'srub-i-brus'">
      <rect x="3" y="15" width="18" height="3.6" rx="1.6" />
      <rect x="5.2" y="10.2" width="13.6" height="3.6" rx="1.6" />
      <rect x="7.4" y="5.4" width="9.2" height="3.6" rx="1.6" />
    </template>

    <!-- ЖБИ и плиты: пустотная плита с каналами (ПК 60.12-8) -->
    <template v-else-if="slug === 'zhbi-i-plity'">
      <rect x="2.5" y="8.5" width="19" height="7" rx="1.4" />
      <circle cx="7.3" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="16.7" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </template>

    <!-- поддоны и мешки: дощатый настил поддона -->
    <template v-else-if="slug === 'poddony-i-meshki'">
      <path d="M3 8.5h18M3 12h18M3 15.5h18" />
      <path d="M5.5 8.5v7M12 8.5v7M18.5 8.5v7" />
    </template>

    <!-- бытовка и вагончик: модуль с двускатной крышей, окном и дверью -->
    <template v-else-if="slug === 'bytovka-i-vagonchik'">
      <path d="M3.5 9.5 8 4.5h8l4.5 5" />
      <rect x="3.5" y="9.5" width="17" height="9.5" rx="1" />
      <rect x="6.5" y="12" width="3.6" height="3.4" rx="0.5" />
      <path d="M15 18.6v-4.2h3v4.2" />
    </template>

    <!-- контейнер: гофрированная коробка 20-футового контейнера -->
    <template v-else-if="slug === 'konteyner'">
      <rect x="2.5" y="7" width="19" height="11" rx="1.2" />
      <path d="M6.7 7v11M10.9 7v11M14.6 7v11M18.3 7v11" />
    </template>

    <!-- малая спецтехника: мини-погрузчик со стрелой -->
    <template v-else-if="slug === 'spectehnika-malaya'">
      <rect x="2.8" y="13.4" width="10.2" height="5" rx="1.3" />
      <circle cx="6" cy="19.2" r="1.6" />
      <circle cx="11.8" cy="19.2" r="1.6" />
      <path d="M9.4 13.4V9.6l6.3-3.4 3 2-5.4 3.4v1.8" />
      <path d="M18.7 11.6 21.6 12.7 20.5 15.8 17.6 14.7Z" />
    </template>
  </svg>
</template>
