<script setup lang="ts">
// Статья 15.10.2026 (угол «практическая / региональная МО»): дорожные плиты для подъезда к участку в Подмосковье —
// сколько плит за рейс и какой машиной. Каркас — seo-2026-playbook §1. Источники сверены 15.10.2026:
//  - ЦЕМЕНТУМ, тех. лист «Дорожные плиты 1П30.18-30 и 2П30.18-30»: 3000×1750×170 мм, масса 2 200 кг, ГОСТ 21924.
//  - ООО «ЖБИ ИНВЕСТ» (Пенза), карточка ПАГ-14 на productcenter.ru: 6000×2000×140 мм, масса 4 200 кг, 1,68 м³, ГОСТ 25912-2015.
//  - Борт, допустимая масса на борт, грузоподъёмность и ставки — только utils/fleet.ts.
// Для Kanglim KS1256G-II масса груза на борт в fleet.ts не задана (17,4 т — надстройка С КМУ и платформой) —
// число плит за рейс для неё не называем.
import { FLEET, SHIFT_RATE } from '~/utils/fleet'

const URL = 'https://manipmo.ru/blog/dorozhnye-plity-na-uchastok-manipulyator-mo/'
const h1 = 'Сколько дорожных плит увезёт манипулятор на участок в Подмосковье'
const title = 'Дорожные плиты на участок манипулятором: сколько'
const description = 'Плита 2П30.18-30 весит 2,2 т, ПАГ-14 — 4,2 т. Palfinger PK 23500A везёт 5 плит 2П или 2 ПАГ-14 за рейс, ИНМАН ИТ-80 — одну 2П.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const byId = Object.fromEntries(FLEET.map((r) => [r.id, r]))
const it = byId.it80!, scs = byId.scs334!, ks = byId.ks1256!, pk = byId.pk23500!

const P2 = { name: '2П30.18-30', l: 3.0, w: 1.75, t: 2.2 }
const PAG = { name: 'ПАГ-14', l: 6.0, w: 2.0, t: 4.2 }
const PK_LOAD_T = 11.2 // pk.bodyLoad «11,2 т»
const pkP2 = Math.floor(PK_LOAD_T / P2.t)
const pkPag = Math.floor(PK_LOAD_T / PAG.t)
const fmt = (n: number) => n.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
const rate = (cls: string) => SHIFT_RATE[cls]!.toLocaleString('ru-RU')

const tripRows = [
  { kmu: it.kmu, p2: '1', pag: 'нет' },
  { kmu: scs.kmu, p2: '1', pag: 'нет' },
  { kmu: ks.kmu, p2: 'по паспорту', pag: 'по паспорту' },
  { kmu: pk.kmu, p2: String(pkP2), pag: String(pkPag) },
]

const faqs = [
  { q: 'Сколько весит дорожная плита 3×1,75 м?', a: 'Плита 2П30.18-30 размером 3000×1750×170 мм по техническому листу завода ЦЕМЕНТУМ весит 2 200 кг и изготавливается по ГОСТ 21924. Столько же весит 1П30.18-30 того же размера с более мощной арматурой. МАНИП-МО считает рейс по массе из паспорта плиты конкретного завода.' },
  { q: 'Сколько весит плита ПАГ-14?', a: 'Плита ПАГ-14 размером 6000×2000×140 мм весит 4 200 кг по карточке завода «ЖБИ ИНВЕСТ», объём бетона 1,68 м³, стандарт ГОСТ 25912-2015. Это почти вдвое тяжелее плиты 2П30.18-30, поэтому её возят только трёхосные манипуляторы МАНИП-МО.' },
  { q: 'Сколько плит ПАГ-14 помещается в манипулятор?', a: 'Palfinger PK 23500A принимает на борт 11,2 т, это две плиты ПАГ-14 общей массой 8,4 т. Третья дала бы 12,6 т и перегруз. Для Kanglim KS1256G-II число зависит от массы надстройки по паспорту шасси, его МАНИП-МО считает при заявке.' },
  { q: 'Может ли манипулятор сразу уложить плиты на подготовленное основание?', a: 'Может, если плита по массе укладывается в грузовую таблицу крана на нужном вылете. Palfinger PK 23500A МАНИП-МО держит 2 730 кг на 8 м, поэтому плиту 2П30.18-30 он укладывает в любую точку в радиусе 8 м. Плиту ПАГ-14 массой 4,2 т он кладёт ближе, в пределах 4,6 м.' },
  { q: 'Можно ли везти плиты весной по дорогам Подмосковья?', a: 'Можно: с 2018 года Московская область не вводит сезонное ограничение движения тяжеловесного транспорта на период просушки дорог. Ограничение действует в большинстве соседних регионов, поэтому рейс МАНИП-МО с плитами за границу области проверяют по правилам того региона, куда едет машина.' },
]

