<script setup lang="ts">
// Волна 16. Главная перевёрнута: сайт перестал быть лендингом с текстовым hero
// и стал инструментом. Первый экран — грузовой конфигуратор с открытой тарифной
// таблицей; hero, stat-bar, trust-bar, бегущая строка, иллюстрация и блок шагов
// «01–04» удалены целиком, а не спрятаны ниже. Ось сайта — груз (/gruzy/),
// география — шоссе (/napravleniya/), парк — одна сравнительная таблица.
import { ref } from 'vue'

const title = 'Манипулятор в Московской области — подбор по грузу'
const description = 'Грузовой конфигуратор: выбираете груз и точку на шоссе — получаете класс машины, борт, вылет и цену. Открытая таблица «плечо от МКАД × класс».'

const faqs = [
  {
    q: 'Почему первым делом спрашивают груз, а не тоннаж машины?',
    a: 'Потому что тоннаж — это вывод, а не вход. У каждого груза свой ограничитель: у поддонов это грузоподъёмность борта (сам поддон по ГОСТ 33757-2016 несёт максимум 1,25–1,35 т), у бруса и плит — длина борта, у контейнера — габарит, у мини-техники — наличие штатных точек строповки. Заказчик знает, что он везёт; какой класс это требует, считает конфигуратор.',
  },
  {
    q: 'Почему у самой мощной машины в таблице самый короткий вылет?',
    a: 'Это не ошибка таблицы, а физика КМУ. Palfinger PK 23500A имеет грузовой момент 22,4 т·м при максимальном вылете 8,0 м, а Kanglim KS1256G-II — 15 т·м при вылете 18,7 м. Момент — это произведение массы на вылет: чтобы достать дальше, стрелу удлиняют секциями, и на конце остаётся всё меньше. У того же PK 23500 в исполнении E вылет 16,5 м, но момент падает до 20,7 т·м, а грузоподъёмность на конце — до 960 кг.',
  },
  {
    q: 'Что означает подсветка строки в тарифной таблице?',
    a: 'Строка — плечо от МКАД в одну сторону, ближайшее к введённому вами километражу; колонка — класс, который конфигуратор подобрал под ваш груз. На пересечении стоит полная цена смены: ставка класса плюс километраж в обе стороны по 55 ₽/км. Никакой второй цены «по факту» нет — то, что в клетке, и есть счёт.',
  },
  {
    q: 'Нужен ли пропуск, если груз едет из области в Москву?',
    a: 'Зависит от полной массы конкретной машины, а не от класса «на словах». Двухосный манипулятор Soosan SCS334 на Hyundai HD78 имеет полную массу 7,5 т — порог 12 т для въезда на МКАД с 06:00 до 22:00 он не преодолевает, пропуск не нужен. Трёхосный КАМАЗ-65115 с Kanglim — 24,8 т, пропуск обязателен. Он бесплатный, оформляем сами, но привязан к конкретной машине: подменить технику утром рейса нельзя.',
  },
  {
    q: 'Сколько поддонов реально влезает на борт?',
    a: 'Считается не по площади, а по массе. На борт Soosan SCS334 (4,505 м, грузоподъёмность 2,5 т) по площади становится шесть поддонов 1200×800, но шесть поддонов кирпича — это около 7,5 т, то есть втрое больше допустимого. Реально едут два. На КАМАЗ-65117 с бортом 6,648 м и грузоподъёмностью 11,2 т — восемь, и снова упирается в массу, а не в место.',
  },
]

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: 'website', twitterCard: 'summary_large_image' })
useHead({
  link: [{ rel: 'canonical', href: 'https://manip-mo.example/' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }),
    },
    // Волна приёмки (26.08.2026). Узел WebSite переехал сюда из макета: он
    // описывает сайт целиком, а не страницу, и объявляется ровно один раз.
    // SearchAction сознательно не добавлен — Google отключил sitelinks searchbox
    // в ноябре 2024 года, и разметка под неё сегодня просто мусор в графе.
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://manip-mo.example/#website',
        name: SITE_BRAND,
        url: 'https://manip-mo.example',
        inLanguage: 'ru-RU',
        publisher: { '@id': 'https://manip-mo.example/#organization' },
      }),
    },
  ],
})

// Волна 35. Форма шлёт реальный POST на общий Cloudflare Worker lead-relay
// (LEAD_ENDPOINT из utils/contacts.ts). Волна 57: worker уже задеплоен, эндпоинт
// рабочий — эта форма не проверялась живым POST (запрет задания, инцидент Волны 52),
// но payload и обработка ответа соответствуют контракту lead-relay/worker.js.
// Живая область role="status" остаётся — на случай сетевой ошибки честно
// сообщает и даёт рабочий телефон, а не молчит и не показывает alert().
const orderName = ref('')
const orderPhone = ref('')
const orderCargo = ref('')
const orderWebsite = ref('') // honeypot: у людей всегда пусто, боты обычно заполняют все поля
// Волна приёмки (26.08.2026). Согласие на обработку ПД — отдельное обязательное
// поле формы. Начальное значение false и никакого «удобного» предзаполнения:
// заранее отмеченная галочка юридически не является согласием (ст. 9 ч. 1 152-ФЗ),
// а значит и защиты не даёт. required на самом input не даёт отправить форму
// нативно; отдельная проверка в обработчике нужна на случай, если разметку
// обойдут программно.
const orderConsent = ref(false)

type OrderStatus = 'idle' | 'sending' | 'success' | 'error'
const orderStatus = ref<OrderStatus>('idle')

