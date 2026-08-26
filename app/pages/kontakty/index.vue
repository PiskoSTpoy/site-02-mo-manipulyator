<script setup lang="ts">
// Волна приёмки (26.08.2026). Страницы контактов на сайте не было вообще: телефон
// жил в шапке, подвале и мобильной панели, а страницы, на которую можно поставить
// ссылку и в которой лежат реквизиты, — нет.
//
// Утилитарные страницы сети обязаны расходиться по структуре, иначе девять сайтов
// читаются как одна фабрика. Здесь страница построена вокруг единственной вещи,
// которая на этом сайте действительно отличает разговор с диспетчером от разговора
// на любом другом сайте сети: заявка на манипулятор считается по связке
// «груз → класс машины → плечо от МКАД по конкретному шоссе». Поэтому центр
// страницы — не карта и не часы приёма, а перечень того, что нужно знать до звонка,
// и честный список того, чего мы не делаем.
//
// Реквизиты (наименование, ИНН, ОГРН, адрес) — данные заказчика, оставлены пустыми.
const SITE = 'https://manip-mo.example'

const title = 'Контакты — заявка на манипулятор по области'
const description = 'Телефон и форма заявки, что подготовить до звонка, что мы не делаем, зона выезда по шести шоссе и реквизиты оператора. Приём заявок круглосуточно.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
useHead({
  link: [{ rel: 'canonical', href: `${SITE}/kontakty/` }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Контакты', item: `${SITE}/kontakty/` },
    ],
  })}],
})

// Порядок — как в хабе направлений, чтобы у читателя не возникало двух разных
// «правильных» списков шоссе на одном сайте.
const dirs = DIRECTIONS

// Единственные две внешние нормы, на которые страница ссылается фактами, плюс
// внутренний источник тарифа. Собственную ставку за километр берём из того же
// KM_RATE, что и весь сайт, — отдельного источника у неё нет и быть не может.
const sources = [
  { label: 'Приказ Ростехнадзора от 26.11.2020 № 461 — ФНП по подъёмным сооружениям, п. 3: нижняя граница применения правил к кранам-манипуляторам', href: 'https://www.consultant.ru/document/cons_doc_LAW_373321/' },
  { label: 'Постановление Правительства РФ от 21.12.2020 № 2200 — Правила перевозок грузов автомобильным транспортом', href: 'https://www.consultant.ru/document/cons_doc_LAW_371981/' },
  { label: 'Ставка за километр и тарифы по классам — таблица парка на этом же сайте', href: '/park/' },
]
</script>

