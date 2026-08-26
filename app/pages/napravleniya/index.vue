<script setup lang="ts">
const SITE = 'https://manip-mo.example'

const title = 'Направления по шоссе — плечо от МКАД и цена рейса'
const description = 'Новорижское, Ярославское, Симферопольское, Горьковское, Каширское, Ленинградское: километраж от МКАД, профиль грузов и цена рейса по открытому тарифу.'

const faqs = [
  { q: 'Почему направления по шоссе, а не по округам?', a: 'Потому что счёт считается по трассе. Плечо от МКАД до адреса умножается на 55 ₽ и на два — и в эту формулу входит километр по конкретному шоссе, а не название административного округа. Заказчик манипулятора и сам думает так же: «55 км по Новориге», а не «Истринский округ».' },
  { q: 'Груз едет из области в Москву — это то же направление?', a: 'Маршрут тот же, условия другие. К заявке добавляется зона пропуска, которая определяется конечным адресом в городе: МКАД, ТТК или Садовое кольцо. Пропуск бесплатный, но привязан к государственному номеру машины, поэтому подменить технику утром рейса нельзя.' },
  { q: 'Есть ли в Московской области весеннее ограничение движения?', a: 'В сводном графике весеннего закрытия дорог на 2026 год Московская область идёт с пометкой «не планируется» — сезонного закрытия здесь нет. Ограничение приходит не от календаря, а от последних трёхсот метров: грунтовый проезд внутри садового товарищества — это земельные участки общего назначения самого СНТ, и содержит их товарищество, а не областная дорожная служба.' },
]

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
useHead({
  link: [{ rel: 'canonical', href: `${SITE}/napravleniya/` }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Направления', item: `${SITE}/napravleniya/` },
      ],
    })},
    { type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })},
  ],
})

const sources = [
  { label: 'Сводная таблица расстояний от МКАД до городов Московской области с указанием шоссе', href: 'https://logistic-avto.ru/articles/rasstoyanie-ot-moskvy-do-gorodov-moskovskoy-oblasti/' },
  { label: 'Сводный график весеннего закрытия дорог 2026 — Московская область «не планируется»', href: 'https://roolz.net/ru/info/spring-road-closure/' },
  { label: 'Федеральный закон от 29.07.2017 № 217-ФЗ, п. 6 ст. 3 — земельные участки общего назначения СНТ', href: 'https://www.consultant.ru/document/cons_doc_LAW_221173/' },
  { label: 'Постановление Правительства РФ от 21.12.2020 № 2200 — Правила перевозок грузов автомобильным транспортом', href: 'https://www.consultant.ru/document/cons_doc_LAW_371981/' },
]
</script>