async function onOrderSubmit() {
  // Волна приёмки: ловушка теперь именно ловушка. Раньше заполненное скрытое поле
  // просто уезжало на сервер вместе с заявкой и решение принимал воркер. Теперь
  // обработчик молча делает вид, что всё прошло: бот получает тот же экран
  // «отправлено», что и человек, и не подбирает другой способ. Ни запроса, ни
  // сообщения об ошибке — иначе ловушка сама себя выдаёт.
  if (orderWebsite.value.trim() !== '') {
    orderStatus.value = 'success'
    return
  }
  if (!orderConsent.value) {
    orderStatus.value = 'idle'
    return
  }
  orderStatus.value = 'sending'
  try {
    // ЗАЩИТА ОТ ОТПРАВКИ ТЕСТОВЫХ ЗАЯВОК В БОЕВОЙ ПРИЁМНИК.
    // Приёмник заявок развёрнут на Cloudflare Worker, и он пересылает заявку
    // живому человеку в мессенджер. Любая проверка формы с локального
    // dev-сервера доходила до него как настоящий лид: так уже случилось трижды.
    // Ниже запрос физически не уходит, если страница открыта не на боевом домене.
    // Вся остальная логика (статусы, разблокировка кнопки, разбор ответа)
    // работает как обычно — форму можно проверять, не мусоря в чате.
    const leadRelayFetch = (url: string, init?: RequestInit): Promise<Response> => {
      const h = typeof location !== 'undefined' ? location.hostname : '';
      const isLocal =
        /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(h) ||
        h.endsWith('.local') ||
        (typeof location !== 'undefined' && location.protocol === 'file:');
      if (isLocal) {
        return Promise.resolve(
          new Response(JSON.stringify({ ok: true, dryRun: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return fetch(url, init);
    };
    const res = await leadRelayFetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: 'manipmo',
        name: orderName.value,
        phone: orderPhone.value,
        comment: orderCargo.value,
        page: location.pathname,
        website: orderWebsite.value,
      }),
    })
    orderStatus.value = res.ok ? 'success' : 'error'
  } catch {
    orderStatus.value = 'error'
  }
}

// Волна визуальной приёмки (26.08.2026). Две машины для мотив-плитки первого
// экрана. НИЧЕГО НОВОГО НЕ ВЫДУМАНО: обе строки читаются из FLEET, и ровно эти
// же две цифры уже стоят словами во втором вопросе FAQ ниже на этой же странице
// («Palfinger PK 23500A имеет грузовой момент 22,4 т·м при максимальном вылете
// 8,0 м, а Kanglim KS1256G-II — 15 т·м при вылете 18,7 м»). Плитка показывает
// тот же факт геометрией, а не добавляет новый. Выбор — максимумом по полю, а не
// вписанным id: добавят пятую машину — плитка пересчитается сама.
const heaviest = [...FLEET].sort((a, b) => b.momentTm - a.momentTm)[0]!
const farthest = [...FLEET].sort((a, b) => b.reachM - a.reachM)[0]!

// Волна мобильной приёмки (26.08.2026). Границы ставки за смену — для цены на
// первом экране. Считаются из SHIFT_RATE, а не вписаны числами: добавят пятый
// класс — первый экран пересчитается сам и не разойдётся с тарифной таблицей.
const rates = Object.values(SHIFT_RATE)
const rateMin = Math.min(...rates)
const rateMax = Math.max(...rates)

const sources = [
  { label: 'Постановление Правительства РФ от 21.12.2020 № 2200 — Правила перевозок грузов, приложения № 1–3 (габариты, допустимая масса, осевые нагрузки)', href: 'https://www.consultant.ru/document/cons_doc_LAW_371981/' },
  { label: 'ГОСТ 33757-2016 «Поддоны плоские деревянные» — номинальные нагрузки 1000/1250/1350 кг', href: 'https://docs.cntd.ru/document/1200140410' },
  { label: 'ПДД РФ, раздел 23 «Перевозка грузов» — обозначение груза, выступающего более чем на 1 м', href: 'https://www.consultant.ru/document/cons_doc_LAW_2709/9f6f60efaee3994438e38b50a90595abfaaaf5a2/' },
  { label: 'Приказ Ростехнадзора от 26.11.2020 № 461 — ФНП по подъёмным сооружениям (п. 112, порог 30 м до ВЛ свыше 50 В)', href: 'https://www.consultant.ru/document/cons_doc_LAW_373321/' },
  { label: 'Паспортные характеристики машин парка — ссылки по каждой строке в таблице раздела «Парк»', href: '/park/' },
]
</script>

<template>
<main>
  <!-- Волна 123: фоновое видео hero. Приём отраслевой (video autoplay/muted/loop/
       playsinline/preload=none/poster/aria-hidden/tabindex=-1 позади текста +
       затемняющий scrim), но в СВОЕЙ композиции: bento-панель с закруглением 20px
       и мягкой тенью — тот же язык, что у .card/.cfg по всему сайту, а не рамка
       с жёстким бордером. До этой волны на главной вообще
       не было отдельного hero: Волна 16 убрала текстовый hero целиком, первым
       экраном шёл сразу конфигуратор (см. комментарий в <script> выше). Здесь
       не тронут ни один пиксель конфигуратора — видео-панель встала НАД ним,
       как отдельная секция, с собственным H1 конфигуратор не спорит: у панели
       нет <h1>, это teaser, настоящий заголовок страницы — внутри AppCargoConfigurator. -->
  <!-- Волна визуальной приёмки (26.08.2026). Первый экран стал ДВУХПЛИТОЧНЫМ
       bento, а не одним прямоугольником с текстом. Причина ровно та, что записана
       в design-code.md: язык сайта — «скруглённые плитки разного размера в
       bento-раскладке», и до этой волны он не звучал именно там, где решается,
       на какой сайт человек попал. Вторая плитка несёт СОБСТВЕННЫЙ графический
       мотив сайта — геометрию «момент × вылет», которая до этого жила одной
       схемой в середине страницы и на первый экран не попадала вовсе. -->
  <div class="wrap">
    <div class="hero-bento">
    <div class="videohero">
      <div class="videohero__media" aria-hidden="true">
        <video class="videohero__video" autoplay muted loop playsinline preload="none" poster="/images/hero/hero-timber-poster.jpg" aria-hidden="true" tabindex="-1">
          <source src="/videos/hero-timber.mp4" type="video/mp4" />
        </video>
        <div class="videohero__scrim"></div>
      </div>
      <div class="videohero__body">
        <span class="videohero__eyebrow">Манипулятор в Московской области</span>
        <p class="videohero__lead">КМУ поднимает груз на борт быстрее, чем вы найдёте направление на карте.</p>
        <!-- Волна мобильной приёмки (26.08.2026). Цена вынесена на первый экран.
             Замерено до правки: первая цифра в рублях стояла на 2064-й точке
             (375px) — третий экран телефона, то есть ровно то, ради чего человек
             пришёл, было за двумя прокрутками. Здесь НЕ появилось ни одного
             нового числа: границы диапазона считаются из SHIFT_RATE, километр —
             из KM_RATE, и обе цифры уже стоят словами ниже на этой же странице
             в разделе «Из чего складывается цифра в таблице». Диапазон, а не
             «от 7 500 ₽»: одиночное «от» без километража — ровно тот приём,
             за который этот сайт ругает конкурентов. -->
        <p class="videohero__price">
          <b class="videohero__price-num">{{ rateMin.toLocaleString('ru-RU') }}–{{ rateMax.toLocaleString('ru-RU') }} ₽</b>
          <span class="videohero__price-cap">смена 8 часов по классу машины + {{ KM_RATE }} ₽ за км от МКАД в обе стороны</span>
        </p>
        <a class="videohero__cta" href="#konfigurator">К конфигуратору ↓</a>
      </div>
    </div>

      <!-- Мотив-плитка «момент против вылета». Схема нарисована теми же
           средствами, что и остальная графика сайта (line-art, обводка 1,7–2,5,
           скруглённые концы — см. AppCargoIcon и AppTorqueDiagram), поэтому
           читается как часть одного набора, а не как вставленная картинка. -->
      <aside class="reachtile" aria-label="Грузовой момент против вылета стрелы">
        <svg class="reachtile__svg" viewBox="0 0 220 120" fill="none" aria-hidden="true" focusable="false">
          <!-- короткая тяжёлая стрела -->
          <path d="M20 96 L74 46" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" />
          <rect x="10" y="92" width="22" height="16" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2" />
          <circle cx="74" cy="46" r="5.5" fill="var(--card)" stroke="var(--accent-ink)" stroke-width="2.5" />
          <rect x="64" y="60" width="20" height="16" rx="3" fill="var(--card)" stroke="var(--accent-ink)" stroke-width="2.5" />
          <path d="M74 51.5 V60" stroke="var(--accent-ink)" stroke-width="2.5" />
          <!-- длинная лёгкая стрела -->
          <path d="M20 96 L186 34" stroke="var(--accent-ink)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8" />
          <circle cx="186" cy="34" r="4" fill="var(--card)" stroke="var(--accent-ink)" stroke-width="2.2" />
          <rect x="179" y="46" width="14" height="11" rx="2.5" fill="var(--card)" stroke="var(--accent-ink)" stroke-width="2.2" />
          <path d="M186 38 V46" stroke="var(--accent-ink)" stroke-width="2.2" />
          <path d="M20 112 H186" stroke="var(--accent-line)" stroke-width="2" stroke-linecap="round" />
        </svg>
        <dl class="reachtile__rows">
          <div class="reachtile__row">
            <dt>{{ heaviest.momentTm.toLocaleString('ru-RU') }} т·м</dt>
            <dd>{{ heaviest.kmu }} — вылет {{ heaviest.reach }}</dd>
          </div>
          <div class="reachtile__row">
            <dt>{{ farthest.momentTm.toLocaleString('ru-RU') }} т·м</dt>
            <dd>{{ farthest.kmu }} — вылет {{ farthest.reach }}</dd>
          </div>
        </dl>
      </aside>
    </div>
    <!-- prefers-reduced-motion закрыт одним CSS-правилом ниже (.videohero__video{display:none}) —
         постер уже лежит в background-image .videohero__media, скрывать видео и есть весь фоллбэк. -->
    <!-- Вторая половина прежнего лида. Она не удалена, а переехала сюда: на
         первом экране абзац занимал 8 строк из 8 и накрывал кадр целиком, а по
         смыслу это подводка ровно к тому конфигуратору, который стоит следом. -->
    <p class="hero-tail">Конфигуратор ниже подбирает машину и открытую цену за секунды, без звонка «уточнить у менеджера».</p>
    <p class="videohero__credit">Фоновое видео — атмосферная иллюстрация «манипулятор грузит лес», не наш объект и не наша техника. Автор: Valmir Zanellato, <a href="https://www.pexels.com/license/" target="_blank" rel="noopener">Pexels License</a>, <a href="https://www.pexels.com/video/crane-loading-timber-onto-flatbed-truck-in-yard-32027520/" target="_blank" rel="noopener">Pexels</a>.</p>
  </div>

  <div class="wrap">
    <AppCargoConfigurator />
  </div>

  <!-- Честная плашка метрик. Не про масштаб бизнеса (его на сайте демонстративно
       нет, см. секцию #honesty ниже) — про то, что реально разобрано в этих
       материалах. Все три числа читаются из тех же массивов, что и остальной
       сайт (CARGO/DIRECTIONS/TARIFF_BANDS_KM), а не подписаны вручную: если
       кто-то добавит седьмой груз или пятое направление, плашка не разъедется
       молча с реальным содержанием, как уже случалось с характеристиками парка. -->
  <div class="wrap">
    <div class="honest-bar">
      <p class="honest-bar__lead">Не про масштаб компании — про то, что реально разобрано на этом сайте:</p>
      <dl class="honest-bar__grid">
        <div class="honest-bar__item">
          <dt class="honest-bar__label">типов груза разобрано по ограничителям</dt>
          <dd class="honest-bar__num">{{ CARGO.length }}</dd>
        </div>
        <div class="honest-bar__item">
          <dt class="honest-bar__label">направления по шоссе, не по районам</dt>
          <dd class="honest-bar__num">{{ DIRECTIONS.length }}</dd>
        </div>
        <div class="honest-bar__item">
          <dt class="honest-bar__label">плеч в открытой тарифной таблице</dt>
          <dd class="honest-bar__num">{{ TARIFF_BANDS_KM.length }}</dd>
        </div>
        <div class="honest-bar__item">
          <dt class="honest-bar__label">дата сверки тарифов и паспортов техники</dt>
          <dd class="honest-bar__num honest-bar__num--date">12.08.2026</dd>
        </div>
      </dl>
    </div>
  </div>

  <section class="section wrap" id="gruzy">
    <div class="section-head">
      <h2>Шесть грузов, по которым чаще всего вызывают манипулятор</h2>
      <p>Разделы построены не по услугам, а по тому, что лежит в кузове: у каждого груза свой ограничитель, и он почти никогда не совпадает с тем, что называют в заявке.</p>
    </div>
    <div class="cargo-grid">
      <NuxtLink v-for="c in CARGO" :key="c.slug" class="cargo-card card" :to="`/gruzy/${c.slug}/`">
        <span class="cargo-card__icon" aria-hidden="true"><AppCargoIcon :slug="c.slug" /></span>
        <h3>{{ c.name }}</h3>
        <p class="cargo-card__tag">{{ c.tagline }}</p>
        <dl class="cargo-card__facts">
          <div><dt>Масса подъёма</dt><dd>{{ c.unitMass }}</dd></div>
          <div><dt>Габарит</dt><dd>{{ c.unitSize }}</dd></div>
          <div><dt>Отсекает</dt><dd>{{ c.limiter }}</dd></div>
        </dl>
      </NuxtLink>
    </div>
  </section>

  <section class="section wrap" id="tarif">
    <div class="section-head">
      <h2>Из чего складывается цифра в таблице</h2>
    </div>
    <div class="tarif-grid">
      <div class="prose">
        <p>Смена — восемь часов. Ставка смены зависит только от класса машины: 7 500 ₽ для лёгкого класса, 9 500 ₽ для среднего, 13 500 ₽ для тяжёлого, 18 000 ₽ для сверхтяжёлого. Второе слагаемое — плечо: километр от МКАД до адреса, умноженный на 55 ₽ и на два, потому что машина едет туда и обратно, а не остаётся у вас на участке.</p>
        <p>Такой расчёт даёт неожиданный результат на дальних адресах: рейс лёгкой машиной в Орехово-Зуево (78 км по Горьковскому шоссе) стоит 7 500 + 8 580 = 16 080 ₽, то есть плечо дороже самой смены. Именно поэтому на дальнем плече выгоднее один рейс машиной побольше, чем два рейса машиной поменьше — и это видно прямо в таблице, а не выясняется после второго выезда.</p>
        <p>Обратная ситуация в ближнем поясе. Мытищи — 1 км от МКАД, плечо 110 ₽: цена рейса практически равна ставке класса, и весь разговор сводится к тому, какая машина нужна, а не сколько до вас ехать.</p>
      </div>
      <AppTorqueDiagram />
    </div>
  </section>

  <section class="section wrap" id="ne-vhodit">
    <div class="section-head">
      <h2>Что в смену не входит</h2>
    </div>
    <!-- Волна визуальной приёмки: пять секций подряд шли голой прозой на одном
         фоне с одинаковым отступом, и середина страницы читалась одной бесконечной
         полосой текста. Раздел с правилами тарификации — единственный, где список
         действительно является предметом, поэтому он и получает плитку; соседние
         разделы остаются открытым текстом, иначе панелью станет вся страница
         и приём перестанет работать. -->
    <div class="panel prose">
      <ul>
        <li><b>Ручная переноска за пределами вылета стрелы.</b> Манипулятор кладёт груз там, куда достаёт стрела. Занос в дом, разбор поддона по кирпичу, перекладка внутри участка — работа вашей бригады.</li>
        <li><b>Простой по вине заказчика.</b> Площадка не готова, не приехал получатель, не открыли ворота — тарифицируется по факту. «На всякий случай» в базовую цену это не заложено.</li>
        <li><b>Второй адрес погрузки.</b> Забрать груз в двух местах за рейс технически можно, но это плюс время смены; считаем заранее, чтобы цифра в таблице не разошлась со счётом.</li>
        <li><b>Работа в выходные и праздники.</b> Отдельная ставка, называем до подтверждения даты.</li>
        <li><b>Наряд-допуск при работе ближе 30 м от воздушной линии.</b> Оформляется с сетевой организацией и занимает время: это не наценка, это срок.</li>
      </ul>
      <p>Пропуска на МКАД, ТТК и Садовое кольцо в этом списке нет намеренно: они бесплатные, и включать их в счёт отдельной строкой не за что.</p>
    </div>
  </section>

  <section class="section wrap" id="park">
    <div class="section-head">
      <h2>Четыре машины рядом: борт против вылета</h2>
      <p>Одна таблица вместо четырёх страниц с описаниями. Сравнение показывает то, чего не видно в отдельной карточке: момент и вылет тянут в разные стороны.</p>
    </div>
    <div class="park-panel">
      <AppFleetTable compact />
    </div>
    <NuxtLink class="btn" to="/park/" style="margin-top:22px">Полная таблица: грузоподъёмность на вылете и источники →</NuxtLink>
  </section>

  <!-- Волна 30: честное расширение охвата — манипулятор
       остаётся собственным парком, всё, что шире, идёт через партнёрскую сеть.
       Баннер, а не ещё один пункт в cargo-grid: это другая ось (вид техники,
       не груз), и смешивать её с картой грузов значило бы стереть разницу
       «наш парк vs партнёр», которую вся страница-назначение объясняет. -->
  <section class="section wrap" id="set" style="padding-top:0">
    <NuxtLink to="/uslugi/lyubaya-tehnika-cherez-set/" class="network-banner card">
      <span class="network-banner__badge">Партнёрская сеть</span>
      <h2 class="network-banner__title">Нужен автокран, башенный, гусеничный кран или автовышка?</h2>
      <p class="network-banner__text">Манипулятор — это наш собственный парк. Технику шире мы не выдаём за свою: подбираем и подаём её через проверенную партнёрскую сеть, а расчёт собираем под задачу, а не берём из прайса.</p>
      <span class="network-banner__cta">Как мы подбираем через сеть →</span>
    </NuxtLink>
  </section>

  <section class="section wrap" id="napravleniya">
    <div class="section-head">
      <h2>Шесть шоссе, а не шесть районов</h2>
      <p>Плечо считается по трассе, поэтому и направления разобраны по шоссе. Внутри каждого — свой профиль грузов и своя точка, где заканчивается предсказуемый асфальт.</p>
    </div>
    <div class="dir-grid">
      <NuxtLink v-for="d in DIRECTIONS" :key="d.slug" class="dir-card card" :to="`/napravleniya/${d.slug}/`">
        <h3>{{ d.name }} шоссе</h3>
        <span class="dir-card__road">{{ d.road }}</span>
        <p>{{ d.cargoProfile }}</p>
        <span class="dir-card__km">{{ d.towns[0]!.name }} {{ d.towns[0]!.km }} км · {{ d.towns[d.towns.length - 1]!.name }} {{ d.towns[d.towns.length - 1]!.km }} км</span>
      </NuxtLink>
    </div>
  </section>

  <section class="section wrap" id="moskva">
    <div class="section-head">
      <h2>Московский адрес — отдельный слой поверх заявки</h2>
    </div>
    <div class="prose">
      <p>С 06:00 до 22:00 въезд на МКАД без пропуска запрещён грузовикам полной массой свыше 12 тонн, на Третье транспортное кольцо — грузовикам грузоподъёмностью свыше 1 тонны. Отдельно и жёстче работает экологический класс: машине ниже Евро-2 на МКАД нельзя вообще, ниже Евро-3 — нельзя на ТТК, и пропуск это ограничение не снимает.</p>
      <p>Практический вывод из таблицы парка: порог 12 тонн проходит ровно между вторым и третьим рядом. Двухосные машины (7,5 и 8,18 т полной массы) в город едут свободно; трёхосные (24,0 и 24,8 т) — только с пропуском. То есть выбор между «средним» и «тяжёлым» классом для московского адреса — это не про деньги, а про то, успеете ли вы оформить допуск к дате рейса.</p>
      <p>Пропуск бесплатный и оформляется на конкретный государственный номер. Из этого следует то, о чём заказчики узнают в последний момент: подменить машину утром рейса нельзя — вместе с машиной уедет и допуск. Полный разбор трёх зон, порядка оформления и штрафов — в <NuxtLink to="/blog/propusk-mkad-ttk-gruzovik/">отдельной статье</NuxtLink>.</p>
    </div>
  </section>

  <section class="section wrap" id="ploshchadka">
    <div class="section-head">
      <h2>Площадка отсекает технику раньше, чем груз</h2>
    </div>
    <div class="prose">
      <p>В работе манипулятор шире, чем в движении: он вывешивается на выносные опоры. У Kanglim KS1256G-II расстояние между опорами — 5 566 мм, то есть машине нужна полоса почти в шесть метров, а не только место под колёсами. На улице садового товарищества шириной в одну машину точка стоянки нередко оказывается единственной, и вылет считается от неё, а не от ворот участка.</p>
      <p>Второй ограничитель — провода. Пункт 112 ФНП, утверждённых приказом Ростехнадзора от 26.11.2020 № 461, требует наряд-допуск при работе ближе 30 метров от крайнего провода воздушной линии напряжением более 50 В. Бытовая линия 0,4 кВ вдоль улицы посёлка под этот порог попадает, поэтому в Подмосковье он срабатывает заметно чаще, чем ожидает заказчик. Геометрия КМУ у линии разобрана <NuxtLink to="/blog/ohrannaya-zona-lep-manipulyator/">отдельно</NuxtLink>.</p>
      <p>Третий — ширина груза. Допустимая ширина транспортного средства по приложению № 1 к постановлению Правительства РФ № 2200 — 2,55 метра. Борт КАМАЗ-65115 ровно 2,55 м: любой груз, выступающий за борт вбок, уже превышает габарит и требует специального разрешения, а не просто пропуска.</p>
    </div>
  </section>

  <section class="section wrap" id="dokumenty">
    <div class="section-head">
      <h2>Что оформляется на рейс</h2>
    </div>
    <div class="prose">
      <p>Основной перевозочный документ — транспортная накладная по форме из постановления Правительства РФ от 21.12.2020 № 2200; форма 1-Т (ТТН) обязательна только для отдельных категорий грузов. На технику оформляется путевой лист. Что именно попадает в каждый документ и что меняется с переходом на электронные перевозочные документы — в <NuxtLink to="/documents/ttn-i-putevoy-list/">разборе перевозочных документов</NuxtLink>.</p>
      <p>Оператор подаётся только с допуском на кран-манипуляторную установку — это отдельный вид допуска, не совпадающий с удостоверением крановщика; разница разобрана в <NuxtLink to="/blog/attestaciya-operatora-kmu/">статье про допуск оператора КМУ</NuxtLink>.</p>
    </div>
  </section>

  <section class="section wrap" id="honesty">
    <div class="section-head">
      <h2>Чего вы не найдёте на этом сайте — и почему</h2>
    </div>
    <div class="panel panel--soft prose">
      <p>Раздела отзывов нет: он появится, когда будут первые реальные заказы через сайт со ссылками на настоящие профили в картах — не раньше. Фотографий «нашей техники» нет: стоковые снимки чужих машин под видом собственного парка мы не ставим. Реквизиты компании публикуются по мере оформления документов.</p>
      <p>Зато есть то, чего обычно не показывают: таблица цен целиком, паспортные характеристики машин со ссылками на источники и честная строка о том, что самая мощная КМУ в парке достаёт всего на восемь метров. Если что-то из этого важно для решения — спросите прямо при заявке, ответим без прикрас.</p>
    </div>
  </section>

  <section class="section wrap" id="faq">
    <div class="section-head">
      <h2>Частые вопросы</h2>
    </div>
    <div class="faq">
      <details v-for="f in faqs" :key="f.q" class="faq__item">
        <summary>{{ f.q }}</summary>
        <p>{{ f.a }}</p>
      </details>
    </div>
  </section>

  <!-- Заголовок слева, форма справа. Форма шириной 460px, стоящая под
       заголовком в ряду шириной 1060px, оставляла у нижнего края страницы
       600px пустоты — не «воздух», а незанятое место. -->
  <section class="section wrap order-split" id="order">
    <div class="section-head">
      <h2>Оставить заявку</h2>
    </div>
    <form class="order-form panel" @submit.prevent="onOrderSubmit">
      <p class="order-form__req">Звёздочкой отмечено обязательное поле.</p>
      <div class="order-form__field">
        <label for="order-name">Ваше имя или компания</label>
        <input id="order-name" v-model="orderName" type="text" name="name" autocomplete="name" />
      </div>
      <div class="order-form__field">
        <label for="order-phone">Телефон <span aria-hidden="true">*</span><span class="sr-only">, обязательное поле</span></label>
        <input
          id="order-phone"
          v-model="orderPhone"
          type="tel"
          name="phone"
          autocomplete="tel"
          inputmode="tel"
          required
          aria-describedby="order-phone-hint"
        />
        <span id="order-phone-hint" class="order-form__hint">Формат любой: +7 900 000-00-00 или 8 900 0000000.</span>
      </div>
      <div class="order-form__field">
        <label for="order-cargo">Что и куда везём</label>
        <input id="order-cargo" v-model="orderCargo" type="text" name="cargo" autocomplete="off" />
      </div>
      <!-- Honeypot от ботов: реальным пользователям поле не видно и недоступно
           ни с клавиатуры, ни через скринридер. Человек его никогда не заполнит. -->
      <input
        id="order-website"
        v-model="orderWebsite"
        class="order-form__hp"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        style="position:absolute; left:-9999px; opacity:0; height:0; width:0;"
      />
      <!-- Согласие на обработку ПД. Три вещи здесь обязательны и проверяются:
           чекбокс НЕ предзаполнен, помечен required, и рядом стоят ДВЕ раздельные
           ссылки — на политику и на согласие. Одна ссылка «на политику, где всё
           написано» с 01.09.2025 не годится: согласие обязано быть отдельным
           документом, и пользователь должен иметь возможность прочитать именно
           его. Метка обёрнута вокруг поля, поэтому связана с ним без for/id и
           кликается целиком. -->
      <label class="order-form__consent">
        <input id="order-consent" v-model="orderConsent" type="checkbox" name="consent" required />
        <span>Даю <NuxtLink to="/soglasie-na-obrabotku-personalnyh-dannyh/">согласие на обработку персональных данных</NuxtLink>
          и ознакомлен с <NuxtLink to="/politika-obrabotki-personalnyh-dannyh/">политикой обработки персональных данных</NuxtLink>.</span>
      </label>
      <button class="btn" type="submit" :disabled="orderStatus === 'sending'">
        {{ orderStatus === 'sending' ? 'Отправляем…' : 'Отправить заявку →' }}
      </button>
      <!-- Живая область присутствует в DOM с самого начала: если создавать её
           по факту отправки, часть скринридеров не успевает её озвучить. -->
      <p class="order-form__status" role="status">
        <template v-if="orderStatus === 'success'">
          Заявка отправлена, мы перезвоним.
        </template>
        <template v-else-if="orderStatus === 'error'">
          Заявка не отправлена: запрос не прошёл. Позвоните по
          номеру <a :href="SITE_TEL_HREF">{{ SITE_PHONE }}</a>, задачу примем сразу.
        </template>
      </p>
    </form>
  </section>

  <div class="wrap" style="padding-bottom:40px">
    <AppSources :items="sources" />
  </div>
</main>
</template>

<style scoped>
/* ─── Видео-панель первого экрана ────────────────────────────────────────────
   Волна приёмки (26.08.2026). Найдено живой проверкой на 375px: у всей группы
   .videohero* НЕ БЫЛО НИ ОДНОГО правила. Разметку добавила Волна 123, стили к
   ней не доехали — комментарий в шаблоне ссылается на правило
   «.videohero__video { display: none }», которого в файле нет.
   Последствия были не косметические: <video> рисовался в своём собственном
   размере 1280×720 и торчал за правый край на любом экране уже́ 1300px, то есть
   на всех телефонах и на большинстве ноутбуков; текст панели вместо наложения
   на кадр падал под него; фолбэк prefers-reduced-motion не работал.
   Ни один линтер этого не видел — оба разбирают HTML, а не отрисовку.
   Композиция восстановлена ровно та, которую предполагает разметка: кадр во всю
   панель, затемняющий градиент, текст поверх. Язык — тот же bento: радиус 20px
   и мягкая тень, как у .card и .cfg. */
/* Первый экран — bento из двух плиток разного веса: кадр во всю высоту слева,
   мотив-плитка справа. minmax(0, …) на обеих колонках обязателен: без него
   видео-колонка запрашивает собственный размер кадра (1280px) и распирает
   страницу — ровно эта ошибка уже стоила сайту горизонтального скролла
   на всех экранах уже 1300px (см. комментарий Волны приёмки выше). */
.hero-bento {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 290px);
  gap: 14px;
  margin-block: clamp(16px, 3vw, 26px) 0;
  align-items: stretch;
}
.videohero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: var(--r-lg);
  box-shadow: var(--shadow);
  min-height: clamp(240px, 34vw, 380px);
  display: flex;
  align-items: flex-end;
}
.videohero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  /* Постер лежит и здесь фоном: он же служит фолбэком, когда видео скрыто по
     prefers-reduced-motion или не загрузилось. */
  background: var(--ink) url('/images/hero/hero-timber-poster.jpg') center / cover no-repeat;
}
.videohero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* Затемнение снизу вверх: внизу лежит текст, вверху кадр остаётся читаемым.
   #fff на нижней части градиента (≈ #26332C по итогу наложения) — больше 10:1. */
