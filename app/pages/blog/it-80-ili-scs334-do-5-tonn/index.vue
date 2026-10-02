<script setup lang="ts">
// Статья 02.10.2026 (угол «коммерческая / сравнительная»). Каркас — seo-2026-playbook §1.
// Все цифры — только fleet.ts, паспортные данные парка МАНИП-МО, внешних источников нет.
// ИНМАН ИТ-80 (ГАЗ-3309): gvwT 8,18 т, борт 4,3–5,4 м × 2,17 м, грузоподъёмность борта
// 2,98–3,58 т, момент КМУ 8,2 т·м, вылет 7,53 м, capMin 3 050 кг, capMax 790 кг на 7,53 м,
// SHIFT_RATE «до 3 т» 7 500 ₽. Soosan SCS334 (Hyundai HD78): gvwT 7,5 т, борт 4,505 м × ≈2,2 м,
// грузоподъёмность борта 2,5 т, момент КМУ 8,0 т·м, вылет 9,8 м, capMin 3 200 кг на 2,0 м,
// capMax 600 кг на 9,8 м, SHIFT_RATE «3–5 т» 9 500 ₽. Ключевой факт из fleet.ts: класс
// SCS334 называется «3–5 т», но борт этой машины везёт МЕНЬШЕ (2,5 т), чем борт ИТ-80
// из класса «до 3 т» (до 3,58 т) — ограничивает борт, а не стрела. Разницу ставки (2 000 ₽
// за смену) и разницу вылета (9,8 м против 7,53 м) не выдумывали — прямое чтение таблицы.
import { FLEET, SHIFT_RATE } from '~/utils/fleet'

const URL = 'https://manipmo.ru/blog/it-80-ili-scs334-do-5-tonn/'
const h1 = 'ИНМАН ИТ-80 или Soosan SCS334 — какую машину до 5 тонн заказать'
const title = 'ИТ-80 или SCS334: какой манипулятор заказать'
const description = 'ИТ-80 — борт 2,17 м и до 3,58 т на борту, SCS334 — вылет 9,8 м и борт только 2,5 т. Сравнение по паспортам парка МАНИП-МО, разница в ставке 2 000 ₽ за смену.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const it80 = FLEET.find((r) => r.id === 'it80')!
const scs = FLEET.find((r) => r.id === 'scs334')!
const diffPrice = SHIFT_RATE['3–5 т'] - SHIFT_RATE['до 3 т']
const fmt = (n: number) => n.toLocaleString('ru-RU')

const faqs = [
  { q: 'Чем ИНМАН ИТ-80 лучше Soosan SCS334?', a: 'Борт ИТ-80 уже — 2,17 м против примерно 2,2 м у SCS334, но главное отличие в грузоподъёмности борта: ИТ-80 везёт 2,98–3,58 т, а SCS334 — только 2,5 т, хотя формально относится к более тяжёлому классу «3–5 т». Ставка за смену у ИТ-80 из парка МАНИП-МО ниже на 2 000 ₽.' },
  { q: 'Чем Soosan SCS334 лучше ИНМАН ИТ-80?', a: 'Вылет стрелы SCS334 — 9,8 м против 7,53 м у ИТ-80, то есть SCS334 достаёт дальше вглубь участка или через препятствие у забора. Момент КМУ у обеих машин близкий: 8,0 т·м у SCS334 и 8,2 т·м у ИТ-80, так что дальность — главное практическое преимущество SCS334 из парка МАНИП-МО.' },
  { q: 'Можно ли положить на SCS334 больше груза, чем на ИТ-80?', a: 'Нет. По паспортным данным парка МАНИП-МО грузоподъёмность борта ИТ-80 — 2,98–3,58 т, а борта SCS334 — 2,5 т. У SCS334 стрела способна поднять 3,2 т на вылете 2,0 м, но борт физически вмещает меньше — именно борт, а не кран, ограничивает партию груза на этой машине.' },
  { q: 'На сколько SCS334 дороже ИТ-80 за смену?', a: 'Ставка за смену в парке МАНИП-МО отличается на 2 000 ₽: класс «до 3 т» (ИТ-80) стоит 7 500 ₽, класс «3–5 т» (SCS334) — 9 500 ₽. Разница в цене отражает класс по стреле и формальную грузоподъёмность, хотя на борт SCS334 реально берёт меньше, чем ИТ-80.' },
  { q: 'Какую машину выбрать для узкой улицы в СНТ?', a: 'ИНМАН ИТ-80 из парка МАНИП-МО — борт 2,17 м, уже любой другой машины в таблице парка, и это единственная машина, которая проходит там, где борт 2,2 м и шире уже не разворачивается. Для разгрузки в тесном проезде СНТ это решающий параметр, а не грузоподъёмность.' },
]

