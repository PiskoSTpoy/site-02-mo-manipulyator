<script setup lang="ts">
// Статья 25.09.2026 (угол «коммерческая / сравнительная»). Каркас — seo-2026-playbook §1.
// Все характеристики и ставки берутся из utils/fleet.ts (FLEET, SHIFT_RATE, KM_RATE,
// MKAD_PASS_GVW_T) — тем же источником, что /park/ и конфигуратор, чтобы цифры
// в статье физически не могли разойтись с таблицей парка.
import { FLEET, SHIFT_RATE, KM_RATE, MKAD_PASS_GVW_T } from '~/utils/fleet'

const URL = 'https://manipmo.ru/blog/kakoy-manipulyator-zakazat-tonnazh/'
const h1 = 'Манипулятор на 3, 5, 7 или 10 тонн — что означают тонны и какой класс заказать'
const title = 'Манипулятор 3, 5, 7 или 10 тонн: какой заказать'
const description = '«Манипулятор 5 тонн» может означать борт или стрелу. Сравниваем 4 класса парка МАНИП-МО по борту, стреле, вылету и цене от 7 500 ₽ за смену.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const byId = Object.fromEntries(FLEET.map((r) => [r.id, r]))
const it80 = byId.it80!, scs = byId.scs334!, ks = byId.ks1256!, pk = byId.pk23500!
const rub = (n: number) => n.toLocaleString('ru-RU').replace(/ /g, ' ')
const exampleKm = 30
const exampleTotal = SHIFT_RATE['3–5 т']! + exampleKm * 2 * KM_RATE

const faqs = [
  { q: 'Что значит «манипулятор 5 тонн» в объявлении об аренде?', a: 'Единого правила нет: одни арендодатели называют класс по грузоподъёмности стрелы, другие — по грузоподъёмности борта. У Soosan SCS334 из парка МАНИП-МО стрела берёт 3 200 кг, а борт — 2,5 т, поэтому по одной цифре машина попадает в один класс, а по другой — в соседний. Спрашивайте обе цифры и грузоподъёмность стрелы на нужном вылете.' },
  { q: 'Какой манипулятор нужен для одного поддона кирпича?', a: 'Поддон одинарного кирпича весит около 2,0–2,1 т. Стрела ИНМАН ИТ-80 берёт 3 050 кг только вблизи машины, а на вылете 7,53 м — 790 кг, поэтому поддон выгружают рядом с бортом. Если поддон нужно положить в 6–8 м от машины, МАНИП-МО подбирает Palfinger PK 23500A: на вылете 8,0 м он поднимает 2 730 кг.' },
  { q: 'Почему класс «10–20 т» поднимает стрелой меньше, чем класс «5–10 т»?', a: 'Класс в парке МАНИП-МО назван по задаче заказчика — по массе, которую везут на борту. Palfinger PK 23500A везёт 11,2 т, но стрелой поднимает до 4 900 кг на 4,6 м. Kanglim KS1256G-II поднимает до 7 000 кг у машины и достаёт до 18,7 м. Один класс силён бортом, другой — стрелой.' },
  { q: 'Нужен ли пропуск на МКАД для манипулятора?', a: 'Грузовой пропуск в Москву нужен машинам с полной массой больше 12 т. В парке МАНИП-МО это трёхосные Kanglim KS1256G-II (24,8 т) и Palfinger PK 23500A (24,0 т). Двухосные ИНМАН ИТ-80 (8,18 т) и Soosan SCS334 (7,5 т) под этот порог не попадают.' },
]

