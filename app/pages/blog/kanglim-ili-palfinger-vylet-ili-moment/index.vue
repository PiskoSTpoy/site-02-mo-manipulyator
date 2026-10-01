<script setup lang="ts">
// Статья 01.10.2026 (угол «коммерческая / сравнительная»). Каркас — seo-2026-playbook §1.
// ВСЕ цифры — из fleet.ts (паспорта машин, сверено 12.08.2026): момент, вылет, грузоподъёмность на концах диапазона,
// борт, полная масса, ставка смены, тариф за км. Внешних нормативных источников нет.
// Оценка «момент ÷ вылет» для Kanglim на 8 м подана как ВЕРХНЯЯ граница, а не паспортная цифра:
// на 20,7 м паспорт даёт 300 кг (6,2 т·м), то есть на длинном вылете реальная цифра ниже деления момента.
import { FLEET, SHIFT_RATE, KM_RATE, MKAD_PASS_GVW_T } from '~/utils/fleet'

const URL = 'https://manipmo.ru/blog/kanglim-ili-palfinger-vylet-ili-moment/'
const h1 = 'Что выбрать: Kanglim KS1256G-II с вылетом 18,7 м или Palfinger PK 23500A?'
const title = 'Kanglim KS1256G-II или Palfinger PK 23500A: что выбрать'
const description = 'Kanglim KS1256G-II достаёт на 18,7 м при моменте 15 т·м, Palfinger PK 23500A — на 8,0 м при 22,4 т·м и держит там 2 730 кг. Сравнение по паспортам и ставкам.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const ks = FLEET.find((r) => r.id === 'ks1256')!
const pk = FLEET.find((r) => r.id === 'pk23500')!
const fmt = (n: number) => n.toLocaleString('ru-RU')
const num = (n: number) => String(n).replace('.', ',')
const distKm = 30
const trip = (cls: string) => SHIFT_RATE[cls]! + distKm * 2 * KM_RATE
const diff = SHIFT_RATE[pk.cls]! - SHIFT_RATE[ks.cls]!
// верхняя оценка грузоподъёмности Kanglim на вылете Palfinger: момент ÷ вылет, т (округление вниз до 0,1)
const ksAt8 = Math.floor((ks.momentTm / pk.reachM) * 10) / 10

const cmp = [
  { p: 'Грузовой момент, т·м', a: num(ks.momentTm), b: num(pk.momentTm) },
  { p: 'Максимальный вылет', a: ks.reach, b: pk.reach },
  { p: 'Грузоподъёмность на минимальном вылете', a: ks.capMin, b: pk.capMin },
  { p: 'Грузоподъёмность на максимальном вылете', a: ks.capMax, b: pk.capMax },
  { p: 'Борт, длина × ширина', a: `${ks.bodyL} × ${ks.bodyW}`, b: `${pk.bodyL} × ${pk.bodyW}` },
  { p: 'Что принимает борт', a: ks.bodyLoad, b: pk.bodyLoad },
  { p: 'Полная масса, т', a: num(ks.gvwT), b: num(pk.gvwT) },
  { p: 'Ставка за смену 8 ч, ₽', a: fmt(SHIFT_RATE[ks.cls]!), b: fmt(SHIFT_RATE[pk.cls]!) },
]

