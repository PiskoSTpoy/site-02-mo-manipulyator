<script setup lang="ts">
// Статья 15.10.2026 (угол «коммерческая / сравнительная»): какой манипулятор парка берёт 20-футовый контейнер.
// Каркас — seo-2026-playbook §1. Источники сверены 15.10.2026:
//  - ucsol.ru, справочник «20-футовый стандартный контейнер»: длина 20 футов = 6 096 мм, высота 8'6" = 2 591 мм,
//    тара 2 080 кг, макс. брутто 24 000 кг (у других операторов тара 2,1–2,3 т — поэтому в тексте «около 2 т» + табличка CSC).
//    Ширина серии 1 — 8 футов (2,44 м); ширину 2 370 мм из того же справочника не берём — это явная опечатка.
//  - Борт, вылет, грузоподъёмность и ставки — только из utils/fleet.ts (паспорта машин).
//  - Порог крупногабарита 4 м от дороги — ПП РФ № 2060 (уже в spetsrazreshenie-negabarit-manipulyator).
//  - Схемы строповки — ФНП № 461 п. 147 «в».
// Промежуточных точек грузовой таблицы Kanglim в fleet.ts нет — вылет для пустого контейнера у KS1256 не называем.
import { FLEET, SHIFT_RATE } from '~/utils/fleet'

const URL = 'https://manipmo.ru/blog/konteyner-20-futov-manipulyator/'
const h1 = 'Каким манипулятором перевезти 20-футовый контейнер и можно ли гружёный'
const title = 'Контейнер 20 футов манипулятором: какой кран'
const description = 'Пустой 20-футовый контейнер (около 2 т) берут Kanglim KS1256G-II и Palfinger PK 23500A с бортом от 6,5 м; гружёный — только по массе брутто с таблички.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const byId = Object.fromEntries(FLEET.map((r) => [r.id, r]))
const it = byId.it80!, scs = byId.scs334!, ks = byId.ks1256!, pk = byId.pk23500!

// Справочные параметры контейнера (ucsol.ru, 15.10.2026)
const BOX_L = 6.096
const BOX_W = 2.44
const BOX_TARE_KG = 2080

const rows = FLEET.map((r) => ({
  kmu: r.kmu,
  bodyL: r.bodyL,
  fits: r.bodyLm >= BOX_L ? 'да' : 'нет',
}))
const rate = (cls: string) => SHIFT_RATE[cls]!.toLocaleString('ru-RU')

const faqs = [
  { q: 'Сколько весит пустой 20-футовый контейнер?', a: 'Около 2 т: справочник ucsol.ru даёт для стандартного 20-футового контейнера массу тары 2 080 кг, у других операторов встречается 2,1–2,3 т. Точная цифра выбита на табличке CSC на двери контейнера. МАНИП-МО просит сфотографировать табличку при заявке и считает подъём по ней.' },
  { q: 'Влезет ли 20-футовый контейнер на борт манипулятора?', a: 'Только на длинный: контейнер длиной 6,1 м помещается на борт Kanglim KS1256G-II (6,5 м) и Palfinger PK 23500A (6,648 м). Борт ИНМАН ИТ-80 до 5,4 м и Soosan SCS334 4,505 м короче контейнера. Ширина 2,44 м проходит на оба длинных борта парка МАНИП-МО.' },
  { q: 'Можно ли перевезти манипулятором гружёный контейнер?', a: 'Только лёгкий. Palfinger PK 23500A принимает на борт 11,2 т, но кран поднимает 4 900 кг на вылете 4,6 м, поэтому разгрузить стрелой можно контейнер массой брутто не больше этого значения на нужном вылете. Контейнер с массой брутто 24 т по справочнику манипулятору МАНИП-МО не по силам.' },
  { q: 'Нужно ли спецразрешение на перевозку контейнера манипулятором?', a: 'Зависит от высоты: высота контейнера 2,591 м плюс погрузочная высота платформы шасси. Если сумма превышает 4 м от дороги, по ПП РФ № 2060 машина становится крупногабаритной и нужно спецразрешение. МАНИП-МО считает высоту по паспорту конкретного шасси до выезда.' },
  { q: 'За что стропят контейнер?', a: 'За угловые фитинги, по схеме строповки: подпункт «в» пункта 147 ФНП № 461 требует от эксплуатирующей организации иметь схемы строповки. Стропальщик МАНИП-МО подбирает четырёхветвевой строп по массе брутто с таблички и следит, чтобы ветви не касались стенок.' },
]