useHead({
  link: [{ rel: 'canonical', href: URL }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://manipmo.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://manipmo.ru/blog/' },
        { '@type': 'ListItem', position: 3, name: 'Какой манипулятор заказать по тоннажу', item: URL },
      ],
    })},
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: h1,
      description,
      datePublished: '2026-09-25',
      dateModified: '2026-09-25',
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
  { id: 'dve-tsifry', text: 'Две разные цифры: борт и стрела' },
  { id: 'chetyre-klassa', text: 'Четыре класса парка в одной таблице' },
  { id: 'podbor-po-zadache', text: 'Какой класс под какую задачу' },
  { id: 'propusk-i-podezd', text: 'Полная масса: пропуск и подъезд' },
  { id: 'tsena', text: 'Как класс влияет на цену' },
  { id: 'faq', text: 'Частые вопросы' },
]

const sources = [
  { label: it80.src.label, href: it80.src.href },
  { label: scs.src.label, href: scs.src.href },
  { label: ks.src.label, href: ks.src.href },
  { label: pk.src.label, href: pk.src.href },
  { label: 'Пример рыночного названия класса по стреле: «Манипуляторы с грузоподъёмностью стрелы 5 тонн» (каталог аренды, Москва и МО)', href: 'https://mtarenda.ru/catalog/arenda-manipulyatora/do-5-tonn/' },
  { label: 'Масса поддона кирпича по форматам — разбор в статье «Сколько поддонов влезает в манипулятор»', href: '/blog/skolko-poddonov-v-manipulyator/' },
]
</script>

