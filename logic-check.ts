// Проверка вычислительной части конфигуратора и таблицы парка на реальных данных
// сайта (импортируются те же модули, что использует Nuxt, — не копии).
import { FLEET, SHIFT_RATE, KM_RATE, MKAD_PASS_GVW_T, TARIFF_BANDS_KM } from './app/utils/fleet.ts'
import { CARGO, cargoBySlug } from './app/utils/cargo.ts'
import { DIRECTIONS, kmSurcharge, directionBySlug } from './app/utils/directions.ts'

let failed = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failed++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}: получили ${JSON.stringify(actual)}${ok ? '' : `, ожидали ${JSON.stringify(expected)}`}`)
}

// --- та же логика, что в AppCargoConfigurator.vue (BANDS — тот же массив,
// TARIFF_BANDS_KM из fleet.ts, а не отдельная копия: иначе проверка могла бы
// молча разойтись с реальной таблицей, если кто-то поправит одно и забудет другое) ---
const BANDS = TARIFF_BANDS_KM
function machineFor(slug: string) {
  const c = cargoBySlug(slug)!
  return FLEET.find((f) => f.cls === c.startClass)!
}
function total(slug: string, km: number) {
  return (SHIFT_RATE[machineFor(slug).cls] ?? 0) + kmSurcharge(km)
}
function activeBand(km: number) {
  let best = BANDS[0]!
  for (const b of BANDS) if (Math.abs(b - km) < Math.abs(best - km)) best = b
  return best
}

console.log('--- тариф ---')
check('тариф за км', KM_RATE, 55)
check('плечо 30 км в обе стороны', kmSurcharge(30), 3300)
check('плечо 0 км', kmSurcharge(0), 0)
check('плечо 78 км (Орехово-Зуево)', kmSurcharge(78), 8580)
check('плечо 1 км (Мытищи)', kmSurcharge(1), 110)

console.log('--- контрольная цифра из Волны 11: 5–10 т + 30 км = 16 800 ₽ ---')
check('ЖБИ (класс 5–10 т) + 30 км', total('zhbi-i-plity', 30), 16800)

console.log('--- подбор машины по грузу ---')
check('поддоны → лёгкий класс', machineFor('poddony-i-meshki').kmu, 'ИНМАН ИТ-80')
check('малая спецтехника → средний класс', machineFor('spectehnika-malaya').kmu, 'Soosan SCS334')
// Инвариант, ради которого существует раздел /gruzy/: груз, у которого САМА единица
// длиннее шести метров, не помещается на двухосный борт и обязан стартовать
// с трёхосной машины. Список задан слагами, а не регуляркой по прозе: первая версия
// проверки ловила «4,3–6,6 м» в описании габарита БОРТА малой спецтехники и падала
// на ложном срабатывании — ошибка была в проверке, а не в данных.
const SIX_METER_CARGO = ['srub-i-brus', 'zhbi-i-plity', 'bytovka-i-vagonchik', 'konteyner']
check('груз длиннее 6 м стартует с трёхосной машины', SIX_METER_CARGO.every((s) => machineFor(s).axles === 3), true)
check('короткий груз НЕ загоняется в трёхосную машину зря', ['poddony-i-meshki', 'spectehnika-malaya'].every((s) => machineFor(s).axles === 2), true)
// Брус — 5–10 т, а не средний класс: борт 4,505 м короче шестиметрового бруса.
check('брус → тяжёлый класс (длина, а не масса)', machineFor('srub-i-brus').kmu, 'Kanglim KS1256G-II')
check('ЖБИ → тяжёлый класс', machineFor('zhbi-i-plity').kmu, 'Kanglim KS1256G-II')
check('контейнер → тяжёлый класс', machineFor('konteyner').kmu, 'Kanglim KS1256G-II')
check('у каждого груза есть машина', CARGO.every((c) => FLEET.some((f) => f.cls === c.startClass)), true)
check('у каждой машины есть ставка', FLEET.every((f) => typeof SHIFT_RATE[f.cls] === 'number'), true)

console.log('--- порог пропуска МКАД ---')
check('двухосные ниже порога 12 т', FLEET.filter((f) => f.axles === 2).every((f) => f.gvwT < MKAD_PASS_GVW_T), true)
check('трёхосные выше порога 12 т', FLEET.filter((f) => f.axles === 3).every((f) => f.gvwT > MKAD_PASS_GVW_T), true)

console.log('--- подсветка строки таблицы ---')
check('30 км → строка 30', activeBand(30), 30)
check('37 км (Ногинск) → строка 40', activeBand(37), 40)
check('1 км (Мытищи) → строка 0', activeBand(1), 0)
check('94 км (Волоколамск) → строка 100', activeBand(94), 100)
check('73 км (Серпухов) → строка 80', activeBand(73), 80)

console.log('--- цены направлений, которые напечатаны в тексте страниц ---')
check('Истра 35 км, средний класс = 13 350', SHIFT_RATE['3–5 т']! + kmSurcharge(35), 13350)
check('Чехов 50 км, тяжёлый класс = 19 000', SHIFT_RATE['5–10 т']! + kmSurcharge(50), 19000)
check('Сергиев Посад 60 км, средний = 16 100', SHIFT_RATE['3–5 т']! + kmSurcharge(60), 16100)
check('Орехово-Зуево 78 км, лёгкий = 16 080', SHIFT_RATE['до 3 т']! + kmSurcharge(78), 16080)
check('Орехово-Зуево 78 км, сверхтяжёлый = 26 580', SHIFT_RATE['10–20 т']! + kmSurcharge(78), 26580)
check('Ногинск 37 км, лёгкий = 11 570', SHIFT_RATE['до 3 т']! + kmSurcharge(37), 11570)
check('Ногинск 37 км, сверхтяжёлый = 22 070', SHIFT_RATE['10–20 т']! + kmSurcharge(37), 22070)
check('Истра 35 км, тяжёлый = 17 350', SHIFT_RATE['5–10 т']! + kmSurcharge(35), 17350)
check('20 км лёгкий = 9 700', SHIFT_RATE['до 3 т']! + kmSurcharge(20), 9700)
check('20 км сверхтяжёлый = 20 200', SHIFT_RATE['10–20 т']! + kmSurcharge(20), 20200)
check('5 км средний = 10 050', SHIFT_RATE['3–5 т']! + kmSurcharge(5), 10050)
check('Ступино 88 км, средний = 19 180', SHIFT_RATE['3–5 т']! + kmSurcharge(88), 19180)
check('Домодедово 15 км, лёгкий = 9 150', SHIFT_RATE['до 3 т']! + kmSurcharge(15), 9150)

console.log('--- сортировка таблицы парка по вылету (по убыванию) ---')
const byReach = [...FLEET].sort((a, b) => b.reachM - a.reachM).map((f) => f.kmu)
check('порядок по вылету', byReach, ['Kanglim KS1256G-II', 'Soosan SCS334', 'Palfinger PK 23500A', 'ИНМАН ИТ-80'])
const byMoment = [...FLEET].sort((a, b) => b.momentTm - a.momentTm).map((f) => f.kmu)
check('порядок по моменту', byMoment, ['Palfinger PK 23500A', 'Kanglim KS1256G-II', 'ИНМАН ИТ-80', 'Soosan SCS334'])
check('самая мощная НЕ самая длиннорукая (тезис сайта)', byMoment[0] !== byReach[0], true)

console.log('--- целостность справочников ---')
check('направлений 6', DIRECTIONS.length, 6)
check('грузов 6', CARGO.length, 6)
check('машин 4', FLEET.length, 4)
check('плеч тарифной таблицы 11', TARIFF_BANDS_KM.length, 11)
check('все города имеют км > 0 или = 1..94', DIRECTIONS.every((d) => d.towns.every((t) => t.km >= 0 && t.km <= 120)), true)
check('directionBySlug работает', directionBySlug('gorkovskoe')!.road, 'М-7 «Волга»')
check('пятое направление добавлено корректно', directionBySlug('kashirskoe')!.road, 'М-4 «Дон»')
check('шестое направление добавлено корректно', directionBySlug('leningradskoe')!.road, 'М-10 «Россия»')
check('Есипово (Солнечногорск 50 км), средний класс = 15 000', SHIFT_RATE['3–5 т']! + kmSurcharge(50), 15000)
check('Химки 3 км, лёгкий класс = 7 830', SHIFT_RATE['до 3 т']! + kmSurcharge(3), 7830)
check('Клин 66 км, тяжёлый класс = 20 760', SHIFT_RATE['5–10 т']! + kmSurcharge(66), 20760)
check('у каждой машины есть ссылка-источник', FLEET.every((f) => f.src.href.startsWith('https://')), true)

console.log('--- цена в таблице парка (Волна 33) ---')
// priceFrom не задублирован вручную — обязан ссылаться на тот же SHIFT_RATE[cls],
// иначе цена парка и цена калькулятора могут разъехаться так же, как разъехались
// ТТХ в Волне 15.
check('priceFrom = SHIFT_RATE[cls] на каждой строке', FLEET.every((f) => f.priceFrom === SHIFT_RATE[f.cls]), true)
const byPrice = [...FLEET].sort((a, b) => b.priceFrom - a.priceFrom).map((f) => f.kmu)
check('порядок по цене (по убыванию)', byPrice, ['Palfinger PK 23500A', 'Kanglim KS1256G-II', 'Soosan SCS334', 'ИНМАН ИТ-80'])

console.log(failed === 0 ? '\nВСЕ ПРОВЕРКИ ПРОЙДЕНЫ' : `\nПРОВАЛЕНО: ${failed}`)
process.exit(failed === 0 ? 0 : 1)