useHead({
  link: [{ rel: 'canonical', href: URL }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://manipmo.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://manipmo.ru/blog/' },
        { '@type': 'ListItem', position: 3, name: 'Контейнер 20 футов манипулятором', item: URL },
      ],
    })},
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: h1,
      description,
      datePublished: '2026-10-15',
      dateModified: '2026-10-15',
      author: { '@type': 'Organization', name: 'МАНИП-МО', '@id': 'https://manipmo.ru/#organization' },
      publisher: { '@id': 'https://manipmo.ru/#organization' },
      mainEntityOfPage: URL,
      inLanguage: 'ru-RU',
    })},
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })},
  ],
})

const toc = [
  { id: 'gabarity', text: 'Габариты и масса 20-футового контейнера' },
  { id: 'bort', text: 'Какой борт вмещает 6,1 м' },
  { id: 'gruzheny', text: 'Пустой или гружёный: что решает кран' },
  { id: 'vysota', text: 'Высота 4 м и спецразрешение' },
  { id: 'tsena', text: 'Строповка и цена смены' },
  { id: 'faq', text: 'Частые вопросы' },
]

const sources = [
  { label: 'ucsol.ru — 20-футовый стандартный контейнер: габариты, тара 2 080 кг, брутто 24 000 кг (справочные данные)', href: 'https://ucsol.ru/tipy-kontejnerov/20-ti-futovyj-standartnyj-kontejner' },
  { label: 'Постановление Правительства РФ от 01.12.2023 № 2060 — Правила движения тяжеловесного и (или) крупногабаритного транспортного средства', href: 'https://www.consultant.ru/document/cons_doc_LAW_463407/' },
  { label: 'Приказ Ростехнадзора от 26.11.2020 № 461 (ред. от 16.04.2026), ФНП, п. 147 «в» — сверено 15.10.2026', href: 'https://legalacts.ru/doc/prikaz-rostekhnadzora-ot-26112020-n-461-ob-utverzhdenii-federalnykh/' },
  { label: 'Паспорт КАМАЗ-65117 с КМУ Palfinger PK 23500A', href: pk.src.href },
  { label: 'Паспорт КАМАЗ-65115 с КМУ Kanglim KS1256G-II', href: ks.src.href },
  { label: 'Спецразрешение на негабарит для манипулятора', href: '/blog/spetsrazreshenie-negabarit-manipulyator/' },
]
</script>

