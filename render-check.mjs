// Рендер РЕАЛЬНОГО компонента AppCargoConfigurator.vue вне Nuxt.
//
// Зачем: SSR-снимок собранной страницы показывает только одно состояние — дефолтное.
// Здесь тот же .vue-файл компилируется и рендерится с РАЗНЫМИ входами, включая
// мусорные, и проверяется вся цепочка «груз + плечо → машина → пропуск → цена →
// подсветка строки и колонки». Подменяются только внешние зависимости: NuxtLink
// и автоимпорты справочников (те же модули, что использует Nuxt, — не копии).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import { createSSRApp, h, defineComponent } from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as esbuild from 'esbuild'

import { FLEET, SHIFT_RATE, MKAD_PASS_GVW_T, TARIFF_BANDS_KM } from './app/utils/fleet.ts'
import { CARGO, cargoBySlug } from './app/utils/cargo.ts'
import { DIRECTIONS, kmSurcharge } from './app/utils/directions.ts'

const dir = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(dir, 'app/components/AppCargoConfigurator.vue')
const source = fs.readFileSync(file, 'utf8')

// TARIFF_BANDS_KM добавлен: компонент теперь читает BANDS из этой переменной
// (auto-import Nuxt), а не из локального литерала — вне Nuxt её нужно подставить
// так же, как остальные auto-import-справочники ниже.
const globals = { FLEET, SHIFT_RATE, MKAD_PASS_GVW_T, TARIFF_BANDS_KM, CARGO, cargoBySlug, DIRECTIONS, kmSurcharge }
globalThis.__CFG_GLOBALS__ = globals
const prelude = 'const __G = globalThis.__CFG_GLOBALS__;\n' +
  Object.keys(globals).map((k) => `const ${k} = __G.${k};`).join('\n')

// Временные модули кладём ВНУТРЬ проекта: из системного temp не резолвится
// пакет 'vue' — Node ищет node_modules вверх по дереву от файла.
const tmp = fs.mkdtempSync(path.join(dir, '.cfgcheck-'))
let seq = 0

const NuxtLink = defineComponent({
  props: { to: { type: String, default: '' } },
  setup: (p, { slots }) => () => h('a', { href: p.to }, slots.default?.()),
})

async function renderWith(cargoSlug, km) {
  const patched = source
    .replace('const cargoSlug = ref(CARGO[1]!.slug)', `const cargoSlug = ref(${JSON.stringify(cargoSlug)})`)
    .replace('const km = ref(30)', `const km = ref(${km})`)
  if (patched === source) throw new Error('патч начального состояния не применился — компонент изменился')

  const { descriptor } = parse(patched, { filename: file })
  const id = 'cfgcheck'
  const s = compileScript(descriptor, { id, inlineTemplate: false })
  const t = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id,
    compilerOptions: { bindingMetadata: s.bindings },
  })
  const js = esbuild.transformSync(s.content, { loader: 'ts', format: 'esm' }).code
  const mod = [
    prelude,
    js.replace(/export\s*\{\s*([A-Za-z0-9_$]+)\s+as\s+default\s*\};?/, 'const __sfc__ = $1;'),
    t.code,
    'export default { ...__sfc__, render }',
  ].join('\n')

  // Файл, а не data:-URL: из data:-модуля не резолвится голый специфаер 'vue'.
  const out = path.join(tmp, `c${seq++}.mjs`)
  fs.writeFileSync(out, mod, 'utf8')
  const Comp = (await import(pathToFileURL(out).href)).default

  const app = createSSRApp({ render: () => h(Comp) })
  app.component('NuxtLink', NuxtLink)
  // Vne Nuxt avtoimporty ne yavlyayutsya bindingami setup, i shablon obrashchaetsya
  // k nim cherez _ctx. Kladyom te zhe samye moduli v globalProperties.
  Object.assign(app.config.globalProperties, globals)
  return (await renderToString(app)).replace(/ /g, ' ')
}