<template>
<main>
  <nav class="crumbs wrap" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink><span>/</span><span>Контакты</span>
  </nav>

  <section class="section wrap" style="padding-top:8px">
    <div class="section-head">
      <span class="eyebrow">Контакты</span>
      <h1 style="margin:12px 0 0">Позвонить, написать заявку, проверить реквизиты</h1>
      <p>Заявку принимает диспетчер, а не автоответчик, поэтому короткий разговор обычно
        закрывает вопрос быстрее переписки: класс машины считается из груза, а цена — из
        плеча по шоссе, и оба параметра проще назвать голосом.</p>
    </div>

    <div class="kt-grid">
      <div class="card kt-card">
        <p class="kt-card__key">Телефон</p>
        <p class="kt-card__val"><a :href="SITE_TEL_HREF">{{ SITE_PHONE }}</a></p>
        <p class="kt-card__note">Приём заявок круглосуточно, семь дней в неделю. Ночью
          отвечаем на заявки на утро — подать машину среди ночи мы не обещаем.</p>
      </div>
      <div class="card kt-card">
        <p class="kt-card__key">Заявка с сайта</p>
        <p class="kt-card__val"><NuxtLink to="/#order">Форма на главной</NuxtLink></p>
        <p class="kt-card__note">Обязательное поле одно — телефон. Заявка уходит диспетчеру
          сообщением; что происходит с данными, описано в
          <NuxtLink to="/politika-obrabotki-personalnyh-dannyh/">политике</NuxtLink>.</p>
      </div>
      <div class="card kt-card">
        <p class="kt-card__key">Посчитать до звонка</p>
        <p class="kt-card__val"><NuxtLink to="/#konfigurator">Конфигуратор</NuxtLink></p>
        <p class="kt-card__note">Груз и километр от МКАД дают класс машины и цену смены
          сразу на экране — звонок тогда начинается с подтверждения, а не с расспросов.</p>
      </div>
      <div class="card kt-card">
        <p class="kt-card__key">Зона выезда</p>
        <p class="kt-card__val">Московская область</p>
        <p class="kt-card__note">Плюс адреса в Москве, куда машина проходит по массе или
          с оформленным пропуском — <NuxtLink to="/blog/propusk-mkad-ttk-gruzovik/">разбор порога 12 тонн</NuxtLink>.</p>
      </div>
    </div>
  </section>

  <section class="section wrap" style="padding-top:0">
    <div class="section-head">
      <h2>Что подготовить до звонка</h2>
      <p>Четыре ответа, после которых диспетчер называет класс машины и цену, а не «нужно
        уточнить». Ни один из них не требует от вас разбираться в технике.</p>
    </div>
    <ol class="kt-steps">
      <li>
        <b>Что везём и сколько весит.</b> Груз решает всё остальное: у поддонов ограничитель —
        грузоподъёмность борта, у бруса и плит — его длина, у контейнера — габарит, у
        мини-техники — наличие штатных точек строповки. Разбор по типам — в разделе
        <NuxtLink to="/gruzy/">грузов</NuxtLink>.
      </li>
      <li>
        <b>Куда, с точностью до шоссе и километра.</b> Плечо считается по трассе от МКАД,
        не по прямой на карте: {{ KM_RATE }} ₽ за километр в обе стороны прибавляются к ставке
        класса. Названия населённых пунктов с километражом по каждому направлению собраны
        в <NuxtLink to="/napravleniya/">хабе шоссе</NuxtLink>.
      </li>
      <li>
        <b>Куда именно ставить груз.</b> «На участок» и «через забор на дальний угол» — это
        разные машины: во втором случае решает вылет стрелы, а не грузоподъёмность. Как
        вылет и момент тянут в разные стороны, видно в <NuxtLink to="/park/">таблице парка</NuxtLink>.
      </li>
      <li>
        <b>Есть ли пропускной режим.</b> Закрытый посёлок, логопарк с окнами разгрузки,
        промзона с постом, зона аэропорта — у каждого свой регламент, и оформляется он не
        за час. Контакт управляющей компании или диспетчера склада нужен от вас: постороннему
        подрядчику такие регламенты по телефону не выдают.
      </li>
    </ol>
  </section>

  <section class="section wrap" style="padding-top:0">
    <div class="section-head">
      <h2>Чего мы не делаем</h2>
      <p>Список короткий и написан, чтобы не тратить ваше время на звонок, который всё равно
        закончится отказом.</p>
    </div>
    <ul class="kt-no">
      <li><b>Автокраны.</b> Парк — четыре манипулятора, автокрана в нём нет ни одного.
        Если задача про подъём на высоту без перевозки, это другая машина; смежные задачи
        мы передаём <NuxtLink to="/uslugi/lyubaya-tehnika-cherez-set/">через сеть</NuxtLink>,
        честно называя, что работу выполним не мы.</li>
      <li><b>Аренда «без водителя».</b> Кран-манипуляторная установка нашего парка по
        грузовому моменту выше порога пункта 3 ФНП (приказ Ростехнадзора от 26.11.2020
        № 461) и работает только с аттестованным оператором. Технику заказчику мы не
        передаём — приезжает машина с оператором и делает работу.</li>
      <li><b>Регионы за пределами области.</b> Плечо, на котором смена превращается в
        двухдневный рейс, мы не берём: считать его по той же тарифной сетке было бы
        нечестно, а отдельной междугородной сетки у нас нет.</li>
    </ul>
  </section>

  <section class="section wrap" style="padding-top:0">
    <div class="section-head">
      <h2>Куда выезжаем</h2>
      <p>Шесть направлений, разобранных на сайте по шоссе, а не по административным округам —
        километр по трассе попадает в счёт, название района нет.</p>
    </div>
    <ul class="kt-dirs">
      <li v-for="d in dirs" :key="d.slug">
        <NuxtLink :to="`/napravleniya/${d.slug}/`">{{ d.name }} шоссе</NuxtLink>
        <span>{{ d.road }}</span>
      </li>
    </ul>
  </section>

  <section class="section wrap" style="padding-top:0">
    <div class="section-head">
      <h2>Реквизиты оператора</h2>
      <p>Заполняются при запуске сайта на боевом домене. Пустые строки здесь оставлены
        намеренно: правдоподобный выдуманный ИНН на странице контактов — худший вариант из
        возможных, потому что его нельзя отличить от настоящего.</p>
    </div>
    <div class="tablewrap card" tabindex="0" role="group" aria-label="Реквизиты оператора">
      <table class="kt-table">
        <tbody>
          <tr><th scope="row">Наименование</th><td>—<span class="kt-ph">заполняется при запуске</span></td></tr>
          <tr><th scope="row">ИНН</th><td>—<span class="kt-ph">заполняется при регистрации юридического лица</span></td></tr>
          <tr><th scope="row">ОГРН / ОГРНИП</th><td>—<span class="kt-ph">заполняется при регистрации юридического лица</span></td></tr>
          <tr><th scope="row">Юридический адрес</th><td>—<span class="kt-ph">заполняется при запуске</span></td></tr>
          <tr><th scope="row">Телефон</th><td><a :href="SITE_TEL_HREF">{{ SITE_PHONE }}</a></td></tr>
          <tr><th scope="row">Приём заявок</th><td>круглосуточно, ежедневно</td></tr>
          <tr><th scope="row">Обработка персональных данных</th>
            <td><NuxtLink to="/politika-obrabotki-personalnyh-dannyh/">политика</NuxtLink> ·
              <NuxtLink to="/soglasie-na-obrabotku-personalnyh-dannyh/">согласие</NuxtLink></td></tr>
        </tbody>
      </table>
    </div>

    <AppSources :items="sources" date="26.08.2026" />
  </section>