const faqs = [
  { q: 'Какой манипулятор достаёт дальше — Kanglim KS1256G-II или Palfinger PK 23500A?', a: 'Kanglim KS1256G-II: паспортный вылет 18,7 м, а с грузом 300 кг — 20,7 м. Palfinger PK 23500A в исполнении A из парка МАНИП-МО дотягивается на 8,0 м. Разница больше чем вдвое, поэтому за забор, канаву или вглубь участка МАНИП-МО отправляет Kanglim.' },
  { q: 'Какой манипулятор поднимет больше на вылете 8 метров?', a: 'Palfinger PK 23500A: по паспорту 2 730 кг на 8,0 м. У Kanglim KS1256G-II грузовой момент 15 т·м, и деление на 8 м даёт не более 1,8 т как верхнюю оценку. Точное значение МАНИП-МО берёт из паспортной таблицы вылетов Kanglim, и оно ниже этой оценки.' },
  { q: 'Насколько Palfinger PK 23500A дороже Kanglim KS1256G-II?', a: 'На 4 500 ₽ за смену: ставка МАНИП-МО для класса 10–20 т — 18 000 ₽, для класса 5–10 т — 13 500 ₽. Пробег за МКАД у обеих машин считается одинаково, по 55 ₽ за километр в обе стороны, поэтому разница не зависит от расстояния до объекта.' },
  { q: 'Нужен ли пропуск на МКАД для Kanglim и Palfinger?', a: 'Нужен обеим машинам: полная масса КАМАЗ-65115 с Kanglim KS1256G-II — 24,8 т, КАМАЗ-65117 с Palfinger PK 23500A — 24,0 т, а порог пропуска — 12 т. По этому параметру выбора между двумя тяжёлыми машинами МАНИП-МО нет, пропуск закладывают в любом случае.' },
  { q: 'Есть ли у Palfinger PK 23500 исполнение с длинной стрелой?', a: 'Есть: у PK 23500 пять исполнений A–E, и исполнение E достаёт до 16,5 м. Цена длины — момент падает до 20,7 т·м, а на конце стрелы остаётся 960 кг. В парке МАНИП-МО стоит исполнение A с вылетом 8,0 м, поэтому в сравнении участвует именно оно.' },
]

useHead({
  link: [{ rel: 'canonical', href: URL }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://manipmo.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://manipmo.ru/blog/' },
        { '@type': 'ListItem', position: 3, name: 'Kanglim или Palfinger', item: URL },
      ],
    })},
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: h1,
      description,
      datePublished: '2026-10-01',
      dateModified: '2026-10-01',
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
  { id: 'pasporta', text: 'Паспорта двух машин в одной таблице' },
  { id: 'vylet', text: 'Когда решает вылет' },
  { id: 'moment', text: 'Когда решает момент' },
  { id: 'bort', text: 'Борт и полная масса' },
  { id: 'tsena', text: 'Разница в цене рейса' },
  { id: 'vybor', text: 'Три вопроса для выбора' },
  { id: 'faq', text: 'Частые вопросы' },
]

const sources = [
  { label: `Паспортные данные: ${ks.src.label}`, href: ks.src.href },
  { label: `Паспортные данные: ${pk.src.label}`, href: pk.src.href },
  { label: 'Сводная таблица парка, ставки за смену и тариф за километр — МАНИП-МО (fleet.ts)', href: '/park/' },
]
</script>