let failed = 0
function must(name, cond) {
  if (!cond) failed++
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}`)
}

// 1. Поддоны + 20 км → лёгкий класс, пропуск не нужен
let html = await renderWith('poddony-i-meshki', 20)
must('поддоны/20 км: подобрана ИНМАН ИТ-80', html.includes('ИНМАН ИТ-80'))
must('поддоны/20 км: пропуск НЕ нужен, масса 8,18 т', html.includes('не нужен: полная масса 8,18 т'))
must('поддоны/20 км: итог «от 9 700 ₽»', html.includes('от 9 700 ₽'))
must('поддоны/20 км: подсвечена строка 20 км', html.includes('ближайшего плеча (20 км)'))
must('поддоны/20 км: подсвечена строка в разметке', /<tr class="is-row"><th scope="row">20 км/.test(html))
must('поддоны/20 км: кнопка ведёт на свой груз', html.includes('href="/gruzy/poddony-i-meshki/"'))
must('поддоны/20 км: подсвечена клетка пересечения', html.includes('is-col is-hit'))

// 2. Контейнер + 78 км → тяжёлый класс, пропуск нужен
html = await renderWith('konteyner', 78)
must('контейнер/78 км: подобран Kanglim KS1256G-II', html.includes('Kanglim KS1256G-II'))
must('контейнер/78 км: пропуск нужен, масса 24,8 т', html.includes('нужен: полная масса 24,8 т'))
must('контейнер/78 км: итог «от 22 080 ₽»', html.includes('от 22 080 ₽'))
must('контейнер/78 км: строка подсветки — 80 км', html.includes('ближайшего плеча (80 км)'))
must('контейнер/78 км: формула развёрнута', html.includes('13 500 ₽ за смену + 78 км × 55 ₽ × 2 = 8 580 ₽'))
must('контейнер/78 км: есть ссылка на статью о пропуске', html.includes('/blog/propusk-mkad-ttk-gruzovik/'))

// 3. Мусорный ввод: отрицательное плечо
html = await renderWith('srub-i-brus', -50)
must('минус 50 км: плечо нормализовано в 0', html.includes('0 км × 55 ₽ × 2 = 0 ₽'))
must('минус 50 км: итог равен ставке класса бруса 13 500 ₽', html.includes('от 13 500 ₽'))
must('минус 50 км: подсветка на строке 0 км', html.includes('ближайшего плеча (0 км)'))

// 4. Запредельный ввод
html = await renderWith('bytovka-i-vagonchik', 9999)
must('9999 км: обрезано до 300 км', html.includes('300 км × 55 ₽ × 2 = 33 000 ₽'))
must('9999 км: итог «от 46 500 ₽»', html.includes('от 46 500 ₽'))

// 5. Дробный ввод
html = await renderWith('spectehnika-malaya', 12.7)
must('12,7 км: округление до 13 км', html.includes('13 км × 55 ₽ × 2 = 1 430 ₽'))
must('12,7 км: подсветка на строке 15 км', html.includes('ближайшего плеча (15 км)'))

// 6. Полнота интерфейса
html = await renderWith('zhbi-i-plity', 30)
must('в списке грузов все шесть позиций', CARGO.every((c) => html.includes(c.name)))
must('в списке точек все города всех направлений', DIRECTIONS.every((d) => d.towns.every((t) => html.includes(`${t.name} — ${t.km} км от МКАД`))))
must('в шапке таблицы все четыре класса', FLEET.every((f) => html.includes(f.cls)))
must('в таблице все одиннадцать строк плеча', ['0 км', '5 км', '10 км', '15 км', '20 км', '30 км', '40 км', '50 км', '60 км', '80 км', '100 км'].every((b) => html.includes(`>${b}<`)))
must('нет ни одного класса визарда', !html.includes('calc__progress') && !html.includes('calc__step'))
must('таблица в прокручиваемом контейнере', html.includes('cfg__tablewrap'))
must('у всех трёх полей есть <label for>', (html.match(/<label for="cfg-/g) || []).length === 3)
must('живая область объявлена role="status"', html.includes('role="status"'))
must('заголовок h1 внутри инструмента', /<h1 id="cfg-title"/.test(html))

fs.rmSync(tmp, { recursive: true, force: true })
console.log(failed === 0 ? '\nРЕНДЕР-ПРОВЕРКИ ПРОЙДЕНЫ' : `\nПРОВАЛЕНО: ${failed}`)
process.exit(failed === 0 ? 0 : 1)
