<script setup lang="ts">
// Бренд/телефон — из app/utils/contacts.ts (общий источник для шапки, футера,
// мобильной CTA-панели и формы заявки), Nuxt импортирует их автоматически.
const BRAND = SITE_BRAND
const PHONE = SITE_PHONE
const TEL_HREF = SITE_TEL_HREF
const SITE = 'https://manipmo.ru'

// Волна приёмки (26.08.2026). Было ТРИ узла разметки, из которых два описывали
// одну и ту же компанию под разными идентификаторами: LocalBusiness с
// «@id: #business» и голый Organization с «@id: #organization». Для парсера это
// две разные организации на одной странице, а не организация и уточнение к ней —
// ровно то, что ловит критерий sd-organization-single. Узел теперь один:
// LocalBusiness (это подтип Organization, отдельный дубль ему не нужен) под
// единственным идентификатором #organization, на который могут ссылаться
// страницы, если понадобится.
//
// Заодно исправлен телефон: в разметке стоял плейсхолдер +70000000020, тогда как
// в шапке, подвале и мобильной панели весь сайт показывает SITE_PHONE. Разметка,
// сообщающая поисковику не тот номер, который видит человек, — это дефект
// sd-markup-matches-visible, а не безобидная заглушка. Номер берётся из того же
// единственного источника (utils/contacts.ts), новых данных не выдумано.
// og:url — единственный из og-тегов, который обязан быть разным на каждой из 39
// страниц. Проставлять его вручную в 39 файлах значит гарантированно однажды
// забыть; берём из маршрута прямо здесь, в общем макете. Значение совпадает с
// canonical: пути страниц сайта заканчиваются слэшем.
const route = useRoute()
useHead({
  // Слэш на конце добавляется принудительно: vue-router отдаёт path без него
  // («/gruzy/konteyner»), а canonical по всему сайту пишется со слэшем —
  // og:url и canonical, указывающие на два разных адреса одной страницы,
  // это ровно тот дубль, который они и должны предотвращать.
  meta: [{ property: 'og:url', content: () => SITE + (route.path.endsWith('/') ? route.path : `${route.path}/`) }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE}/#organization`,
        name: BRAND,
        telephone: SITE_PHONE.replace(/[^\d+]/g, ''),
        email: 'info@manipmo.ru',
        url: SITE,
        priceRange: '₽₽',
        address: { '@type': 'PostalAddress', addressRegion: 'Московская область', addressCountry: 'RU' },
        geo: { '@type': 'GeoCoordinates', latitude: 55.8094, longitude: 37.9581 },
        areaServed: 'Московская область',
        openingHours: 'Mo-Su 00:00-24:00',
      }),
    },
    // Узел WebSite отсюда убран: он описывает сайт целиком и по правилам разметки
    // объявляется один раз — на главной. В макете он оказывался на всех 39
    // страницах и превращался в 39 объявлений одного и того же сайта
    // (sd-website-homepage). Теперь он живёт в pages/index.vue.
  ],
})
</script>

