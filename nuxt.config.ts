export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  // Волна 14 (дедупликация). /documents/dokumenty-na-operatora/ удалена:
  // страница отвечала на тот же запрос, что и собственная статья блога про
  // аттестацию оператора КМУ (внутренняя каннибализация), и одновременно повторяла
  // шаблонный каркас «комплект документов на технику и оператора».
  // 301 ведёт на страницу-владельца темы внутри сайта, чтобы не терять входящие ссылки.
  // Волна 16 (структурное расхождение). Ось сайта сменилась с «услуги» на «груз»,
  // а география — с административных единиц на шоссе. Старые URL сохраняем 301-ми,
  // каждый — на ближайшего по смыслу преемника, а не скопом на главную:
  //   /uslugi/dostavka-razgruzka-manipulyatorom/ → /gruzy/            (весь раздел грузов и есть эта услуга)
  //   /uslugi/manipulyator-tyazhelyy-10-20-tonn/ → /gruzy/zhbi-i-plity/ (тяжёлый класс = ЖБИ)
  //   /uslugi/manipulyator-v-moskvu/            → /napravleniya/       (московский слой разобран в хабе направлений)
  //   /geo/balashiha/                           → /napravleniya/gorkovskoe/ (Балашиха стоит на Горьковском шоссе)
  //   /geo/himki/, /geo/odintsovo/              → /napravleniya/       (Ленинградское и Минское в четвёрку не входят —
  //                                                                     честнее хаб, чем натянутое соответствие)
  //   /park/<модель>/                           → /park/               (четыре карточки заменены одной таблицей)
  routeRules: {
    '/documents/dokumenty-na-operatora/**': { redirect: { to: '/blog/attestaciya-operatora-kmu/', statusCode: 301 } },
    '/documents/dokumenty-na-operatora': { redirect: { to: '/blog/attestaciya-operatora-kmu/', statusCode: 301 } },

    '/uslugi/dostavka-razgruzka-manipulyatorom/**': { redirect: { to: '/gruzy/', statusCode: 301 } },
    '/uslugi/dostavka-razgruzka-manipulyatorom': { redirect: { to: '/gruzy/', statusCode: 301 } },
    '/uslugi/manipulyator-tyazhelyy-10-20-tonn/**': { redirect: { to: '/gruzy/zhbi-i-plity/', statusCode: 301 } },
    '/uslugi/manipulyator-tyazhelyy-10-20-tonn': { redirect: { to: '/gruzy/zhbi-i-plity/', statusCode: 301 } },
    '/uslugi/manipulyator-v-moskvu/**': { redirect: { to: '/napravleniya/', statusCode: 301 } },
    '/uslugi/manipulyator-v-moskvu': { redirect: { to: '/napravleniya/', statusCode: 301 } },

    '/geo/balashiha/**': { redirect: { to: '/napravleniya/gorkovskoe/', statusCode: 301 } },
    '/geo/balashiha': { redirect: { to: '/napravleniya/gorkovskoe/', statusCode: 301 } },
    // Волна 113 (21.08.2026): Химки теперь честно закрыты собственной страницей
    // направления (Ленинградское шоссе, 3 км от МКАД) — редирект специализирован,
    // раньше вёл на общий хаб, потому что среди первых четырёх шоссе Ленинградского
    // не было (см. комментарий Волны 16 выше).
    '/geo/himki/**': { redirect: { to: '/napravleniya/leningradskoe/', statusCode: 301 } },
    '/geo/himki': { redirect: { to: '/napravleniya/leningradskoe/', statusCode: 301 } },
    '/geo/odintsovo/**': { redirect: { to: '/napravleniya/', statusCode: 301 } },
    '/geo/odintsovo': { redirect: { to: '/napravleniya/', statusCode: 301 } },

    '/park/inman-im-150/**': { redirect: { to: '/park/', statusCode: 301 } },
    '/park/inman-im-150': { redirect: { to: '/park/', statusCode: 301 } },
    '/park/soosan-scs334/**': { redirect: { to: '/park/', statusCode: 301 } },
    '/park/soosan-scs334': { redirect: { to: '/park/', statusCode: 301 } },
    '/park/kanglim-ks1256/**': { redirect: { to: '/park/', statusCode: 301 } },
    '/park/kanglim-ks1256': { redirect: { to: '/park/', statusCode: 301 } },
    '/park/palfinger-pk23500/**': { redirect: { to: '/park/', statusCode: 301 } },
    '/park/palfinger-pk23500': { redirect: { to: '/park/', statusCode: 301 } },

    // Слаг кейса переименован: разбор перестал быть про конкретно Химки (Ленинградское
    // шоссе в четвёрку направлений не входит) и стал про регламент логопарка вообще.
    // Слаг, который врёт про содержание страницы, — такой же дефект, как битая ссылка.
    '/keysy/razgruzka-na-sklade-himki/**': { redirect: { to: '/keysy/razgruzka-na-logoparke/', statusCode: 301 } },
    '/keysy/razgruzka-na-sklade-himki': { redirect: { to: '/keysy/razgruzka-na-logoparke/', statusCode: 301 } },
  },
  // Волна 15. `nuxt generate` пререндерит каждый маршрут в двух формах: из роутера
  // (/park/inman-im-150) и найденную краулером в разметке (/park/inman-im-150/).
  // Обе формы дают ОДИН ключ кэша payload-а, и на Windows два параллельных
  // atomicWrite (write .tmp → rename поверх существующего файла) стабильно ловят
  // EPERM: rename поверх файла, открытого вторым запросом, запрещён. Сборка падала
  // с [500] Server Error на случайных страницах — каждый раз на разных.
  // Кэш пререндера переведён в память: в рамках одного процесса сборки он решает
  // ту же задачу (не считать payload повторно), файловых переименований не делает,
  // а статическая выдача от этого не меняется ни на байт.
  nitro: {
    storage: {
      'internal:nuxt:prerender': { driver: 'memory' },
    },
  },
  // Волна приёмки (26.08.2026). Про 404: `nuxt generate` кладёт в 404.html пустую
  // SPA-оболочку, и переопределить это конфигом нельзя — список
  // PRERENDER_NO_SSR_ROUTES в @nuxt/nitro-server захардкожен, ни
  // routeRules { ssr: true }, ни nitro.prerender.routes на него не действуют
  // (обе попытки собраны и проверены, файл оставался 1526-байтовой оболочкой).
  // Поэтому статическая страница лежит в public/404.html и подменяет оболочку
  // после сборки — см. scripts/postbuild.mjs и комментарий внутри самой страницы.
  // Волна приёмки (26.08.2026). Шрифты сняты с обоих сторонних CDN.
  // Было: Inter с fonts.googleapis.com + Satoshi с api.fontshare.com — два лишних
  // соединения в критическом пути рендера и IP каждого посетителя, уходящий за
  // рубеж (см. legal-crossborder-disclosure). Стало: локальные woff2 в
  // public/fonts, сгенерированные tools/selfhost_fonts.py.
  // Заодно сменилась сама пара гарнитур: Inter стоял ещё на трёх сайтах сети и
  // не давал сайту собственного лица. Jura (геометричная, слегка техническая) в
  // заголовках и Nunito Sans (мягкая, открытая) в тексте держат воздушность
  // bento-кода, но звучат иначе, чем нейтральный Inter. Обе гарнитуры проверены
  // на кириллицу чтением cmap из woff2 — 61 буква из 61 в каждой.
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      // og:image задан один на весь сайт. Отдельная картинка под каждую из 39
      // страниц была бы честнее, но рисовать её не из чего: собственных фото
      // объектов у сайта нет, а генерировать «обложки с заголовком» ради
      // разнообразия — это оформление пустоты. Кадр общий и настоящий: тот же,
      // что стоит постером видео на первом экране (см. scripts/make-og.mjs).
      // og:title и og:description задаются постранично через useSeoMeta.
      meta: [
        { property: 'og:site_name', content: 'МАНИП-МО' },
        { property: 'og:locale', content: 'ru_RU' },
        // Значение по умолчанию для всех страниц; статьи блога при желании
        // переопределяют его через useSeoMeta({ ogType: 'article' }) — unhead
        // схлопывает мета-теги по property, дубля не возникает.
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:image', content: 'https://manip-mo.example/images/og/manip-mo-og.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Манипулятор поднимает бревно на площадке в Подмосковье' },
      ],
      link: [
        { rel: 'stylesheet', href: '/fonts/fonts.css' },
        // Предзагружаем ровно два файла: кириллический сабсет основного текстового
        // начертания и кириллический сабсет заголовочного. Остальные восемнадцать
        // подтягиваются обычным путём по unicode-range — предзагружать их значило бы
        // соревноваться с самим собой за полосу.
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/nunito-sans-cyrillic-400-normal.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/jura-cyrillic-700-normal.woff2', crossorigin: 'anonymous' },
      ],
    },
  },
})