useHead({
  link: [{ rel: 'canonical', href: URL }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://manipmo.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://manipmo.ru/blog/' },
        { '@type': 'ListItem', position: 3, name: 'Дорожные плиты на участок', item: URL },
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
  { id: 'massa', text: 'Масса плит 2П30.18-30 и ПАГ-14' },
  { id: 'reys', text: 'Сколько плит за один рейс' },
  { id: 'ukladka', text: 'Укладка стрелой: на каком вылете' },
  { id: 'podmoskovye', text: 'Подъезд к участку в Подмосковье' },
  { id: 'zayavka', text: 'Что указать в заявке' },
  { id: 'faq', text: 'Частые вопросы' },
]

const sources = [
  { label: 'ЦЕМЕНТУМ — технический лист «Дорожные плиты 1П30.18-30 и 2П30.18-30» (масса 2 200 кг, ГОСТ 21924)', href: 'https://cementum.ru/upload/docs/%D0%A6%D0%95%D0%9C%D0%95%D0%9D%D0%A2%D0%A3%D0%9C_%D0%A2%D0%B5%D1%85.%20%D0%BB%D0%B8%D1%81%D1%82%D1%8B_%D0%B4%D0%BE%D1%80%D0%BE%D0%B6%D0%BD%D1%8B%D0%B5%20%D0%BF%D0%BB%D0%B8%D1%82%D1%8B.pdf' },
  { label: 'ООО «ЖБИ ИНВЕСТ» — плита аэродромная ПАГ-14 по ГОСТ 25912-2015 (масса 4 200 кг, 1,68 м³)', href: 'https://productcenter.ru/products/119925/plita-aerodromnaia-pag-14-gost-25912-2015' },
  { label: 'Паспорт КАМАЗ-65117 с КМУ Palfinger PK 23500A', href: pk.src.href },
  { label: 'Паспорт ИТ-80 на шасси ГАЗ', href: it.src.href },
  { label: 'Весенняя просушка дорог и манипулятор', href: '/blog/prosushka-dorog-manipulyator/' },
  { label: 'Допуск манипулятора в СНТ', href: '/blog/snt-dopusk-manipulyator/' },
]
</script>

<template>
<AppBlogArticle current-href="/blog/dorozhnye-plity-na-uchastok-manipulyator-mo/">
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><a href="/blog/">Блог</a><span>/</span><span>Дорожные плиты на участок</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <span class="eyebrow">Грузы и рейсы</span>
      <h1>{{ h1 }}</h1>
      <div class="art-meta">
        <span>Редакция МАНИП-МО</span><span>·</span>
        <span>опубликовано <time datetime="2026-10-15">15.10.2026</time></span><span>·</span>
        <span>обновлено <time datetime="2026-10-15">15.10.2026</time></span><span>·</span>
        <span>факты проверены 15.10.2026</span>
      </div>
      <p>Плита 2П30.18-30 весит 2,2 т, а аэродромная ПАГ-14 — 4,2 т. Palfinger PK 23500A МАНИП-МО везёт за рейс {{ pkP2 }} плит 2П30.18-30 или {{ pkPag }} плиты ПАГ-14, а ИНМАН ИТ-80 и Soosan SCS334 — по одной плите 2П30.18-30. Плиту ПАГ-14 длиной 6 м берут только трёхосные машины с бортом от 6,5 м. Ниже расчёт по паспортам машин и массам из технических листов заводов.</p>
      <nav class="toc-static" aria-label="Содержание">
        <b>Содержание</b>
        <ol><li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`">{{ t.text }}</a></li></ol>
      </nav>
    </div>
  </section>

  <section class="section wrap prose" style="padding-top:0">
    <h2 id="massa" style="margin-bottom:18px">Масса плит 2П30.18-30 и ПАГ-14</h2>
    <p>Технический лист завода ЦЕМЕНТУМ даёт для плиты 2П30.18-30 размер 3000×1750×170 мм и массу 2 200 кг при объёме бетона 0,88 м³. Плита ПАГ-14 по карточке завода «ЖБИ ИНВЕСТ» имеет размер 6000×2000×140 мм и массу 4 200 кг при объёме 1,68 м³. Для подъезда к участку берут обе: 2П30.18-30 легче и короче, ПАГ-14 закрывает 12 м² одной плитой. МАНИП-МО считает рейс по массе из паспорта плиты конкретного завода, потому что у разных заводов она может отличаться.</p>

    <h2 id="reys" style="margin:36px 0 18px">Сколько плит за один рейс</h2>
    <p>Palfinger PK 23500A МАНИП-МО принимает на борт {{ pk.bodyLoad }}, и число плит за рейс ограничивает именно эта масса, а не стрела. Получается {{ pkP2 }} плит 2П30.18-30 ({{ fmt(pkP2 * P2.t) }} т) или {{ pkPag }} плиты ПАГ-14 ({{ fmt(pkPag * PAG.t) }} т). ИНМАН ИТ-80 берёт на борт {{ it.bodyLoad }}, Soosan SCS334 — {{ scs.bodyLoad }}, поэтому обе машины МАНИП-МО везут одну плиту 2П30.18-30.</p>
    <table class="ptbl">
      <caption>Плит за рейс по допустимой массе груза на борту (utils/fleet.ts) и массам заводов. Расчёт МАНИП-МО, 15.10.2026.</caption>
      <thead><tr><th scope="col">КМУ</th><th scope="col">2П30.18-30</th><th scope="col">ПАГ-14</th></tr></thead>
      <tbody>
        <tr v-for="r in tripRows" :key="r.kmu"><th scope="row">{{ r.kmu }}</th><td>{{ r.p2 }}</td><td>{{ r.pag }}</td></tr>
      </tbody>
    </table>
    <p>Kanglim KS1256G-II в таблице без числа: паспорт шасси КАМАЗ-65115 задаёт {{ ks.bodyLoad }}, и в эти 17,4 т входят сама КМУ и платформа. МАНИП-МО считает свободную массу под плиты по паспорту конкретной машины при заявке. ПАГ-14 длиной 6 м на борт ИНМАН ИТ-80 ({{ it.bodyL }}) и Soosan SCS334 ({{ scs.bodyL }}) не ложится.</p>

    <h2 id="ukladka" style="margin:36px 0 18px">Укладка стрелой: на каком вылете</h2>
    <p>Palfinger PK 23500A МАНИП-МО держит {{ pk.capMax }}, поэтому плиту 2П30.18-30 массой 2,2 т он укладывает в любую точку в радиусе 8 м от машины. Плиту ПАГ-14 массой 4,2 т эта же машина кладёт в пределах {{ pk.capMin }}, ближе к опорам. ИНМАН ИТ-80 поднимает {{ it.capMin }} на минимальном вылете и {{ it.capMax }}, поэтому плиту 2П30.18-30 он кладёт только рядом с собой. Место стоянки и порядок укладки дорожки МАНИП-МО согласует с заказчиком до выезда, по схеме участка.</p>

    <h2 id="podmoskovye" style="margin:36px 0 18px">Подъезд к участку в Подмосковье</h2>
    <p>Плиты в Подмосковье чаще всего везут туда, где дороги ещё нет: в СНТ, на новый участок ИЖС, к стройке за кюветом. Порядок проезда по дорогам СНТ утверждает общее собрание, как разобрано в статье <a href="/blog/snt-dopusk-manipulyator/">про допуск в СНТ</a>. Въезд через кювет без трубы МАНИП-МО не планирует, это отдельная тема <a href="/blog/kyuvet-sezd-na-uchastok-manipulyator/">про съезд на участок</a>.</p>
    <p>Весенней просушки дорог Московская область с 2018 года не вводит, поэтому Palfinger PK 23500A МАНИП-МО везёт плиты по области круглый год. Если участок за границей области, ограничение соседнего региона проверяют заранее, как разобрано в статье <a href="/blog/prosushka-dorog-manipulyator/">про просушку дорог</a>. Смена Palfinger PK 23500A стоит от {{ rate(pk.cls) }} ₽, ИНМАН ИТ-80 — от {{ rate(it.cls) }} ₽ за 8 часов плюс километраж от МКАД.</p>

    <h2 id="zayavka" style="margin:36px 0 18px">Что указать в заявке</h2>
    <p>Диспетчеру МАНИП-МО для выбора машины и числа рейсов хватает 4 данных из заявки.</p>
    <ul>
      <li>МАНИП-МО просит марку плиты и массу из паспорта завода-изготовителя.</li>
      <li>МАНИП-МО уточняет число плит и нужно ли укладывать их стрелой.</li>
      <li>МАНИП-МО спрашивает ширину проезда к участку и есть ли кювет без трубы.</li>
      <li>МАНИП-МО уточняет адрес участка: за границей области весной бывают ограничения.</li>
    </ul>

    <AppSources :items="sources" date="15.10.2026" />
  </section>

  <section class="section wrap">
    <div class="section-head">
      <span class="eyebrow">Вопросы</span>
      <h2 id="faq">Частые вопросы про дорожные плиты и манипулятор</h2>
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