<template>
  <a href="#main-content" class="skip-link">Перейти к основному содержимому</a>
  <header class="nav">
    <div class="nav__row wrap">
      <!-- Волна визуальной приёмки (26.08.2026). У сайта не было знака вообще:
           бренд был просто зелёной строчкой текста, и на всех 39 страницах шапка
           ничем не отличалась от шапки любого шаблона. Знак нарисован тем же
           мотивом, что и мотив-плитка первого экрана и схема момента, — стрела
           над вылетом с грузом на конце, — и той же обводкой 1,7px, что и
           иконки грузов (AppCargoIcon). Не эмодзи и не юникод-глиф: это часть
           набора, а не заменитель иконки. -->
      <NuxtLink class="brand" to="/">
        <span class="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">
            <path d="M4.6 16.6 L16 6.6" stroke-width="2.4" />
            <path d="M16 6.6 V10.6" />
            <rect x="13.2" y="10.6" width="5.6" height="4.6" rx="1.1" />
            <rect x="2.6" y="15.4" width="4.6" height="3.6" rx="1" />
            <path d="M2.6 21 H20.6" />
          </svg>
        </span>
        <span class="brand__name">{{ BRAND }}</span>
      </NuxtLink>
      <nav class="nav__links" aria-label="Основная навигация">
        <!-- aria-current-value="false": vue-router считает «/#konfigurator» точным
             совпадением с «/» (хеш не входит в path) и вешает aria-current="page".
             Скринридер называл бы якорь внутри страницы «текущей страницей». -->
        <NuxtLink to="/#konfigurator" aria-current-value="false">Конфигуратор</NuxtLink>
        <NuxtLink to="/gruzy/">Грузы</NuxtLink>
        <NuxtLink to="/napravleniya/">Направления</NuxtLink>
        <NuxtLink to="/park/">Парк</NuxtLink>
        <NuxtLink to="/documents/">Документы</NuxtLink>
        <NuxtLink to="/faq/">Вопросы</NuxtLink>
        <a :href="TEL_HREF">{{ PHONE }}</a>
      </nav>

      <!-- Мобильное меню: нативный <details> — раскрывается и с клавиатуры, и без JS.
           До этой волны на ширине ≤760px навигация просто пропадала (.nav__links: display none)
           и внутренние страницы были недостижимы с телефона. -->
      <details class="nav__mobile">
        <summary class="nav__burger">
          <span class="nav__burger-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </span>
          <span>Меню</span>
        </summary>
        <nav class="nav__panel" aria-label="Основная навигация">
          <NuxtLink to="/">Главная</NuxtLink>
          <NuxtLink to="/#konfigurator" aria-current-value="false">Конфигуратор</NuxtLink>
          <NuxtLink to="/gruzy/">Грузы</NuxtLink>
          <NuxtLink to="/napravleniya/">Направления</NuxtLink>
          <NuxtLink to="/park/">Парк техники</NuxtLink>
          <NuxtLink to="/keysy/">Примеры задач</NuxtLink>
          <NuxtLink to="/documents/">Документы</NuxtLink>
          <NuxtLink to="/uslugi/lyubaya-tehnika-cherez-set/">Любая техника через сеть</NuxtLink>
          <NuxtLink to="/blog/">Блог</NuxtLink>
          <NuxtLink to="/faq/">Вопросы</NuxtLink>
          <NuxtLink to="/kontakty/">Контакты</NuxtLink>
          <a class="nav__panel-tel" :href="TEL_HREF">{{ PHONE }}</a>
        </nav>
      </details>
    </div>
  </header>
  <!-- tabindex="-1" — без него skip-link в части браузеров переводит только точку прокрутки,
       но не сам фокус, и следующий Tab возвращает пользователя в шапку (найдено в живом
       a11y-аудите 16.08.2026). -->
  <div id="main-content" tabindex="-1"><slot /></div>
  <!-- Волна приёмки (26.08.2026). В подвале появились обязательные ссылки:
       политика обработки ПД и согласие — ДВУМЯ раздельными пунктами (согласие с
       01.09.2025 не может быть разделом политики), плюс страница контактов.
       Подвал общий для всех страниц, поэтому ссылки автоматически стоят на
       каждой — этого и требуют legal-privacy-policy-page и yc-contacts-page-linked. -->
  <footer class="footer wrap">
    <span class="footer__copy">© 2026 {{ BRAND }} · [SITE_02_DOMAIN]</span>
    <nav class="footer__links" aria-label="Служебные страницы">
      <NuxtLink to="/kontakty/">Контакты и реквизиты</NuxtLink>
      <NuxtLink to="/politika-obrabotki-personalnyh-dannyh/">Политика обработки ПД</NuxtLink>
      <NuxtLink to="/soglasie-na-obrabotku-personalnyh-dannyh/">Согласие на обработку ПД</NuxtLink>
    </nav>
    <a :href="TEL_HREF">{{ PHONE }}</a>
  </footer>

  <!-- Мобильная CTA-панель. Только CSS и две обычные ссылки: работает без JS,
       не мутирует DOM после гидратации (и потому не может повторить гонку
       гидратации из Волны 10). Компенсирующий padding-bottom для body — в main.css
       (--mcta-h), чтобы футер не оказывался под панелью. -->
  <nav class="mcta" aria-label="Быстрые действия">
    <NuxtLink class="mcta__btn mcta__btn--order" to="/#order" aria-current-value="false">
      <span class="mcta__ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="2.5" y="12" width="8" height="6" rx="1" /><path d="M10.5 14h4l3 3.2V18h-7z" /><circle cx="6" cy="19.2" r="1.6" /><circle cx="15.5" cy="19.2" r="1.6" /><path d="M6 9V6.5A1.5 1.5 0 0 1 7.5 5H12l3 4" /></svg>
      </span>
      Заказать манипулятор
    </NuxtLink>
    <a class="mcta__btn mcta__btn--call" :href="TEL_HREF" :aria-label="`Позвонить по телефону ${PHONE}`">
      <span class="mcta__ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" /></svg>
      </span>
      Позвонить
    </a>
  </nav>