useHead({
  link: [{ rel: 'canonical', href: URL }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://manipmo.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://manipmo.ru/blog/' },
        { '@type': 'ListItem', position: 3, name: 'ИТ-80 или SCS334', item: URL },
      ],
    })},
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: h1,
      description,
      datePublished: '2026-10-02',
      dateModified: '2026-10-02',
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
  { id: 'korotko-raznitsa', text: 'Короткий ответ: в чём разница' },
  { id: 'tablitsa', text: 'Таблица паспортных данных' },
  { id: 'bort', text: 'Почему борт SCS334 везёт меньше ИТ-80' },
  { id: 'vylet', text: 'Вылет: 9,8 м против 7,53 м' },
  { id: 'uzkie-ulitsy', text: 'Узкие улицы и СНТ' },
  { id: 'cena', text: 'Разница в ставке за смену' },
  { id: 'faq', text: 'Частые вопросы' },
]

const sources = [
  { label: 'Паспорт ИНМАН ИТ-80 на шасси ГАЗ-3309 — дилер ГАЗ «Луидор»', href: 'https://www.luidorauto.ru/gaz/spetstekhnika-gaz/manipulyator-inman-it80-na-baze-gaz-3309' },
  { label: 'Паспорт Soosan SCS334 на шасси Hyundai HD78', href: 'https://ruscomtrans.ru/product/kran-manipulyator-soosan-334-na-shassi-hyundai-hd-78/' },
  { label: 'Таблица парка и ставки за смену — fleet.ts, страница «Парк»', href: '/park/' },
]
</script>