/* Волна мобильной приёмки (26.08.2026). Верхняя точка градиента поднята с .10
   до .34, средняя — с .58 до .72. Проверено глазами на кадре 375×812: первые
   строки лида ложились на светлое небо кадра, и белым по нему выходило около
   2,6:1 — читаемость зависела от того, какой кадр видео сейчас на экране.
   На .34 та же светлая область даёт 4,6:1, на .72 — около 7,8:1. */
.videohero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 38, 30, .34) 0%, rgba(20, 38, 30, .72) 52%, rgba(20, 38, 30, .92) 100%);
}
.videohero__body {
  position: relative;
  z-index: 1;
  padding: clamp(20px, 3.4vw, 38px);
  color: #fff;
  max-width: 66ch;
}
/* Надпись-локатор над лидом. Была пилюлей (border-radius: 100px): на 320px
   текст переносился на две строки внутри неё, и пилюля превращалась в
   бесформенное зелёное пятно поверх кадра. Стало — плашка со скруглением
   --r-sm, то есть тем же, что у инсетов внутри плиток: на двух строках она
   остаётся прямоугольной плашкой, а не блином.
   Фон непрозрачный намеренно: полупрозрачная подложка поверх видео делает
   контраст текста зависимым от кадра, а кадр меняется каждую секунду.
   #FFFFFF на #26633F = 7,18:1 при любом кадре. */