<template>
<AppBlogArticle current-href="/blog/kanglim-ili-palfinger-vylet-ili-moment/">
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><a href="/blog/">Блог</a><span>/</span><span>Kanglim или Palfinger</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <span class="eyebrow">Выбор машины</span>
      <h1>{{ h1 }}</h1>
      <div class="art-meta">
        <span>Редакция МАНИП-МО</span><span>·</span>
        <span>опубликовано <time datetime="2026-10-01">01.10.2026</time></span><span>·</span>
        <span>факты проверены 01.10.2026</span>
      </div>
      <p>Kanglim KS1256G-II достаёт на {{ ks.reach }} при грузовом моменте {{ num(ks.momentTm) }} т·м. Palfinger PK 23500A дотягивается только на {{ pk.reach }}, зато при моменте {{ num(pk.momentTm) }} т·м держит на этом вылете 2 730 кг. Выбор в парке МАНИП-МО сводится к одному вопросу: груз лёгкий и далеко — Kanglim, груз тяжёлый и рядом с машиной — Palfinger. Разница в ставке — {{ fmt(diff) }} ₽ за смену.</p>
      <nav class="toc-static" aria-label="Содержание">
        <b>Содержание</b>
        <ol><li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`">{{ t.text }}</a></li></ol>
      </nav>
    </div>
  </section>

  <section class="section wrap prose" style="padding-top:0">
    <h2 id="pasporta" style="margin-bottom:18px">Паспорта двух машин в одной таблице</h2>
    <p>Kanglim KS1256G-II на шасси {{ ks.chassis }} и Palfinger PK 23500A на шасси {{ pk.chassis }} — две тяжёлые машины парка МАНИП-МО, и по восьми паспортным параметрам они расходятся в противоположные стороны. Таблица собрана из паспортных данных дилеров, без округлений «в пользу» одной из машин.</p>
    <div class="ptbl-wrap" style="margin-top:18px">
      <table class="ptbl">
        <caption>Kanglim KS1256G-II и Palfinger PK 23500A (исполнение A): паспортные данные и ставки парка МАНИП-МО (fleet.ts), сверено 01.10.2026.</caption>
        <thead>
          <tr><th scope="col">Параметр</th><th scope="col">Kanglim KS1256G-II</th><th scope="col">Palfinger PK 23500A</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in cmp" :key="c.p">
            <th scope="row">{{ c.p }}</th><td>{{ c.a }}</td><td>{{ c.b }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>Главное наблюдение по таблице МАНИП-МО: больший момент не означает большего вылета. Palfinger PK 23500A сильнее в полтора раза по моменту и при этом короче более чем вдвое по стреле. Класс «10–20 т» в названии говорит о силе машины вблизи, а не о том, как далеко она подаст груз.</p>

    <h2 id="vylet" style="margin:36px 0 18px">Когда решает вылет</h2>
    <p>Kanglim KS1256G-II с вылетом {{ ks.reach }} — единственная машина парка МАНИП-МО, которая подаёт груз за препятствие: через забор, канаву, палисадник или уже построенный гараж. Palfinger PK 23500A с вылетом {{ pk.reach }} для такой задачи должен подъехать вплотную, а на участке с готовым благоустройством подъезда вплотную часто нет.</p>
    <p>Цена длинной стрелы Kanglim KS1256G-II записана в том же паспорте: на предельном вылете машина держит {{ ks.capMax }}. Поддон кирпича или бетонное кольцо на таком расстоянии Kanglim не подаст, а пачку досок, рулон сетки или лёгкий бак — подаст. МАНИП-МО поэтому спрашивает в заявке не только расстояние до точки укладки, но и массу одного места груза.</p>

    <h2 id="moment" style="margin:36px 0 18px">Когда решает момент</h2>
    <p>Palfinger PK 23500A держит {{ pk.capMax }} — это паспортная цифра. Kanglim KS1256G-II на том же вылете ограничен моментом {{ num(ks.momentTm) }} т·м: деление на 8 м даёт не более {{ num(ksAt8) }} т, и это верхняя оценка, а не паспортное значение. Реальная цифра Kanglim из таблицы вылетов ниже, потому что часть момента съедает вес самой выдвинутой стрелы.</p>
    <p>Практический вывод МАНИП-МО из этой пары чисел: груз от двух тонн, который нужно положить в 6–8 метрах от борта, — задача Palfinger PK 23500A, даже если по общему тоннажу партии хватило бы машины классом ниже. Типичные случаи — бетонные блоки, плиты перекрытия, станок, ёмкость. Как считать момент под свой груз, разобрано в статье <a href="/blog/gruzovoy-moment-kak-schitat/">про грузовой момент</a>.</p>

    <h2 id="bort" style="margin:36px 0 18px">Борт и полная масса</h2>
    <p>Борт Palfinger PK 23500A принимает {{ pk.bodyLoad }} при длине {{ pk.bodyL }} — в парке МАНИП-МО это самая грузоподъёмная платформа. Для Kanglim KS1256G-II паспорт шасси даёт другую величину: {{ ks.bodyLoad }}, куда входят сама установка и платформа. Чистый остаток под груз у Kanglim заметно меньше этой цифры, и МАНИП-МО называет его по конкретной машине при расчёте заявки, а не оценивает на глаз.</p>
    <p>Полная масса у машин почти одинакова: {{ num(ks.gvwT) }} т у Kanglim KS1256G-II и {{ num(pk.gvwT) }} т у Palfinger PK 23500A. Обе вдвое превышают порог {{ MKAD_PASS_GVW_T }} т, после которого для дневного въезда на МКАД нужен грузовой пропуск. Сэкономить на пропуске выбором одной из двух тяжёлых машин МАНИП-МО не получится — эта статья расходов у них общая. Ширина борта тоже близка: {{ ks.bodyW }} против {{ pk.bodyW }}.</p>

    <h2 id="tsena" style="margin:36px 0 18px">Разница в цене рейса</h2>
    <p>Ставка МАНИП-МО за смену 8 часов — {{ fmt(SHIFT_RATE[ks.cls]!) }} ₽ для Kanglim KS1256G-II (класс {{ ks.cls }}) и {{ fmt(SHIFT_RATE[pk.cls]!) }} ₽ для Palfinger PK 23500A (класс {{ pk.cls }}). Пробег за МКАД считается одинаково: {{ KM_RATE }} ₽ за километр в обе стороны. Пример для объекта в {{ distKm }} км от МКАД: Kanglim — {{ fmt(trip(ks.cls)) }} ₽, Palfinger — {{ fmt(trip(pk.cls)) }} ₽.</p>
    <p>Разница в {{ fmt(diff) }} ₽ у МАНИП-МО постоянна на любом расстоянии, поэтому решать по цене имеет смысл только тогда, когда задачу выполняют обе машины. Если Palfinger PK 23500A не дотягивается до точки укладки, экономии нет: груз придётся перекладывать второй техникой. Если Kanglim KS1256G-II не держит массу на нужном вылете, экономия в {{ fmt(diff) }} ₽ оборачивается повторным выездом.</p>

    <h2 id="vybor" style="margin:36px 0 18px">Три вопроса для выбора</h2>
    <p>Выбор между Kanglim KS1256G-II и Palfinger PK 23500A диспетчер МАНИП-МО делает по трём числам из заявки. Порядок вопросов важен: первый отсекает машину по геометрии, второй — по силе, третий — по борту.</p>
    <ol>
      <li>Расстояние от места стоянки машины до точки укладки. Больше {{ pk.reach }} — остаётся только Kanglim KS1256G-II.</li>
      <li>Масса самого тяжёлого места груза. От двух тонн на вылете 6–8 м — Palfinger PK 23500A.</li>
      <li>Общий тоннаж партии за рейс. До {{ pk.bodyLoad }} одним рейсом МАНИП-МО везёт на Palfinger PK 23500A.</li>
    </ol>
    <p>Спорный случай — тяжёлый груз далеко от проезда — не решается ни одной из двух машин МАНИП-МО в одиночку. Вариантов два: готовить подъезд ближе к точке укладки под Palfinger PK 23500A или брать автокран через партнёрскую сеть. Чем манипулятор отличается от автокрана по задаче, описано в статье <a href="/blog/manipulyator-ili-avtokran/">«Манипулятор или автокран»</a>.</p>

    <h2 id="korotko" style="margin:36px 0 18px">Коротко о выборе между Kanglim и Palfinger</h2>
    <ul>
      <li>Kanglim KS1256G-II: вылет {{ ks.reach }}, момент {{ num(ks.momentTm) }} т·м, на конце стрелы — сотни килограммов.</li>
      <li>Palfinger PK 23500A: вылет {{ pk.reach }}, момент {{ num(pk.momentTm) }} т·м, на конце стрелы — {{ pk.capMax }}.</li>
      <li>Обе машины МАНИП-МО тяжелее {{ MKAD_PASS_GVW_T }} т, пропуск на МКАД нужен обеим.</li>
      <li>Разница в ставке МАНИП-МО — {{ fmt(diff) }} ₽ за смену и не зависит от расстояния.</li>
      <li>Далеко и легко — Kanglim, близко и тяжело — Palfinger.</li>
    </ul>

    <AppSources :items="sources" date="01.10.2026" />
  </section>

  <section class="section wrap">
    <div class="section-head">
      <span class="eyebrow">Вопросы</span>
      <h2 id="faq">Частые вопросы про Kanglim и Palfinger</h2>
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
