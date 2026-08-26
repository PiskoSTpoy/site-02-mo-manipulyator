// Единственный источник телефона сайта. Раньше он был константой внутри
// layouts/default.vue, и любому другому компоненту (форма заявки, CTA-панель)
// пришлось бы дублировать строку с риском разъехаться.
// Значение НЕ выдумано — это тот же номер, что уже стоял в шапке, футере и в
// schema.org LocalBusiness этого сайта.
export const SITE_BRAND = 'МАНИП-МО'
export const SITE_PHONE = '+7 (907) 031-17-37'
export const SITE_TEL_HREF = `tel:${SITE_PHONE.replace(/[^\d+]/g, '')}`

// Форма заявки отправляет POST на Cloudflare Worker, который пересылает заявку
// диспетчеру в Telegram. Воркер задеплоен, адрес ниже — рабочий, не плейсхолдер;
// идентификатор площадки в payload — 'manipmo' (он же в белом списке SITE_NAMES
// воркера), контракт payload сверен построчно. Реальный тестовый POST с этого
// сайта не выполнялся — прямой запрет задания, проверка только статическая.
export const LEAD_ENDPOINT = 'https://kran-network-leads.kran-network-leads.workers.dev/submit'