.videohero__eyebrow {
  display: inline-block;
  font-size: var(--fs-2xs);
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #fff;
  background: var(--accent-ink);
  padding: 6px 12px;
  border-radius: var(--r-sm);
  line-height: 1.35;
}
.videohero__lead {
  margin-top: 14px;
  font-size: var(--fs-lg);
  line-height: 1.45;
  text-shadow: 0 1px 12px rgba(20, 38, 30, .5);
}
.videohero__cta {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  margin-top: 18px;
  padding: 0 22px;
  border-radius: 100px;
  background: #fff;
  color: var(--accent-ink);
  font-weight: 700;
  font-size: var(--fs-md);
  text-decoration: none;
  transition: transform .15s ease, box-shadow .15s ease;
}
.videohero__cta:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(20, 38, 30, .28); }
/* Цена на кадре. Крупное число набрано заголовочной гарнитурой и tabular-nums —
   тем же голосом, что итог конфигуратора (.cfg__sum-total), чтобы человек узнал
   одну и ту же цифру в двух местах страницы, а не читал два разных прайса. */
.videohero__price {
  margin-top: 16px;
  display: grid;
  gap: 3px;
  max-width: 30ch;
}
.videohero__price-num {
  font-family: var(--display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.05;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
  color: #fff;
  text-shadow: 0 1px 12px rgba(20, 38, 30, .55);
}
.videohero__price-cap { font-size: var(--fs-xs); line-height: 1.35; color: rgba(255, 255, 255, .92); }
/* Хвост прежнего лида: тем же кеглем, что подпись к видео, но цветом текста —
   это предложение, а не выходные данные. */
.hero-tail { margin-top: 14px; font-size: var(--fs-md); color: var(--muted); max-width: 60ch; }
/* ─── Мотив-плитка первого экрана ───────────────────────────────────────
   Мятная поверхность против фотографической — две плитки одного bento не
   должны быть одной фактуры, иначе это не bento, а разрезанный пополам
   прямоугольник. */
.reachtile {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
  padding: clamp(18px, 2.2vw, 24px);
  border-radius: var(--r-lg);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}
.reachtile__svg { display: block; width: 100%; height: auto; }
.reachtile__rows { margin: 0; display: grid; gap: 12px; }
.reachtile__row { display: grid; gap: 2px; padding-top: 12px; border-top: 1px solid var(--accent-line); }
.reachtile__row:first-child { padding-top: 0; border-top: none; }
.reachtile__row dt {
  font-family: var(--display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.05;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
  color: var(--accent-ink);
}
.reachtile__row dd { margin: 0; font-size: var(--fs-xs); color: var(--muted); line-height: 1.35; }

.videohero__credit { margin-top: 10px; font-size: var(--fs-2xs); color: var(--muted); max-width: 78ch; }
.videohero__credit a { color: var(--accent-ink); }
@media (prefers-reduced-motion: reduce) {
  /* Видео убирается целиком — под ним остаётся тот же кадр постером. */
  .videohero__video { display: none; }
  .videohero__cta { transition: none; }
}

/* .cargo-grid, .cargo-card, .cargo-card__icon и hover-подсветка карточек переехали
   в main.css: ровно эти же классы объявлялись ВТОРОЙ раз в pages/gruzy/index.vue
   и уже разошлись — на главной карточка получала зелёное свечение и подсветку
   рамки при наведении, в разделе «Грузы» та же карточка того же груза не
   получала ничего. Здесь осталось только то, чего нет у соседа: список фактов. */
.cargo-card__facts { margin: 16px 0 0; display: grid; gap: 0; }
/* Инсет вместо простого списка: три факта груза — это payload карточки, и он
   должен читаться как вложенный блок, а не как ещё три строки того же текста.
   Радиус --r-sm внутри --r-md плитки: скругления концентричны. */
.cargo-card__facts { background: #F4F8F5; border-radius: var(--r-sm); padding: 4px 14px; }
.cargo-card__facts div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 10px; padding-block: 10px; border-bottom: 1px solid #E3EBE6; }
.cargo-card__facts div:last-child { border-bottom: none; }
.cargo-card__facts dt { font-size: var(--fs-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--accent-ink); padding-top: 2px; }
.cargo-card__facts dd { margin: 0; font-size: var(--fs-xs); color: var(--muted); }

.dir-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
.dir-card { display: block; text-decoration: none; padding: clamp(20px, 2.2vw, 26px); transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease; }
.dir-card__road { display: inline-block; margin-top: 6px; background: var(--accent-soft); color: var(--accent-ink); font-size: var(--fs-2xs); font-weight: 700; letter-spacing: .04em; padding: 4px 10px; border-radius: var(--r-pill); }
.dir-card p { margin-top: 12px; color: var(--muted); font-size: var(--fs-sm); }
.dir-card__km { display: block; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); font-family: var(--display); font-weight: 700; font-variant-numeric: tabular-nums; color: var(--accent-ink); font-size: var(--fs-md); }

/* ─── Честная полоса метрик ─────────────────────────────────────────────
   Волна визуальной приёмки. Было: ещё одна белая плитка с рамкой 1px — четвёртая
   подряд поверхность одного и того же вида, — и «крупное» число 35,7 px, которое
   оказывалось МЕЛЬЧЕ заголовка соседней секции (37,4 px). Цифра на этом сайте —
   приём, а не подпись: она обязана быть самой крупной вещью в блоке.
   Стало: мятная полоса без тени с волосяными разделителями — поверхность,
   которой на странице больше нигде нет, поэтому блок не сливается ни с
   конфигуратором сверху, ни с сеткой грузов снизу. Число — --fs-num (51 px),
   то есть на полторы ступени выше h2. */
.honest-bar {
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
  border-radius: var(--r-lg);
  padding: clamp(20px, 3vw, 32px);
  margin-block: clamp(20px, 3vw, 30px) 0;
}
.honest-bar__lead { font-size: var(--fs-sm); color: var(--accent-ink); max-width: 60ch; font-weight: 600; }
.honest-bar__grid { margin: clamp(18px, 2.4vw, 26px) 0 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; }
.honest-bar__item { display: flex; flex-direction: column; gap: 8px; min-width: 0; padding-inline: clamp(12px, 1.8vw, 22px); border-left: 1px solid var(--accent-line); }
.honest-bar__item:first-child { padding-left: 0; border-left: none; }
.honest-bar__item:last-child { padding-right: 0; }
.honest-bar__label { order: 2; font-size: var(--fs-xs); color: var(--muted); line-height: 1.35; text-wrap: pretty; }
/* Крупные числа честной плашки. Было 800 под Satoshi — у Jura такого начертания
   нет (300-700), и браузер рисовал бы синтетический жир. Взамен: реальные 700,
   отрицательный трекинг (цифра «0» у Jura занимает 0,684em против 0,6em у Inter —
   четырёхзначные числа расползались) и tabular-nums, чтобы четыре показателя в
   строке стояли по одной сетке, а не гуляли по ширине. */
.honest-bar__num { order: 1; margin: 0; font-family: var(--display); font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; font-size: var(--fs-num); line-height: 1; color: var(--accent-ink); }
.honest-bar__num--date { font-size: var(--fs-xl); }

/* Таблица парка в bento-панели вместо голого блока — тот же контейнерный язык,
   что у конфигуратора и честной плашки, только для строк вместо карточек. */
.park-panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow);
  padding: clamp(14px, 2.2vw, 26px);
  transition: box-shadow .18s ease;
}
.park-panel:hover { box-shadow: 0 16px 34px -10px rgba(47, 122, 79, .18), var(--shadow-hover); }