</template>

<style scoped>
.skip-link { position: absolute; left: -9999px; top: 0; z-index: 100; background: var(--accent, #2F7A4F); color: #fff; padding: 12px 20px; font-weight: 700; text-decoration: none; border-radius: 8px; }
.skip-link:focus { left: 8px; top: 8px; }
.nav { position: sticky; top: 0; z-index: 20; background: rgba(247,248,245,.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.nav__row { display: flex; justify-content: space-between; align-items: center; height: 76px; }
/* Jura существует в 300-700 и не имеет ни 800, ни 900 (было 900 под Satoshi).
   Оставить 900 значило бы отдать бренд на синтетическое утолщение браузера —
   размазанный контур вместо нарисованного начертания. 700 — реальный максимум
   гарнитуры; плотность возвращаем трекингом, а не поддельным весом. */
.brand { display: inline-flex; align-items: center; gap: 10px; font-family: var(--display); font-weight: 700; letter-spacing: .02em; font-size: var(--fs-lg); text-decoration: none; color: var(--accent-ink); }
.brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 6px -2px rgba(30, 90, 58, .5);
  transition: transform .18s cubic-bezier(.22, 1, .36, 1), box-shadow .18s ease;
}
.brand__mark svg { width: 23px; height: 23px; }
.brand:hover .brand__mark { transform: translateY(-1px) rotate(-3deg); box-shadow: 0 6px 14px -4px rgba(30, 90, 58, .55); }
.brand:active .brand__mark { transform: translateY(0) scale(.96); }
.nav__links { display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); font-weight: 600; }
/* Пункты меню — не голый текст, а цели: подложка появляется при наведении
   и остаётся у текущего раздела. До этой волны шапка не отвечала на курсор
   ничем, кроме смены цвета одного слова. */
.nav__links a { text-decoration: none; padding: 8px 12px; border-radius: var(--r-pill); transition: background-color .15s ease, color .15s ease; }
.nav__links a:hover { color: var(--accent-ink); background: #EDF3EE; }
.nav__links a:active { background: var(--accent-soft); }
/* текущий раздел виден и глазами, а не только через aria-current для скринридера */
.nav__links a[aria-current="page"] { color: var(--accent-ink); font-weight: 700; background: var(--accent-soft); }
/* Телефон — последний пункт и единственный, который должен читаться как действие. */
.nav__links a[href^="tel:"] { color: var(--accent-ink); font-weight: 700; font-variant-numeric: tabular-nums; }
/* Ни имя бренда, ни номер телефона не переносятся: на 800px «МАНИП-/МО»
   и «+7 (907)/031-17-37» ломались на две строки и раздували шапку. */
.brand__name, .nav__links a[href^="tel:"] { white-space: nowrap; }
/* Самая узкая десктопная полоса — 761px: на 760 и ниже включается бургер.
   Замер: при кегле .89rem и подложке 12px по бокам семь пунктов плюс знак
   требовали 840px при экране 761 — горизонтальный скролл на всех ширинах
   761–860px. Проверка на 320/360/375 этого не видит в принципе: там меню
   свёрнуто. Ниже 1000px пункты ужимаются на ступень и подложка становится
   теснее — раскладка та же, ряд помещается. */
@media (max-width: 1000px) {
  .nav__links { font-size: var(--fs-xs); gap: 2px; }
  .nav__links a { padding: 7px 8px; }
  .brand { gap: 8px; font-size: var(--fs-md); }
  .brand__mark { width: 34px; height: 34px; border-radius: 11px; }
  .brand__mark svg { width: 21px; height: 21px; }
}
.footer { border-top: 1px solid var(--line); padding-block: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px 24px; color: var(--muted); font-size: var(--fs-sm); margin-top: 40px; }
.footer__links { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.footer__links a { text-decoration: none; }
.footer__links a:hover { color: var(--accent-ink); text-decoration: underline; }
@media (max-width: 760px) {
  .footer { flex-direction: column; align-items: flex-start; }
  /* Ссылки в столбец: на 375px три служебных пункта в строку дают перенос
     посреди анкора и цель тапа меньше 44px по высоте. */
  .footer__links { flex-direction: column; gap: 2px; }
  .footer__links a { display: flex; align-items: center; min-height: 40px; }
}

/* ---------- Мобильное меню (нативный disclosure, без JS) ---------- */
.nav__mobile { display: none; }
.nav__burger {
  list-style: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: 100px;
  background: var(--card);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--accent-ink);
}
.nav__burger::-webkit-details-marker { display: none; }
.nav__burger-ico { display: inline-flex; width: 18px; height: 18px; }
.nav__burger-ico svg { width: 18px; height: 18px; }
.nav__mobile[open] .nav__burger { border-color: var(--accent); background: var(--accent-soft); }
.nav__panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: grid;
  padding: 8px var(--pad) 14px;
  background: var(--card);
  border-bottom: 1px solid var(--line);
  box-shadow: var(--shadow-hover);
}
.nav__panel a {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 4px 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: var(--fs-md);
  border-bottom: 1px solid var(--line);
}
.nav__panel a:last-child { border-bottom: none; }
.nav__panel-tel { color: var(--accent-ink); }
.nav__panel a[aria-current="page"] { color: var(--accent-ink); }

/* ---------- Мобильная закреплённая CTA-панель ---------- */
.mcta { display: none; }
.mcta__btn {
  /* ≥44×44 по WCAG 2.5.5 с запасом: 48px по высоте, минимум 44px по ширине */
  min-height: 48px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 100px;
  font-family: var(--sans);
  font-weight: 700;
  font-size: var(--fs-md);
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
}
/* На 320px «Заказать манипулятор» ложится в две строки и упирается в иконку.
   Ступенью ниже подпись встаёт свободно, а высота цели остаётся 48px. */
@media (max-width: 380px) { .mcta__btn { font-size: var(--fs-sm); padding: 0 10px; gap: 6px; } }
.mcta__ico { display: inline-flex; flex-shrink: 0; }
.mcta__ico svg { width: 19px; height: 19px; display: block; }
/* контраст (посчитан): #FFF на #2F7A4F = 5.23:1; #26633F на #FFF = 7.15:1;
   рамка #2F7A4F на #FFF = 5.23:1 (нетекстовый минимум 3:1) */
.mcta__btn--order { background: var(--accent); color: #fff; box-shadow: 0 2px 10px rgba(47,122,79,.28); }
.mcta__btn--call { background: var(--card); color: var(--accent-ink); border: 1.5px solid var(--accent); }
.mcta__btn--order:active { background: var(--accent-ink); }
.mcta__btn--call:active { background: var(--accent-soft); }

/* Волна визуальной приёмки. Порог переключения на бургер поднят с 760 до 860px.
   Замер: с новым знаком в шапке и подложками у пунктов меню ряд из шести
   разделов плюс телефон запрашивал 809-811px, то есть на 761-810px страница
   получала горизонтальный скролл. Проверка на 320/360/375 такое не ловит в
   принципе — там меню уже свёрнуто, а полоса 761-810 (планшет в портрете)
   ни в один стандартный набор ширин не входит.
   Вместе с меню на ту же ширину переехала и нижняя CTA-панель: телефон обязан
   быть на экране всегда — либо строкой в шапке, либо кнопкой «Позвонить»
   внизу. Разрыв между 761 и 860, где нет ни того ни другого, недопустим. */
@media (max-width: 860px) {
  .nav__links { display: none; }
  .nav__mobile { display: block; }
  .mcta {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 10px;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    /* выше шапки (20), ToC (15) и reading-progress (30) */
    z-index: 40;
    /* высота = 8 + 48 + max(12, safe-area); зеркалит --mcta-h в main.css */
    padding: 8px 14px max(12px, env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, .97);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--line);
    box-shadow: 0 -4px 18px rgba(20, 38, 30, .10);
  }
}

/* Появление панели не анимируем вовсе — она отрисована сразу серверным HTML.
   Отдельно глушим переходы состояний при prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .mcta__btn, .nav__burger { transition: none; }
}

@media print {
  .mcta, .nav__mobile { display: none !important; }
}
</style>