<template>
<AppBlogArticle current-href="/blog/kakoy-manipulyator-zakazat-tonnazh/">
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><a href="/blog/">Блог</a><span>/</span><span>Какой манипулятор заказать по тоннажу</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <span class="eyebrow">Выбор техники</span>
      <h1>{{ h1 }}</h1>
      <div class="art-meta">
        <span>Редакция МАНИП-МО</span><span>·</span>
        <span>опубликовано <time datetime="2026-09-25">25.09.2026</time></span><span>·</span>
        <span>факты проверены 25.09.2026</span>
      </div>
      <p>«Тонны» в названии манипулятора означают либо грузоподъёмность борта, либо грузоподъёмность стрелы у самой машины — и эти цифры часто не совпадают. У Soosan SCS334 стрела берёт {{ scs.capMin }}, а борт — {{ scs.bodyLoad }}. Поэтому класс выбирают по трём цифрам сразу: масса груза на борту, масса одного подъёма и вылет, на который его нужно положить.</p>
      <nav class="toc-static" aria-label="Содержание">
        <b>Содержание</b>
        <ol><li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`">{{ t.text }}</a></li></ol>
      </nav>
    </div>
  </section>

  <section class="section wrap prose" style="padding-top:0">
    <h2 id="dve-tsifry" style="margin-bottom:18px">Две разные цифры: борт и стрела</h2>
    <p>Грузоподъёмность борта — это сколько груза манипулятор везёт, а грузоподъёмность стрелы — сколько КМУ поднимает за один подъём. Рынок аренды в Москве и области называет классы по-разному: часть каталогов прямо пишет «грузоподъёмность стрелы 5 тонн», часть указывает тоннаж без уточнения. Для заказчика это значит одно: цифра из объявления сама по себе не отвечает, справится ли машина, — поэтому МАНИП-МО в таблице парка показывает обе.</p>
    <p>Парк МАНИП-МО показывает расхождение нагляднее всего на двух машинах. Soosan SCS334 поднимает стрелой {{ scs.capMin }}, но борт принимает только {{ scs.bodyLoad }} — ограничивает кузов, а не кран. Palfinger PK 23500A, наоборот, везёт {{ pk.bodyLoad }}, а стрелой поднимает {{ pk.capMin }} — ограничивает кран, а не кузов. Как грузоподъёмность стрелы падает с вылетом, разобрано в статье про <a href="/blog/gruzovoy-moment-kak-schitat/">грузовой момент</a>.</p>

    <h2 id="chetyre-klassa" style="margin:36px 0 18px">Четыре класса парка в одной таблице</h2>
    <p>Классы в парке МАНИП-МО названы по задаче заказчика: «до 3 т», «3–5 т», «5–10 т», «10–20 т». Ниже — паспортные цифры каждой машины, те же, что на странице <a href="/park/">парка</a>. Стрела указана дважды: у машины и на максимальном вылете, потому что заказчику почти всегда нужна вторая цифра.</p>
    <div class="ptbl-wrap" style="margin-top:18px">
      <table class="ptbl">
        <caption>Парк МАНИП-МО по классам: борт, стрела, вылет, полная масса, ставка за смену (8 ч). Паспортные данные, сверены 12.08.2026.</caption>
        <thead>
          <tr><th scope="col">Класс</th><th scope="col">Машина</th><th scope="col">Борт</th><th scope="col">Стрела у машины</th><th scope="col">Стрела на макс. вылете</th><th scope="col">Полная масса</th><th scope="col">Смена от</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in FLEET" :key="r.id">
            <th scope="row">{{ r.cls }}</th>
            <td>{{ r.kmu }}, {{ r.chassis }}</td>
            <td>{{ r.bodyLoad }}; {{ r.bodyL }} × {{ r.bodyW }}</td>
            <td>{{ r.capMin }}</td>
            <td>{{ r.capMax }}</td>
            <td>{{ String(r.gvwT).replace('.', ',') }} т</td>
            <td>{{ rub(r.priceFrom) }} ₽</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="podbor-po-zadache" style="margin:36px 0 18px">Какой класс под какую задачу</h2>
    <p>ИНМАН ИТ-80 класса «до 3 т» выбирают, когда решает подъезд: борт {{ it80.bodyW }} проходит по узкой улице СНТ, где машина шириной 2,55 м уже не проходит. Стрела ИТ-80 берёт {{ it80.capMin }} у машины и {{ it80.capMax }}, поэтому тяжёлый груз кладут рядом с бортом. Подходит для мешков, пиломатериала, одного-двух поддонов и небольших колец колодца.</p>
    <p>Soosan SCS334 класса «3–5 т» — машина для мелкой партии с выгрузкой подальше: вылет {{ scs.reach }}, на конце стрелы {{ scs.capMax.replace(' на 9,8 м', '') }}. Борт {{ scs.bodyLoad }} означает, что два поддона кирпича по 2,0–2,1 т на него уже не встают. В МАНИП-МО этот класс берут для поддонов с блоками, стройматериалов в мешках и лёгких конструкций.</p>
    <p>Kanglim KS1256G-II класса «5–10 т» — единственная машина парка МАНИП-МО, которая кладёт груз вглубь участка: вылет {{ ks.reach }}. У машины стрела поднимает {{ ks.capMin }}, на конце — {{ ks.capMax }}. Этот класс берут, когда груз нужно перенести через забор, кювет или грядки, не заезжая на участок, — например, как в статье про <a href="/blog/kyuvet-sezd-na-uchastok-manipulyator/">разгрузку через кювет</a>.</p>
    <p>Palfinger PK 23500A класса «10–20 т» — тяжёлый груз близко к машине: {{ pk.capMax }}, больше, чем ИНМАН ИТ-80 поднимает вообще. Борт {{ pk.bodyL }} и {{ pk.bodyLoad }} груза подходят для бытовки длиной 6 м, нескольких поддонов кирпича за рейс и блоков ФБС. Далеко этот манипулятор не достаёт: максимальный вылет исполнения A — {{ pk.reach }}.</p>

    <h2 id="propusk-i-podezd" style="margin:36px 0 18px">Полная масса: пропуск и подъезд</h2>
    <p>Порог {{ MKAD_PASS_GVW_T }} т полной массы делит парк МАНИП-МО ровно пополам. Двухосные ИНМАН ИТ-80 ({{ String(it80.gvwT).replace('.', ',') }} т) и Soosan SCS334 ({{ String(scs.gvwT).replace('.', ',') }} т) едут в Москву без грузового пропуска. Трёхосные Kanglim KS1256G-II ({{ String(ks.gvwT).replace('.', ',') }} т) и Palfinger PK 23500A ({{ String(pk.gvwT).replace('.', ',') }} т) днём въезжают на МКАД и внутрь неё только с пропуском — порядок описан в статье про <a href="/blog/propusk-mkad-ttk-gruzovik/">пропуск МКАД и ТТК</a>.</p>
    <p>Тот же порог действует на подъезде в Подмосковье: знак 3.11 или 3.12 на мосту, ограничения в СНТ и слабое покрытие дороги отсекают тяжёлый класс раньше, чем груз. Поэтому МАНИП-МО спрашивает при заявке не только массу груза, но и маршрут к точке выгрузки — ответ иногда сдвигает выбор на машину меньшего класса и два рейса. Нагрузку на ось разбирали в статье про <a href="/blog/znak-3-12-nagruzka-na-os-manipulyator/">знак 3.12</a>.</p>

    <h2 id="tsena" style="margin:36px 0 18px">Как класс влияет на цену</h2>
    <p>Ставка МАНИП-МО за смену 8 часов растёт с классом: {{ rub(SHIFT_RATE['до 3 т']!) }} ₽ у класса «до 3 т», {{ rub(SHIFT_RATE['3–5 т']!) }} ₽ у «3–5 т», {{ rub(SHIFT_RATE['5–10 т']!) }} ₽ у «5–10 т» и {{ rub(SHIFT_RATE['10–20 т']!) }} ₽ у «10–20 т». К ставке добавляется километраж от МКАД — {{ KM_RATE }} ₽ за километр в одну сторону, в расчёт идёт дорога туда и обратно.</p>
    <p>Пример расчёта МАНИП-МО: Soosan SCS334 на объект в {{ exampleKm }} км от МКАД — {{ rub(SHIFT_RATE['3–5 т']!) }} ₽ смена плюс {{ exampleKm }} × 2 × {{ KM_RATE }} = {{ rub(exampleKm * 2 * KM_RATE) }} ₽ дорога, итого от {{ rub(exampleTotal) }} ₽. Переплата за лишний класс — это разница ставок, а недобор класса стоит дороже: второй рейс или сорванная выгрузка. Если груз на грани двух классов, берите тот, у которого стрела проходит по нужному вылету.</p>

    <h2 id="korotko" style="margin:36px 0 18px">Коротко о выборе класса манипулятора</h2>
    <ul>
      <li>«Тонны» в объявлении — это борт или стрела; у Soosan SCS334 парка МАНИП-МО стрела 3 200 кг, борт 2,5 т.</li>
      <li>Стрела у машины и стрела на вылете отличаются в разы: у ИНМАН ИТ-80 — 3 050 кг и 790 кг.</li>
      <li>Далеко за забор — Kanglim KS1256G-II с вылетом 18,7 м; тяжело и близко — Palfinger PK 23500A.</li>
      <li>Полная масса больше 12 т — пропуск на МКАД; двухосные машины МАНИП-МО его не требуют.</li>
      <li>Ставка МАНИП-МО от 7 500 до 18 000 ₽ за смену плюс 55 ₽/км от МКАД в каждую сторону.</li>
    </ul>

    <AppSources :items="sources" date="25.09.2026" />
  </section>

  <section class="section wrap">
    <div class="section-head">
      <span class="eyebrow">Вопросы</span>
      <h2 id="faq">Частые вопросы про тоннаж манипулятора</h2>
    </div>
    <div class="faq">
      <details v-for="f in faqs" :key="f.q" class="faq__item">
        <summary>{{ f.q }}</summary>
        <p>{{ f.a }}</p>
      </details>
    </div>
  </section>

  <section class="section wrap">
    <a class="btn" href="/#order">Описать груз и подобрать машину →</a>
  </section>
</main>
</AppBlogArticle>
</template>