/* Баннер-мост к /uslugi/lyubaya-tehnika-cherez-set/ — сама ссылка растянута
   на всю карточку (крупная область клика), а не мелкий «→» внутри блока. */
/* Баннер — единственная на странице ТЁМНАЯ плитка, и это не «случайная тёмная
   секция посреди светлой страницы»: он один говорит о другой оси (вид техники,
   а не груз), и его задача — не встроиться в ряд, а выломиться из него.
   Тон взят из палитры сайта (--ink, тот же тёмно-зелёный, что у всего текста),
   а не введён новый цвет. Контраст посчитан: #FFFFFF на #14261E = 16,0:1,
   #E3F0E7 на #14261E = 13,9:1. */
.network-banner {
  display: block;
  text-decoration: none;
  padding: clamp(24px, 3.2vw, 38px);
  border-radius: var(--r-lg);
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}
.network-banner__badge { display: inline-block; background: rgba(227, 240, 231, .16); color: #CDE6D6; font-size: var(--fs-2xs); font-weight: 700; letter-spacing: .04em; text-transform: uppercase; padding: 5px 12px; border-radius: var(--r-pill); }
.network-banner__title { margin-top: 16px; max-width: 26ch; color: #fff; }
.network-banner__text { margin-top: 12px; color: #C6D3CB; font-size: var(--fs-md); max-width: 62ch; }
.network-banner__cta { display: inline-flex; align-items: center; gap: 10px; margin-top: 20px; color: #fff; font-weight: 700; font-size: var(--fs-md); }
.network-banner:hover { border-color: var(--accent); box-shadow: 0 22px 44px -16px rgba(20, 38, 30, .55), var(--shadow-hover); }
.network-banner:hover .network-banner__cta { color: #9FD4B4; }

/* Секция «Из чего складывается цена» — прайс-проза слева, схема момента справа. */
.tarif-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 300px); gap: clamp(24px, 3vw, 40px); align-items: start; }

.order-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 480px); gap: clamp(24px, 4vw, 56px); align-items: start; }
.order-split .section-head { margin-bottom: 0; }
@media (max-width: 860px) { .order-split { grid-template-columns: 1fr; } .order-split .section-head { margin-bottom: clamp(20px, 3vw, 28px); } }
.order-form { display: grid; gap: 14px; align-content: start; }
.order-form__req { font-size: var(--fs-xs); color: var(--muted); }
.order-form__field { display: grid; gap: 6px; }
.order-form__field label { font-size: var(--fs-xs); color: var(--muted); font-weight: 600; }
.order-form__hint { font-size: var(--fs-xs); color: var(--muted); }
/* border: --field-line = 3.41:1 к белому (WCAG 1.4.11); --line давал 1.25:1 */
.order-form input { background: #fff; border: 1px solid var(--field-line); border-radius: var(--r-sm); color: var(--ink); padding: 13px 14px; min-height: 46px; font-family: inherit; font-size: var(--fs-md); transition: border-color .15s ease, box-shadow .15s ease; }
.order-form input:not([type="checkbox"]):hover { border-color: var(--accent); }
.order-form input:not([type="checkbox"]):focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(47, 122, 79, .12); }
/* Подсказка под невалидным полем окрашивается вместе с рамкой: рамка одна
   не сообщает, ЧТО не так, а красный текст рядом со штатной подсказкой формата
   телефона делает это без нового сообщения об ошибке. */
.order-form input:user-invalid ~ .order-form__hint { color: var(--danger); font-weight: 600; }
/* Honeypot: перебивает min-height/padding обычных полей, чтобы inline height:0/width:0
   из style-атрибута (см. verification-требование Волны 35) реально давали нулевой бокс. */
.order-form input.order-form__hp { min-height: 0; padding: 0; border: 0; }
/* Чекбокс согласия. Не наследует бокс текстовых полей (иначе получил бы
   min-height 44px и padding 13px и раздулся в квадрат), но сам остаётся
   достаточно крупной целью: 20px квадрат внутри метки высотой ≥44px. */
.order-form__consent { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; padding: 4px 0; font-size: var(--fs-xs); color: var(--muted); line-height: 1.5; cursor: pointer; }
.order-form input[type="checkbox"].order-form__consent-box,
.order-form__consent input[type="checkbox"] { width: 20px; height: 20px; min-height: 20px; padding: 0; margin: 1px 0 0; border-radius: 6px; accent-color: var(--accent); flex: none; cursor: pointer; }
.order-form__consent a { color: var(--accent-ink); font-weight: 600; }
.order-form button { min-height: 48px; justify-content: center; }
.order-form button:disabled { opacity: .65; cursor: not-allowed; }
.order-form__status:not(:empty) { background: var(--accent-soft); border-radius: 12px; padding: 12px 14px; font-size: var(--fs-sm); }
.order-form__status a { color: var(--accent-ink); font-weight: 700; white-space: nowrap; }

@media (max-width: 900px) { .tarif-grid { grid-template-columns: 1fr; } }
/* Мотив-плитка уходит под кадр и разворачивается в две колонки: две строки
   цифр в столбик под видео — это лишний экран прокрутки до конфигуратора. */
@media (max-width: 860px) {
  .hero-bento { grid-template-columns: minmax(0, 1fr); }
  .reachtile { flex-direction: row; align-items: center; gap: clamp(16px, 3vw, 28px); }
  .reachtile__svg { flex: 0 1 210px; min-width: 0; }
  .reachtile__rows { flex: 1 1 0; min-width: 0; }
}
@media (max-width: 800px) {
  .honest-bar__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(18px, 4vw, 24px) 0; }
  .honest-bar__item:nth-child(3) { padding-left: 0; border-left: none; }
}
@media (max-width: 700px) {
  .dir-grid { grid-template-columns: 1fr; }
  .cargo-card__facts div { grid-template-columns: 1fr; gap: 2px; }
  /* ── Первый экран телефона: кадр отдельно, текст отдельно ─────────────────
     Волна мобильной приёмки (26.08.2026), найдено на кадрах 375×812. На широком
     экране текст лежит поверх кадра и это работает: панель 380px высотой, текста
     в ней четверть площади. На телефоне та же композиция вырождалась — восемь
     строк лида накрывали кадр целиком, от фотографии оставалась фактура под
     буквами, а контраст белого зависел от того, какой кадр видео сейчас идёт.
     Здесь плитка делится по горизонтали: кадр становится полосой сверху, текст
     садится на сплошной --ink снизу. Фотография наконец видна как фотография
     (её ничем не перекрывает), белое по #14261E даёт 16:1 при любом кадре,
     и композиция остаётся тем же bento — одна плитка, один радиус, одна тень. */
  .videohero { display: block; min-height: 0; }
  .videohero__media { position: relative; inset: auto; height: 152px; }
  .videohero__scrim { background: linear-gradient(180deg, rgba(20, 38, 30, 0) 55%, rgba(20, 38, 30, .35) 100%); }
  .videohero__body { background: var(--ink); max-width: none; padding: 20px 18px 22px; }
  .videohero__lead { text-shadow: none; }
  .videohero__price-num { text-shadow: none; }
}
/* Ниже 520px мотив-плитка снова в столбик: в строку схема ужимается до
   нечитаемых 120px, и подпись «Kanglim KS1256G-II — вылет 18,7 м» рвётся
   на четыре строки рядом с ней. */