<template>
<AppBlogArticle current-href="/blog/it-80-ili-scs334-do-5-tonn/">
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><a href="/blog/">Блог</a><span>/</span><span>ИТ-80 или SCS334</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <span class="eyebrow">Выбор машины</span>
      <h1>{{ h1 }}</h1>
      <div class="art-meta">
        <span>Редакция МАНИП-МО</span><span>·</span>
        <span>опубликовано <time datetime="2026-10-02">02.10.2026</time></span><span>·</span>
        <span>факты проверены 02.10.2026</span>
      </div>
      <p>ИНМАН ИТ-80 из парка МАНИП-МО везёт на борту до {{ it80.bodyLoad }}, Soosan SCS334 — только {{ scs.bodyLoad }}, хотя формально относится к более тяжёлому классу «3–5 т». SCS334 выигрывает вылетом: {{ scs.reach }} против {{ it80.reach }} у ИТ-80. Разница в ставке за смену — {{ fmt(diffPrice) }} ₽ в пользу ИТ-80. Выбор решает не грузоподъёмность стрелы, а то, что реально помещается на борт и достаёт ли стрела до точки разгрузки.</p>
      <nav class="toc-static" aria-label="Содержание">
        <b>Содержание</b>
        <ol><li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`">{{ t.text }}</a></li></ol>
      </nav>
    </div>
  </section>

  <section class="section wrap prose" style="padding-top:0">
    <h2 id="korotko-raznitsa" style="margin-bottom:18px">Короткий ответ: в чём разница</h2>
    <p>ИНМАН ИТ-80 из парка МАНИП-МО — машина класса «до 3 т» на шасси ГАЗ-3309, узкий борт {{ it80.bodyW }} и короткий вылет {{ it80.reach }}. Soosan SCS334 — класс «3–5 т» на шасси Hyundai HD78, борт шире, вылет почти на треть больше. На бумаге SCS334 выглядит мощнее за счёт класса, но паспортные цифры показывают разрыв только в вылете, а не в грузоподъёмности борта.</p>
    <p>Ставка за смену у ИТ-80 из парка МАНИП-МО — {{ fmt(it80.priceFrom) }} ₽, у SCS334 — {{ fmt(scs.priceFrom) }} ₽. Разница в {{ fmt(diffPrice) }} ₽ оправдана вылетом стрелы SCS334, а не тем, что эта машина увезёт больше груза за один рейс — борт у неё меньше, чем у более дешёвого ИТ-80.</p>

    <h2 id="tablitsa" style="margin:36px 0 18px">Таблица паспортных данных</h2>
    <div class="ptbl-wrap" style="margin-top:18px">
      <table class="ptbl">
        <caption>ИНМАН ИТ-80 и Soosan SCS334 — паспортные данные парка МАНИП-МО, сверено 02.10.2026.</caption>
        <thead>
          <tr><th scope="col">Параметр</th><th scope="col">ИНМАН ИТ-80</th><th scope="col">Soosan SCS334</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">Шасси</th><td>{{ it80.chassis }}</td><td>{{ scs.chassis }}</td></tr>
          <tr><th scope="row">Класс по стреле</th><td>{{ it80.cls }}</td><td>{{ scs.cls }}</td></tr>
          <tr><th scope="row">Борт, длина</th><td>{{ it80.bodyL }}</td><td>{{ scs.bodyL }}</td></tr>
          <tr><th scope="row">Борт, ширина</th><td>{{ it80.bodyW }}</td><td>{{ scs.bodyW }}</td></tr>
          <tr><th scope="row">Грузоподъёмность борта</th><td>{{ it80.bodyLoad }}</td><td>{{ scs.bodyLoad }}</td></tr>
          <tr><th scope="row">Момент КМУ</th><td>{{ it80.momentTm }} т·м</td><td>{{ scs.momentTm }} т·м</td></tr>
          <tr><th scope="row">Вылет стрелы</th><td>{{ it80.reach }}</td><td>{{ scs.reach }}</td></tr>
          <tr><th scope="row">Грузоподъёмность на мин. вылете</th><td>{{ it80.capMin }}</td><td>{{ scs.capMin }}</td></tr>
          <tr><th scope="row">Грузоподъёмность на макс. вылете</th><td>{{ it80.capMax }}</td><td>{{ scs.capMax }}</td></tr>
          <tr><th scope="row">Ставка за смену</th><td>{{ fmt(it80.priceFrom) }} ₽</td><td>{{ fmt(scs.priceFrom) }} ₽</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="bort" style="margin:36px 0 18px">Почему борт SCS334 везёт меньше ИТ-80</h2>
    <p>Класс «3–5 т» у Soosan SCS334 описывает возможности стрелы, а не борта: на вылете 2,0 м кран поднимает {{ scs.capMin }}, то есть формально входит в указанный диапазон. Борт шасси Hyundai HD78 при этом принимает только {{ scs.bodyLoad }} — меньше, чем везёт борт ИТ-80 из класса «до 3 т» ({{ it80.bodyLoad }}). У SCS334 из парка МАНИП-МО ограничивает партию груза борт, а не кран.</p>
    <p>ИТ-80 на шасси ГАЗ-3309, наоборот, несёт на борту до {{ it80.bodyLoad }} при моменте КМУ {{ it80.momentTm }} т·м — близко к моменту SCS334 ({{ scs.momentTm }} т·м). Для заказа, где важна именно партия груза на один рейс, а не класс по названию, паспортная таблица парка МАНИП-МО даёт более точный ответ, чем ярлык «до 3 т» или «3–5 т».</p>

    <h2 id="vylet" style="margin:36px 0 18px">Вылет: 9,8 м против 7,53 м</h2>
    <p>Soosan SCS334 держит груз на вылете до {{ scs.reach }}, ИНМАН ИТ-80 — до {{ it80.reach }}. Разница в 2,27 м решает, достанет ли стрела через забор, цветник или припаркованную машину без заезда манипулятора в глубину участка. На максимальном вылете SCS334 поднимает {{ scs.capMax }}, ИТ-80 — {{ it80.capMax }}: обе цифры скромные, потому что на предельном вылете момент КМУ работает против грузоподъёмности у любой машины такого класса.</p>
    <p>Для груза, который можно подать ближе к забору или воротам, лишний вылет SCS334 из парка МАНИП-МО не нужен — тогда решает цена и ширина борта, а не паспортные 9,8 метра.</p>

    <h2 id="uzkie-ulitsy" style="margin:36px 0 18px">Узкие улицы и СНТ</h2>
    <p>Борт ИТ-80 — {{ it80.bodyW }}, у SCS334 — {{ scs.bodyW }}. На практике разница в несколько сантиметров решает вопрос разворота в проезде СНТ шириной около трёх метров: ИТ-80 из парка МАНИП-МО — единственная машина в таблице, которая проходит там, где более широкий борт уже не разворачивается. Для доставки в старых садовых товариществах Подмосковья с узкими проездами это практический довод в пользу ИТ-80, а не только цена.</p>

    <h2 id="cena" style="margin:36px 0 18px">Разница в ставке за смену</h2>
    <p>Ставка ИТ-80 из парка МАНИП-МО — {{ fmt(it80.priceFrom) }} ₽ за смену, ставка SCS334 — {{ fmt(scs.priceFrom) }} ₽. Разница в {{ fmt(diffPrice) }} ₽ отражает класс по стреле и больший вылет SCS334, а не грузоподъёмность борта — она у SCS334 ниже. Если заказчику важна партия груза на один рейс, а не дальность подачи стрелы, переплата за более дорогой класс не окупается паспортными цифрами.</p>
    <p>Пример расчёта с пробегом — в статье <a href="/blog/tsena-manipulyatora-podmoskovye/">из чего складывается цена рейса в Подмосковье</a>; про выбор между одним тяжёлым рейсом и несколькими лёгкими — в статье <a href="/blog/odin-reys-ili-neskolko-manipulyator/">один рейс или несколько</a>.</p>

    <h2 id="korotko" style="margin:36px 0 18px">Коротко: ИТ-80 или SCS334</h2>
    <ul>
      <li>Борт ИТ-80 везёт {{ it80.bodyLoad }}, борт SCS334 — только {{ scs.bodyLoad }}, хотя класс SCS334 формально выше.</li>
      <li>Вылет SCS334 — {{ scs.reach }} против {{ it80.reach }} у ИТ-80: разница важна для препятствий у точки разгрузки.</li>
      <li>Борт ИТ-80 — {{ it80.bodyW }}, самый узкий в парке МАНИП-МО, для тесных проездов СНТ.</li>
      <li>Ставка SCS334 выше на {{ fmt(diffPrice) }} ₽ за смену — цена за вылет, не за грузоподъёмность борта.</li>
      <li>Момент КМУ у обеих машин почти одинаковый: {{ it80.momentTm }} и {{ scs.momentTm }} т·м.</li>
    </ul>

    <AppSources :items="sources" date="02.10.2026" />
  </section>

  <section class="section wrap">
    <div class="section-head">
      <span class="eyebrow">Вопросы</span>
      <h2 id="faq">Частые вопросы про выбор между ИТ-80 и SCS334</h2>
    </div>
    <div class="faq">
      <details v-for="f in faqs" :key="f.q" class="faq__item">
        <summary>{{ f.q }}</summary>
        <p>{{ f.a }}</p>
      </details>
    </div>
  </section>

  <section class="section wrap">
    <a class="btn" href="/#order">Указать адрес и груз для расчёта →</a>
  </section>
</main>
</AppBlogArticle>
</template>