</main>
</template>

<style scoped>
.kt-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.kt-card { padding: 22px; }
.kt-card__key { font-size: var(--fs-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--accent-ink); }
.kt-card__val { margin-top: 8px; font-family: var(--display); font-weight: 700; font-size: var(--fs-lg); letter-spacing: -.01em; }
.kt-card__val a { color: var(--accent-ink); text-decoration: none; }
.kt-card__val a:hover { text-decoration: underline; }
.kt-card__note { margin-top: 10px; font-size: var(--fs-sm); color: var(--muted); }
.kt-card__note a { color: var(--accent-ink); }

.kt-steps { margin: 0; padding-left: 22px; display: grid; gap: 14px; max-width: 78ch; }
.kt-steps li { line-height: 1.6; }
.kt-steps a, .kt-no a { color: var(--accent-ink); }

.kt-no { margin: 0; padding-left: 22px; display: grid; gap: 14px; max-width: 78ch; }

.kt-dirs { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.kt-dirs li { border: 1px solid var(--line); border-radius: 14px; background: var(--card); padding: 14px 16px; display: grid; gap: 4px; }
.kt-dirs a { color: var(--accent-ink); font-weight: 700; text-decoration: none; }
.kt-dirs a:hover { text-decoration: underline; }
.kt-dirs span { font-size: var(--fs-xs); color: var(--muted); }

.tablewrap { overflow-x: auto; padding: 4px 6px; }
.kt-table { border-collapse: collapse; width: 100%; font-size: var(--fs-md); }
.kt-table th, .kt-table td { text-align: left; vertical-align: top; padding: 12px 14px; border-bottom: 1px solid var(--line); }
.kt-table tr:last-child th, .kt-table tr:last-child td { border-bottom: none; }
.kt-table th { font-family: var(--sans); font-weight: 600; color: var(--muted); white-space: nowrap; }
.kt-table a { color: var(--accent-ink); }
.kt-ph { display: block; margin-top: 3px; font-size: var(--fs-xs); color: var(--muted); }

@media (max-width: 900px) { .kt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .kt-dirs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .kt-grid { grid-template-columns: 1fr; } .kt-dirs { grid-template-columns: 1fr; } }
</style>
