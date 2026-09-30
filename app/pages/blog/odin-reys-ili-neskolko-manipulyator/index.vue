<script setup lang="ts">
// Статья 30.09.2026 (угол «сравнительная»). Каркас — seo-2026-playbook §1.
// ВСЕ цифры — из fleet.ts (борт, ставки, тариф за км); внешних чисел нет. Сценарий: 10 т груза, объект 20 км за МКАД.
// KS1256G-II в расчёт НЕ берём: в паспорте только «надстройка с грузом ≤ 17,4 т», чистая грузоподъёмность борта неизвестна.
import { FLEET, SHIFT_RATE, KM_RATE } from '~/utils/fleet'

const URL = 'https://manipmo.ru/blog/odin-reys-ili-neskolko-manipulyator/'
const h1 = 'Один тяжёлый манипулятор или несколько рейсов лёгкого: что выгоднее'
const title = 'Один тяжёлый манипулятор или несколько рейсов лёгкого'
const description = 'Расчёт на 10 тонн груза и объект в 20 км за МКАД: сколько рейсов нужно каждой машине парка и когда несколько лёгких рейсов дешевле одного тяжёлого.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const byId = Object.fromEntries(FLEET.map((r) => [r.id, r]))
const it = byId.it80!, scs = byId.scs334!, pk = byId.pk23500!

const cargoT = 10
const distKm = 20
const trip = distKm * 2 * KM_RATE // пробег за один рейс, ₽
const fmt = (n: number) => n.toLocaleString('ru-RU')

// Грузоподъёмность борта, т: ИТ-80 — нижняя граница диапазона 2,98–3,58 т; SCS334 — 2,5 т; PK 23500A — 11,2 т.
const cap = { it: 2.98, scs: 2.5, pk: 11.2 }
const n = (c: number) => Math.ceil(cargoT / c)
const nIt = n(cap.it), nScs = n(cap.scs), nPk = n(cap.pk)

// Худший случай: на каждый рейс своя смена + свой пробег. Лучший: все рейсы в одну смену, пробег за каждый.
const worst = (cls: string, k: number) => k * (SHIFT_RATE[cls]! + trip)
const best = (cls: string, k: number) => SHIFT_RATE[cls]! + k * trip

const calc = [
  { name: it.kmu, cls: it.cls, cap: '2,98 т (нижняя граница 2,98–3,58 т)', k: nIt, w: worst(it.cls, nIt), b: best(it.cls, nIt) },
  { name: scs.kmu, cls: scs.cls, cap: '2,5 т', k: nScs, w: worst(scs.cls, nScs), b: best(scs.cls, nScs) },
  { name: pk.kmu, cls: pk.cls, cap: '11,2 т', k: nPk, w: worst(pk.cls, nPk), b: best(pk.cls, nPk) },
]

const faqs = [
  { q: 'Сколько рейсов нужно на 10 тонн груза?', a: `Зависит от борта машины: Palfinger PK 23500A берёт на борт ${pk.bodyLoad}, поэтому 10 т увозит за один рейс. Soosan SCS334 с бортом ${scs.bodyLoad} потребует ${nScs} рейса, ИНМАН ИТ-80 с бортом ${it.bodyLoad} — ${nIt} рейса при нижней границе и 3 при верхней. МАНИП-МО считает по борту, а не по грузоподъёмности стрелы.` },
  { q: 'Почему стрела берёт больше, чем борт?', a: `Стрела и кузов рассчитаны независимо. У Soosan SCS334 стрела поднимает ${scs.capMin}, а борт принимает ${scs.bodyLoad}: рейс ограничивает борт. Поэтому класс «3–5 т» по стреле не означает 3–5 тонн за рейс, и МАНИП-МО считает количество рейсов по борту.` },
  { q: 'Можно ли уложить несколько рейсов в одну смену?', a: `Да, если склад близко и объект в пределах нескольких километров: смена 8 часов позволяет сделать несколько рейсов. Тогда платят одну ставку смены и пробег за каждый рейс. На плече в 20 км за МКАД это ${fmt(best(it.cls, nIt))} ₽ для ИНМАН ИТ-80 против ${fmt(worst(pk.cls, nPk))} ₽ за один рейс Palfinger, но успеть ли — решает время, а не формула.` },
  { q: 'Почему тяжёлая машина не всегда подходит?', a: `Тяжёлый класс работает близко к машине: у Palfinger PK 23500A стрела берёт ${pk.capMax}, а вылет составляет ${pk.reach}. Если груз нужно подать вглубь участка, машина с коротким вылетом не достанет. МАНИП-МО проверяет вылет до точки разгрузки, а потом уже считает число рейсов.` },
  { q: 'Нужен ли пропуск на МКАД, если ехать тяжёлой машиной?', a: 'Для рейсов в пределах области — нет, пропуск нужен при въезде в Москву на машине полной массой от 12 т. Расчёт в этой статье сделан для объекта за МКАД, поэтому пропуск в итоги не входит. Когда объект в Москве, МАНИП-МО добавляет пропуск в заявку отдельной строкой.' },
]