<template>
<AppBlogArticle current-href="/blog/konteyner-20-futov-manipulyator/">
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><a href="/blog/">Блог</a><span>/</span><span>Контейнер 20 футов манипулятором</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <span class="eyebrow">Выбор машины</span>
      <h1>{{ h1 }}</h1>
      <div class="art-meta">
        <span>Редакция МАНИП-МО</span><span>·</span>
        <span>опубликовано <time datetime="2026-10-15">15.10.2026</time></span><span>·</span>
        <span>обновлено <time datetime="2026-10-15">15.10.2026</time></span><span>·</span>
        <span>факты проверены 15.10.2026</span>
      </div>
      <p>Пустой 20-футовый контейнер весит около 2 т и имеет длину 6,1 м. В парке МАНИП-МО его берут две машины с бортом длиннее контейнера: Kanglim KS1256G-II и Palfinger PK 23500A. Гружёный контейнер возят, только если масса брутто с таблички CSC укладывается в грузовую таблицу крана на нужном вылете. Короткие борта ИНМАН ИТ-80 и Soosan SCS334 для контейнера не подходят.</p>
      <nav class="toc-static" aria-label="Содержание">
        <b>Содержание</b>
        <ol><li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`">{{ t.text }}</a></li></ol>
      </nav>
    </div>
  </section>

  <section class="section wrap prose" style="padding-top:0">
    <h2 id="gabarity" style="margin-bottom:18px">Габариты и масса 20-футового контейнера</h2>
    <p>Справочник ucsol.ru даёт для стандартного 20-футового контейнера длину 6 096 мм, высоту 2 591 мм, массу тары 2 080 кг и максимальную массу брутто 24 000 кг. Ширина контейнеров серии 1 — 8 футов, то есть 2,44 м. Масса тары у разных изготовителей колеблется в пределах 2,1–2,3 т, поэтому МАНИП-МО считает подъём не по справочнику, а по табличке CSC на двери конкретного контейнера.</p>

    <h2 id="bort" style="margin:36px 0 18px">Какой борт вмещает 6,1 м</h2>
    <p>Контейнер длиной {{ BOX_L.toLocaleString('ru-RU') }} м ложится только на борт, который длиннее него: контейнер стоит на четырёх нижних угловых фитингах, и все четыре должны опираться на платформу. В парке МАНИП-МО таких машин две, и обе трёхосные на шасси КАМАЗ. Таблица сравнивает длину борта всех четырёх машин парка с длиной контейнера.</p>
    <table class="ptbl">
      <caption>Длина борта по паспортам машин (utils/fleet.ts) против длины контейнера 6,096 м. Свод МАНИП-МО, 15.10.2026.</caption>
      <thead><tr><th scope="col">КМУ</th><th scope="col">Борт</th><th scope="col">Вмещает</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.kmu"><th scope="row">{{ r.kmu }}</th><td>{{ r.bodyL }}</td><td>{{ r.fits }}</td></tr>
      </tbody>
    </table>
    <p>Ширина тоже проходит: борт Kanglim KS1256G-II — {{ ks.bodyW }}, борт Palfinger PK 23500A — {{ pk.bodyW }} при ширине контейнера {{ BOX_W.toLocaleString('ru-RU') }} м. У PK 23500A запас по ширине всего 3 см, поэтому стропальщик МАНИП-МО опускает контейнер по центру борта с оттяжкой. Борт ИНМАН ИТ-80 ({{ it.bodyL }}) и Soosan SCS334 ({{ scs.bodyL }}) короче контейнера на 0,7–1,6 м.</p>

    <h2 id="gruzheny" style="margin:36px 0 18px">Пустой или гружёный: что решает кран</h2>
    <p>Palfinger PK 23500A МАНИП-МО поднимает {{ pk.capMax }}, а пустой контейнер с тарой {{ BOX_TARE_KG.toLocaleString('ru-RU') }} кг легче этого значения. Значит, эта машина ставит пустой контейнер в любую точку в пределах своего вылета 8 м. Kanglim KS1256G-II поднимает {{ ks.capMin }} на минимальном вылете и {{ ks.capMax }}, поэтому пустой контейнер он ставит близко к машине, а точный вылет МАНИП-МО берёт из грузовой таблицы.</p>
    <p>Гружёный контейнер упирается в кран, а не в борт. Palfinger PK 23500A принимает на борт {{ pk.bodyLoad }}, но стрелой снимает не больше {{ pk.capMin }}. Контейнер с массой брутто 24 т из справочника не поднимет ни одна машина парка МАНИП-МО — для него нужен автокран или контейнеровоз через <a href="/uslugi/lyubaya-tehnika-cherez-set/">партнёрскую сеть</a>.</p>

    <h2 id="vysota" style="margin:36px 0 18px">Высота 4 м и спецразрешение</h2>
    <p>Постановление Правительства РФ № 2060 относит к крупногабаритным транспортные средства с грузом выше 4 м от поверхности дороги. Контейнер сам по себе высотой 2,591 м, к нему прибавляется погрузочная высота платформы шасси. МАНИП-МО считает сумму по паспорту конкретного КАМАЗ и, если она выше 4 м, оформляет спецразрешение до выезда, как разобрано в статье <a href="/blog/spetsrazreshenie-negabarit-manipulyator/">про негабарит</a>.</p>

    <h2 id="tsena" style="margin:36px 0 18px">Строповка и цена смены</h2>
    <p>Подпункт «в» пункта 147 ФНП № 461 требует от эксплуатирующей организации схем строповки, и контейнер стропят по такой схеме за угловые фитинги. Стропальщик МАНИП-МО берёт четырёхветвевой строп, рассчитанный на массу брутто с таблички. Смена Kanglim KS1256G-II стоит от {{ rate(ks.cls) }} ₽, смена Palfinger PK 23500A — от {{ rate(pk.cls) }} ₽ за 8 часов, плюс километраж от МКАД.</p>
    <ul>
      <li>МАНИП-МО просит при заявке фото таблички CSC с массой тары и брутто.</li>
      <li>МАНИП-МО уточняет, пустой контейнер или с грузом и какова масса груза.</li>
      <li>МАНИП-МО спрашивает расстояние от места стоянки до точки установки контейнера.</li>
    </ul>

    <AppSources :items="sources" date="15.10.2026" />
  </section>

  <section class="section wrap">
    <div class="section-head">
      <span class="eyebrow">Вопросы</span>
      <h2 id="faq">Частые вопросы про контейнер и манипулятор</h2>
    </div>
    <div class="faq">
      <details v-for="f in faqs" :key="f.q" class="faq__item">
        <summary>{{ f.q }}</summary>
        <p>{{ f.a }}</p>
      </details>
    </div>
  </section>

  <section class="section wrap">
    <a class="btn" href="/park/">Посмотреть паспортные данные парка →</a>
  </section>
</main>
</AppBlogArticle>
</template>