@media (max-width: 520px) {
  .reachtile { flex-direction: column; align-items: stretch; }
  /* Схема остаётся в полную ширину (в строку она ужимается до нечитаемых 120px),
     но высота ограничена: при width:100% на 375px viewBox 220×120 разворачивался
     в 165px высоты, и мотив-плитка выталкивала конфигуратор на 80px ниже сгиба.
     preserveAspectRatio по умолчанию вписывает рисунок в 120px по центру. */
  /* Волна мобильной приёмки (26.08.2026). Плитка ужата на 30px. Замерено на
     кадре 375×812: сгиб телефона с учётом закреплённой снизу CTA-панели (56px
     плюс safe-area) приходится на 744-ю точку, а плитка начиналась на 595-й и
     заканчивалась на 879-й — первая же цифра мотива («22,4 т·м») приходилась
     ровно на кромку панели и читалась половиной высоты. Стало 595–855: схема
     целиком и само число 22,4 т·м лежат выше кромки (проверено на кадре),
     подпись под числом по-прежнему уходит под панель — но подпись читают
     после числа, а не вместо него. */
  .reachtile { padding: 14px; gap: 10px; }
  .reachtile__svg { flex: none; max-height: 84px; }
  .reachtile__row { padding-top: 10px; }
}
/* Четыре показателя в две колонки на 320px дают 112px на колонку — в такую
   ширину не встаёт ни «типов груза разобрано по ограничителям», ни дата.
   Замерено: на 320px метка ложилась в шесть строк. */
@media (max-width: 460px) {
  .honest-bar__grid { grid-template-columns: 1fr; gap: 0; }
  .honest-bar__item { padding-inline: 0; padding-block: 16px; border-left: none; border-top: 1px solid var(--accent-line); flex-direction: row; align-items: baseline; gap: 14px; }
  .honest-bar__item:first-child { border-top: none; padding-top: 0; }
  .honest-bar__item:last-child { padding-bottom: 0; }
  .honest-bar__num { flex: none; min-width: 3ch; }
  .honest-bar__num--date { min-width: 0; }
  .honest-bar__label { flex: 1 1 0; }
}
</style>