useHead({
  link: [{ rel: 'canonical', href: URL }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://manipmo.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://manipmo.ru/blog/' },
        { '@type': 'ListItem', position: 3, name: 'Один тяжёлый манипулятор или несколько рейсов', item: URL },
      ],
    })},
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: h1,
      description,
      datePublished: '2026-09-30',
      dateModified: '2026-09-30',
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
  { id: 'bort', text: 'Рейс ограничивает борт, а не стрела' },
  { id: 'rascet', text: 'Расчёт на 10 тонн и объект в 20 км' },
  { id: 'smena', text: 'Когда несколько рейсов укладываются в одну смену' },
  { id: 'vylet', text: 'Почему тяжёлая машина не всегда достаёт' },
  { id: 'vybor', text: 'Как выбрать машину под свой объём' },
  { id: 'faq', text: 'Частые вопросы' },
]

const sources = [
  { label: 'Борт, грузоподъёмность и вылет по моделям, ставки за смену и тариф за километр — парк МАНИП-МО (fleet.ts)', href: '/park/' },
  { label: it.src.label, href: it.src.href },
  { label: scs.src.label, href: scs.src.href },
  { label: pk.src.label, href: pk.src.href },
]
</script>

<template>
<AppBlogArticle current-href="/blog/odin-reys-ili-neskolko-manipulyator/">
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><a href="/blog/">Блог</a><span>/</span><span>Один тяжёлый манипулятор или несколько рейсов</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <span class="eyebrow">Выбор машины</span>
      <h1>{{ h1 }}</h1>
      <div class="art-meta">
        <span>Редакция МАНИП-МО</span><span>·</span>
        <span>опубликовано <time datetime="2026-09-30">30.09.2026</time></span><span>·</span>
        <span>факты проверены 30.09.2026</span>
      </div>
      <p>На {{ cargoT }} тонн груза до объекта в {{ distKm }} км за МКАД Palfinger PK 23500A из парка МАНИП-МО делает один рейс за {{ fmt(worst(pk.cls, nPk)) }} ₽, а ИНМАН ИТ-80 — {{ nIt }} рейса: {{ fmt(best(it.cls, nIt)) }} ₽, если все рейсы влезают в одну смену, и {{ fmt(worst(it.cls, nIt)) }} ₽, если каждому нужна своя. Выигрыш определяют борт машины и время цикла, а не класс по стреле.</p>
      <nav class="toc-static" aria-label="Содержание">
        <b>Содержание</b>
        <ol><li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`">{{ t.text }}</a></li></ol>
      </nav>
    </div>
  </section>

  <section class="section wrap prose" style="padding-top:0">
    <h2 id="bort" style="margin-bottom:18px">Рейс ограничивает борт, а не стрела</h2>
    <p>Число рейсов МАНИП-МО считает по борту, а не по стреле. Soosan SCS334 поднимает стрелой {{ scs.capMin }}, а борт принимает только {{ scs.bodyLoad }}. Стрела сильнее кузова, поэтому класс «{{ scs.cls }}» не означает столько же тонн за рейс. Для расчёта числа рейсов берут грузоподъёмность борта из паспорта машины.</p>
    <p>Борт у разных машин МАНИП-МО отличается в разы: у ИНМАН ИТ-80 — {{ it.bodyLoad }}, у Soosan SCS334 — {{ scs.bodyLoad }}, у Palfinger PK 23500A — {{ pk.bodyLoad }}. Для Kanglim KS1256G-II паспорт даёт только предел надстройки с грузом {{ '17,4' }} т, куда входит сама КМУ, поэтому чистую грузоподъёмность борта МАНИП-МО для этой машины не выводит и в расчёт не берёт. Как класс машины подбирают по грузу, разобрано в статье <a href="/blog/kakoy-manipulyator-zakazat-tonnazh/">какой манипулятор заказать по тоннажу</a>.</p>

    <h2 id="rascet" style="margin:36px 0 18px">Расчёт на {{ cargoT }} тонн и объект в {{ distKm }} км</h2>
    <p>Сценарий МАНИП-МО для сравнения: {{ cargoT }} тонн груза на поддонах, объект в {{ distKm }} км за МКАД, пропуск на МКАД не нужен. Пробег за один рейс — {{ distKm }} км × 2 × {{ KM_RATE }} ₽ = {{ fmt(trip) }} ₽. Худший случай для лёгких машин: на каждый рейс уходит целая смена. Лучший случай: все рейсы помещаются в одну смену, и ставка смены платится один раз.</p>
    <div class="ptbl-wrap" style="margin-top:18px">
      <table class="ptbl">
        <caption>Стоимость перевозки {{ cargoT }} т до объекта в {{ distKm }} км за МКАД по машинам парка МАНИП-МО. Ставки и борт — fleet.ts, сверено 30.09.2026.</caption>
        <thead>
          <tr><th scope="col">Машина</th><th scope="col">Борт, т</th><th scope="col">Рейсов</th><th scope="col">Все в одну смену, ₽</th><th scope="col">Смена на каждый рейс, ₽</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in calc" :key="c.name">
            <th scope="row">{{ c.name }} ({{ c.cls }})</th><td>{{ c.cap }}</td><td>{{ c.k }}</td><td>{{ fmt(c.b) }}</td><td>{{ fmt(c.w) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>Итог таблицы: один рейс Palfinger PK 23500A стоит {{ fmt(calc[2]!.w) }} ₽, а лёгкие машины дороже в худшем случае (ИНМАН ИТ-80 — {{ fmt(calc[0]!.w) }} ₽, Soosan SCS334 — {{ fmt(calc[1]!.w) }} ₽) и могут быть дешевле в лучшем ({{ fmt(calc[0]!.b) }} ₽ у ИТ-80). Разброс между лучшим и худшим случаем у МАНИП-МО определяет одно: успевает ли лёгкая машина сделать все рейсы за 8 часов.</p>

    <h2 id="smena" style="margin:36px 0 18px">Когда несколько рейсов укладываются в одну смену</h2>
    <p>Несколько рейсов укладываются в одну смену из 8 часов, когда склад близко, а время цикла — погрузка, дорога, разгрузка, возврат — короткое. МАНИП-МО не называет «нормативное» время цикла: оно зависит от расстояния, очереди на погрузке и подъезда на объекте. Поэтому для лёгких машин честны обе цифры таблицы, а реальный итог лежит между ними.</p>
    <p>Чем больше рейсов и чем дальше объект, тем ближе итог к худшему случаю: каждый лишний рейс добавляет время цикла и пробег. Если все {{ nIt }} рейса ИНМАН ИТ-80 не помещаются в 8 часов, выигрывает тяжёлая машина; если помещаются, выигрывает лёгкая. МАНИП-МО называет в заявке оба варианта и уточняет расстояние до склада.</p>

    <h2 id="vylet" style="margin:36px 0 18px">Почему тяжёлая машина не всегда достаёт</h2>
    <p>Тяжёлая машина работает близко к борту: у Palfinger PK 23500A стрела берёт {{ pk.capMax }} при вылете {{ pk.reach }}, и дальше груз не подать. Если поддоны нужно поставить вглубь участка за забор или за препятствие, выигрыш в числе рейсов теряет значение: машина с коротким вылетом просто не достанет до точки.</p>
    <p>Для подачи вглубь участка в парке МАНИП-МО подходит Kanglim KS1256G-II с вылетом {{ byId.ks1256!.reach }}, но его борт в расчёт числа рейсов не входит по причине, названной выше. Выбор между «один тяжёлый рейс» и «несколько лёгких» поэтому начинается с вылета до точки разгрузки и габарита въезда, а не с цены за смену.</p>

    <h2 id="vybor" style="margin:36px 0 18px">Как выбрать машину под свой объём</h2>
    <p>Выбор сводится к четырём проверкам, и МАНИП-МО проходит их в заявке по порядку: вес партии и борт, вылет до точки разгрузки, проезд и ширина въезда, расстояние до склада. Если точка разгрузки близко к дороге, а партия больше борта лёгких машин, один рейс тяжёлой машины проще по организации; если подача вглубь участка, выбирают машину с большим вылетом. Формулу цены — смена, пробег и пропуск — разбирает статья <a href="/blog/tsena-manipulyatora-podmoskovye/">про цену манипулятора в Подмосковье</a>.</p>
    <ul>
      <li>Партия больше борта лёгкой машины МАНИП-МО — считайте число рейсов по борту, а не по стреле.</li>
      <li>Груз близко к дороге — тяжёлая машина делает один рейс.</li>
      <li>Подача вглубь участка — сначала вылет, потом число рейсов.</li>
      <li>Короткое плечо до склада — несколько рейсов лёгкой машины могут уложиться в одну смену.</li>
    </ul>

    <AppSources :items="sources" date="30.09.2026" />
  </section>

  <section class="section wrap">
    <div class="section-head">
      <span class="eyebrow">Вопросы</span>
      <h2 id="faq">Частые вопросы про число рейсов манипулятора</h2>
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
