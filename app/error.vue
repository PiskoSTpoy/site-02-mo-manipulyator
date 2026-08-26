<script setup lang="ts">
// Волна приёмки (26.08.2026). Раньше страница ошибки была отдельной вёрсткой
// «в обход» макета: своя урезанная шапка без телефона, без подвала, без JSON-LD,
// без meta description. В собранный сайт она попадает файлом /404.html и
// проверяется линтерами наравне с остальными 35 страницами — и роняла сразу
// четыре критерия (tech-title-unique-length, tech-description-unique,
// sd-format-jsonld, yc-phone-tel-link). Теперь она идёт через тот же
// <NuxtLayout>, что и все страницы: шапка с телефоном, подвал со ссылками на
// политику, согласие и контакты, разметка организации — всё общее, дублировать
// нечего.
defineProps<{ error: { statusCode: number; message?: string } }>()

const title = 'Страница не найдена — МАНИП-МО'
const description = 'Такой страницы на сайте нет: ссылка устарела или в адресе опечатка. Здесь собраны разделы, которые точно существуют — конфигуратор, грузы, направления и парк.'

useSeoMeta({ title, description, robots: 'noindex, follow' })
</script>

<template>
  <NuxtLayout>
    <main>
      <section class="section wrap" style="text-align:center">
        <span class="eyebrow">{{ error.statusCode }}</span>
        <h1 style="margin-top:14px">Такой страницы нет</h1>
        <p style="color:var(--muted);margin-top:14px;max-width:60ch;margin-inline:auto">Возможно, ссылка устарела или в адресе опечатка. Вот что точно есть на сайте:</p>
        <div class="links404">
          <NuxtLink class="btn" to="/#konfigurator">Конфигуратор и цены</NuxtLink>
          <NuxtLink class="btn" to="/gruzy/">Грузы</NuxtLink>
          <NuxtLink class="btn" to="/napravleniya/">Направления</NuxtLink>
          <NuxtLink class="btn" to="/park/">Парк техники</NuxtLink>
          <NuxtLink class="btn" to="/blog/">Блог</NuxtLink>
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>

<style scoped>
.links404 { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 30px; }
</style>