<template>
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><span>Направления</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <h1>Шесть шоссе от МКАД: плечо, груз и цена рейса</h1>
      <p>Шесть шоссе от МКАД и двадцать опорных точек на них: ближайшая — Мытищи в 1 км, дальняя — Кашира в 100 км. Доплата за плечо считается открыто, как км × 55 ₽ × 2, то есть от 110 до 11 000 ₽ за рейс, и на дальнем конце дорога стоит дороже смены лёгкого класса в 7 500 ₽.</p>
      <p>Мы не делим область по округам. Счёт считается по трассе, техника подбирается по тому, что на этой трассе обычно возят, а асфальт кончается в разных местах на разных направлениях.</p>
    </div>

    <div class="dirs">
      <article v-for="d in DIRECTIONS" :key="d.slug" class="dirs__item card">
        <h2>
          <NuxtLink :to="`/napravleniya/${d.slug}/`">{{ d.name }} шоссе</NuxtLink>
        </h2>
        <span class="dirs__road">{{ d.road }}</span>
        <p class="dirs__profile">{{ d.cargoProfile }}</p>
        <!-- Волна приёмки (26.08.2026): контейнер с прокруткой. Таблица узкая, но
             в первой колонке стоят названия вроде «Орехово-Зуево» и «Сергиев Посад»,
             и на 375px внутри карточки с паддингами длинное неразрывное значение
             вытолкнет таблицу за край. Волна 57 уже чинила это на страницах
             направлений, но хаб с шестью такими же таблицами тогда пропустили.
             tabindex + role/aria-label — чтобы прокручиваемая область была
             достижима и с клавиатуры, а не только пальцем. -->
        <div class="dirs__tablewrap" tabindex="0" role="group" :aria-label="`Плечо от МКАД: ${d.name} шоссе`">
        <table class="dirs__table">
          <caption>Плечо от МКАД и доплата за него (км × 55 ₽ × 2), ₽</caption>
          <thead>
            <tr><th scope="col">Точка</th><th scope="col">Плечо</th><th scope="col">Доплата за плечо</th></tr>
          </thead>
          <tbody>
            <tr v-for="t in d.towns" :key="t.name">
              <th scope="row">{{ t.name }}</th>
              <td>{{ t.km }} км</td>
              <td>{{ kmSurcharge(t.km).toLocaleString('ru-RU') }} ₽</td>
            </tr>
          </tbody>
        </table>
        </div>
        <p class="dirs__edge"><b>Где кончается предсказуемость.</b> {{ d.edge }}</p>
        <NuxtLink class="dirs__more" :to="`/napravleniya/${d.slug}/`">Разбор направления →</NuxtLink>
      </article>
    </div>
  </section>

  <section class="section wrap prose" style="padding-top:0">
    <h2 style="margin-bottom:14px">Обратный рейс: из области в Москву</h2>
    <p>Направление работает в обе стороны, но условия несимметричны. Выезд из области — обычный рейс. Въезд в город — рейс с допуском, и зона допуска определяется конечным адресом: МКАД, Третье транспортное кольцо, Садовое кольцо. С 06:00 до 22:00 въезд на МКАД без пропуска запрещён грузовикам полной массой свыше 12 тонн, на ТТК — грузовикам грузоподъёмностью свыше 1 тонны.</p>
    <p>Порог 12 тонн делит парк ровно пополам. Двухосные машины (Soosan SCS334 на Hyundai HD78 — 7,5 т, ИНМАН ИТ-80 на ГАЗ-3309 — 8,18 т) едут в город без пропуска. Трёхосные КАМАЗы (24,0 и 24,8 т) — только с пропуском. Это значит, что выбор класса под московский адрес — не про деньги, а про срок: пропуск бесплатный, но он оформляется и привязывается к государственному номеру конкретной машины.</p>
    <p>Отдельно и жёстче работает экологический класс: машине ниже Евро-2 въезд на МКАД запрещён, ниже Евро-3 — на ТТК, и пропуск это ограничение не снимает. Полный разбор трёх зон, порядка оформления и штрафов — в <NuxtLink to="/blog/propusk-mkad-ttk-gruzovik/">статье про грузовой пропуск</NuxtLink>.</p>

    <h2 style="margin:34px 0 14px">Что ограничивает движение в области на самом деле</h2>
    <p>Ожидание такое: весной область закрывают на просушку. Факт другой — в сводном графике весеннего закрытия дорог на 2026 год Московская область идёт с пометкой «не планируется». Юридически весной область открыта.</p>
    <p>Физически встаёт не трасса, а последние триста метров. Грунтовый проезд внутри садового товарищества, как правило, вообще не относится к дорогам области: это земельные участки общего назначения самого СНТ (п. 6 ст. 3 Федерального закона от 29.07.2017 № 217-ФЗ), и содержатся они за счёт взносов товарищества. Поэтому по адресам во второй линии мы просим фото подъезда до выезда, а не после — особенно на восточном направлении, где начинается Мещёрская низменность с торфяными и песчаными грунтами.</p>
    <p>Второй фактор в ту же сторону — масса машины. Трёхосный КАМАЗ полной массой 24,8 т проходит там, где двухосная машина в 7,5 т проезжает без вопросов, далеко не всегда. Иногда правильное решение — не более грузоподъёмная техника, а два рейса лёгкой; тарифная таблица на главной открыта целиком именно для того, чтобы этот выбор считался заранее.</p>
  </section>

  <section class="section wrap" style="padding-top:0">
    <div class="section-head">
      <h2>Вопросы по направлениям</h2>
    </div>
    <div class="faq">
      <details v-for="f in faqs" :key="f.q" class="faq__item">
        <summary>{{ f.q }}</summary>
        <p>{{ f.a }}</p>
      </details>
    </div>
    <AppSources :items="sources" />
  </section>

  <section class="section wrap" style="padding-top:0">
    <a class="btn" href="/#konfigurator">Посчитать рейс на свой адрес →</a>
  </section>
</main>
</template>

<style scoped>
.dirs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
/* min-width: 0 — не перестраховка. Замер на 320px: колонка 1fr раскрывается
   в minmax(AUTO, 1fr), то есть не может стать уже min-content своего
   содержимого, а min-content задаёт таблица «километры» внутри карточки.
   Карточка требовала 304px при контейнере в 284px и давала горизонтальный
   скролл всей страницы (scrollWidth 322 при clientWidth 320). Прокрутка
   таблицы уже живёт в .dirs__tablewrap — ей и место, а не странице. */
.dirs__item { padding: clamp(20px, 2.4vw, 28px); min-width: 0; }
.dirs__item h2 { font-size: var(--fs-lg); }
.dirs__item h2 a { text-decoration: none; }
.dirs__item h2 a:hover { color: var(--accent-ink); }
.dirs__road { display: inline-block; margin-top: 8px; background: var(--accent-soft); color: var(--accent-ink); font-size: var(--fs-2xs); font-weight: 700; letter-spacing: .04em; padding: 4px 10px; border-radius: 100px; }
.dirs__profile { margin-top: 14px; color: var(--muted); font-size: var(--fs-sm); }
.dirs__tablewrap { overflow-x: auto; margin-top: 16px; }
.dirs__table { width: 100%; border-collapse: collapse; font-size: var(--fs-sm); }
.dirs__table caption { caption-side: top; text-align: left; font-size: var(--fs-2xs); color: var(--muted); padding-bottom: 8px; }
.dirs__table th, .dirs__table td { border-bottom: 1px solid var(--line); padding: 7px 8px; text-align: right; }
.dirs__table th[scope='row'], .dirs__table thead th:first-child { text-align: left; }
.dirs__table thead th { font-family: var(--sans); font-size: var(--fs-2xs); font-weight: 700; color: var(--muted); }
.dirs__edge { margin-top: 14px; font-size: var(--fs-sm); }
.dirs__more { display: inline-block; margin-top: 14px; font-weight: 700; font-size: var(--fs-sm); color: var(--accent-ink); }
@media (max-width: 860px) { .dirs { grid-template-columns: 1fr; } }
</style>
