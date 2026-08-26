<script setup lang="ts">
// Грузовой конфигуратор — главный (и первый) экран сайта.
//
// Чем он отличается от прежнего калькулятора-визарда (Волны 1–15):
//   • визарда нет вовсе. Ни шагов, ни прогресса, ни переходов: все входы и вся
//     тарифная таблица видны одновременно, с первого кадра, без единого клика.
//     Прежний визард прятал цену за три экрана — ровно то, за что этот сайт ругает
//     конкурентов с ценой «от 7 500» без километража.
//   • вход — груз, а не «класс техники». Заказчик знает, что он везёт; какой
//     нужен класс — это ВЫВОД конфигуратора, а не вопрос к заказчику.
//   • адрес вводится как точка на шоссе (направление → город) либо километрами
//     напрямую. Обе формы правят одно и то же число.
//
// Математика не менялась с Волны 1 и совпадает с формулой на всех страницах:
//   итог = ставка за смену по классу + км от МКАД × 55 ₽ × 2 (туда и обратно).
import { computed, ref } from 'vue'

/** Ряды тарифной таблицы: плечо от МКАД в одну сторону, км.
 *  Источник вынесен в utils/fleet.ts (TARIFF_BANDS_KM) — это тот же массив,
 *  который читают logic-check.ts, render-check.mjs и честная плашка метрик
 *  на главной, чтобы число строк таблицы не могло разъехаться по файлам. */
const BANDS = TARIFF_BANDS_KM

const cargoSlug = ref(CARGO[1]!.slug) // ЖБИ и плиты — самый показательный груз
const km = ref(30)

const cargo = computed(() => cargoBySlug(cargoSlug.value) ?? CARGO[0]!)
const machine = computed(() => FLEET.find((f) => f.cls === cargo.value.startClass) ?? FLEET[0]!)
const rate = computed(() => SHIFT_RATE[machine.value.cls] ?? 0)

const kmClean = computed(() => {
  const n = Number(km.value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(300, Math.round(n))
})
const surcharge = computed(() => kmSurcharge(kmClean.value))
const total = computed(() => rate.value + surcharge.value)
const needsPass = computed(() => machine.value.gvwT > MKAD_PASS_GVW_T)

/** Ряд таблицы, ближайший к введённому плечу, — он и подсвечивается. */
const activeBand = computed(() => {
  let best = BANDS[0]!
  for (const b of BANDS) {
    if (Math.abs(b - kmClean.value) < Math.abs(best - kmClean.value)) best = b
  }
  return best
})

function cell(cls: string, band: number): number {
  return (SHIFT_RATE[cls] ?? 0) + kmSurcharge(band)
}
function money(n: number): string {
  return n.toLocaleString('ru-RU')
}

/** Выбор города из списка направлений подставляет плечо в километрах. */
const townKey = ref('')
function onTownPick(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  townKey.value = value
  if (!value) return
  const parsed = Number(value.split('|')[1])
  if (Number.isFinite(parsed)) km.value = parsed
}
/** Ручная правка километров означает, что город больше не выбран. */
function onKmInput() {
  townKey.value = ''
}
</script>

<template>
  <section id="konfigurator" class="cfg" aria-labelledby="cfg-title">
    <h1 id="cfg-title" class="cfg__title">
      Манипулятор по Московской области: подбор машины по грузу и открытый прайс за километр
    </h1>

    <div class="cfg__grid">
      <!-- ── ВХОД ─────────────────────────────────────────────── -->
      <div class="cfg__inputs">
        <div class="cfg__field">
          <label for="cfg-cargo">Что везём</label>
          <select id="cfg-cargo" v-model="cargoSlug">
            <option v-for="c in CARGO" :key="c.slug" :value="c.slug">{{ c.name }} — {{ c.tagline }}</option>
          </select>
        </div>

        <div class="cfg__field">
          <label for="cfg-town">Куда везём</label>
          <select id="cfg-town" :value="townKey" @change="onTownPick">
            <option value="">— выберите точку или введите километры —</option>
            <optgroup v-for="d in DIRECTIONS" :key="d.slug" :label="`${d.name} шоссе (${d.road})`">
              <option v-for="t in d.towns" :key="`${d.slug}-${t.name}`" :value="`${d.slug}|${t.km}`">
                {{ t.name }} — {{ t.km }} км от МКАД
              </option>
            </optgroup>
          </select>
        </div>

        <div class="cfg__field">
          <label for="cfg-km">Плечо от МКАД в одну сторону, км</label>
          <input
            id="cfg-km"
            v-model.number="km"
            type="number"
            inputmode="numeric"
            min="0"
            max="300"
            step="1"
            aria-describedby="cfg-km-hint"
            @input="onKmInput"
          />
          <span id="cfg-km-hint" class="cfg__hint">
            Внутри МКАД — 0. Свыше 300 км за пределы области рейс не считаем.
          </span>
        </div>
      </div>

      <!-- ── ВЫВОД ────────────────────────────────────────────── -->
      <div class="cfg__out" role="status">
        <p class="cfg__out-line">
          <span class="cfg__out-key">Груз</span>
          <span class="cfg__out-val">{{ cargo.name }} · {{ cargo.unitMass }}</span>
        </p>
        <p class="cfg__out-line">
          <span class="cfg__out-key">Отсекает</span>
          <span class="cfg__out-val">{{ cargo.limiter }}</span>
        </p>
        <p class="cfg__out-line">
          <span class="cfg__out-key">Машина</span>
          <span class="cfg__out-val">
            <b>{{ machine.kmu }}</b> на {{ machine.chassis }} · класс {{ machine.cls }} ·
            борт {{ machine.bodyL }} × {{ machine.bodyW }} · вылет {{ machine.reach }}
          </span>
        </p>
        <p class="cfg__out-line">
          <span class="cfg__out-key">Пропуск</span>
          <span class="cfg__out-val">
            <template v-if="needsPass">
              нужен: полная масса {{ machine.gvwT.toLocaleString('ru-RU') }} т выше порога 12 т для въезда на МКАД
              с 06:00 до 22:00. Оформляем сами, бесплатно —
              <NuxtLink to="/blog/propusk-mkad-ttk-gruzovik/">как это устроено</NuxtLink>.
            </template>
            <template v-else>
              не нужен: полная масса {{ machine.gvwT.toLocaleString('ru-RU') }} т ниже порога 12 т.
            </template>
          </span>
        </p>
        <p class="cfg__sum">
          <span class="cfg__sum-formula">
            {{ money(rate) }} ₽ за смену + {{ kmClean }} км × 55 ₽ × 2 = {{ money(surcharge) }} ₽
          </span>
          <b class="cfg__sum-total">от {{ money(total) }} ₽</b>
        </p>
        <div class="cfg__actions">
          <NuxtLink class="btn" :to="`/gruzy/${cargo.slug}/`">Что важно по этому грузу →</NuxtLink>
          <a class="cfg__link" href="/#order">Отправить заявку с этим расчётом</a>
        </div>
      </div>
    </div>

    <!-- ── ОТКРЫТАЯ ТАРИФНАЯ ТАБЛИЦА ────────────────────────── -->
    <!-- Волна мобильной приёмки (26.08.2026). Подпись таблицы вынесена ИЗ
         .cfg__tablewrap. Причина видна только на кадре: <caption> получает ширину
         таблицы, а у таблицы min-width 560px внутри контейнера с overflow-x —
         на 375px подпись обрезало по правому краю прямо посреди слова
         («Подсвечена строка ближайш…»), и человек читал оборванную фразу.
         Ни один линтер этого не ловит: в разметке текст на месте, режет отрисовка.
         Семантика сохранена: то, что давал <caption>, теперь даёт
         aria-labelledby на той же таблице — доступное имя то же самое, а текст
         живёт в потоке страницы и переносится по её ширине. -->
    <p id="cfg-tablecap" class="cfg__tablecap">
      Смена 8 часов, ₽. Подсвечена строка ближайшего плеча ({{ activeBand }} км) и колонка подобранного класса
      ({{ machine.cls }}). Ничего не скрыто: это вся цена рейса без пропуска и без «уточним по телефону».
    </p>
    <div class="cfg__tablewrap">
      <table class="cfg__table" aria-labelledby="cfg-tablecap">
        <thead>
          <tr>
            <th scope="col">Плечо от МКАД</th>
            <th
              v-for="f in FLEET"
              :key="f.id"
              scope="col"
              :class="{ 'is-col': f.cls === machine.cls }"
            >
              {{ f.cls }}<br /><span class="cfg__th-sub">{{ f.kmu }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in BANDS" :key="b" :class="{ 'is-row': b === activeBand }">
            <th scope="row">{{ b }} км</th>
            <td
              v-for="f in FLEET"
              :key="f.id"
              :class="{ 'is-col': f.cls === machine.cls, 'is-hit': f.cls === machine.cls && b === activeBand }"
            >
              {{ money(cell(f.cls, b)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="cfg__tablenote">
      В таблице нет ни одной цифры, которой нет в формуле: ставка смены по классу плюс километр от МКАД в обе
      стороны. Пропуск МКАД/ТТК в цену не заложен — он бесплатный, и брать за него деньги не за что.
      Что в смену не входит — <a href="#ne-vhodit">отдельным списком ниже</a>.
    </p>
    <!-- Волна приёмки (26.08.2026). Оговорка про оферту с датой редакции прайса.
         Нужна не для галочки: цена на странице с конкретной цифрой и кнопкой
         «заказать» по ст. 437 ГК РФ может быть прочитана как публичная оферта,
         а тариф пересматривается. Дата — машиночитаемая в <time datetime>,
         чтобы было видно, к какой редакции прайса относится цифра. -->
    <p class="cfg__oferta">
      Прайс действует в редакции от <time datetime="2026-08-26">26 августа 2026 года</time> и
      не является публичной офертой: итог зависит от фактического груза, адреса и режима
      доступа на объект. Точная сумма называется при согласовании заявки — до выезда, а не
      по факту.
    </p>
  </section>
</template>

<style scoped>
.cfg {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow);
  padding: clamp(20px, 3vw, 38px);
  margin-block: clamp(20px, 3vw, 34px) 0;
}
.cfg__title {
  /* Волна визуальной приёмки. Было два дефекта разом: (1) единственный h1
     главной набирался ТЕКСТОВОЙ гарнитурой, то есть заголовочный голос сайта
     не звучал на первом экране вообще; (2) кегль clamp(1.15…1.5rem) = 25,5 px
     на десктопе — ровно столько же, сколько у соседнего h2, и на 32% меньше
     заголовков разделов ниже по странице. Теперь общая ступень --fs-h1
     (42,5 px) и --display, как у всех остальных заголовков сайта. */
  font-size: var(--fs-h1);
  font-family: var(--display);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -.018em;
  /* 22ch давали четыре строки по 72px — заголовок съедал полэкрана до полей.
     32ch ≈ три строки на десктопе и столько же на планшете. */
  max-width: 32ch;
}
.cfg__grid {
  display: grid;
  grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
  gap: clamp(18px, 3vw, 26px);
  margin-top: clamp(22px, 3vw, 32px);
  /* stretch, а не start: две плитки конфигуратора должны заканчиваться на одной
     линии. При start колонка ввода обрывалась на 150px выше мятного вывода,
     и правый нижний угол панели оставался пустым — самое заметное место
     первого экрана выглядело недоделанным. Поля внутри инсета всё равно
     прижаты к верху (align-content: start у .cfg__inputs). */
  align-items: stretch;
}
/* Колонка ввода получила собственную поверхность. До этой волны три поля висели
   прямо на белом фоне панели, и под ними до низа мятного блока вывода оставалось
   90–140px пустоты — колонка не читалась как колонка. Теперь это инсет (светлее
   мятного вывода, темнее белой панели): два вложенных блока разной температуры
   внутри одной плитки — то же, чем собрана вся страница. */
.cfg__inputs {
  display: grid;
  gap: 16px;
  min-width: 0;
  align-content: start;
  background: #F4F8F5;
  border-radius: var(--r-sm);
  padding: clamp(16px, 2vw, 20px);
}
.cfg__field { display: grid; gap: 7px; min-width: 0; }
.cfg__field label { font-size: var(--fs-2xs); font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--accent-ink); }
/* border: --field-line = 3.41:1 к белому (WCAG 1.4.11); min-height 44px — палец (2.5.8) */
.cfg__field select,
.cfg__field input {
  width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--field-line);
  border-radius: var(--r-sm);
  color: var(--ink);
  padding: 11px 14px;
  min-height: 46px;
  font-family: inherit;
  font-size: var(--fs-md);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.cfg__field select:hover,
.cfg__field input:hover { border-color: var(--accent); }
.cfg__field select:focus,
.cfg__field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(47, 122, 79, .12); }
/* Стрелка нативного <select> принадлежит операционной системе, а не сайту:
   на Windows это серый треугольник, на macOS — двойной шеврон в синей плашке.
   Своя нарисована тем же шевроном, что уже стоит в раскрывашках FAQ, поэтому
   выпадающий список и вопрос-ответ читаются одним набором.
   appearance:none снимает только оформление — сам выпадающий список остаётся
   нативным, с нативной клавиатурой и нативной прокруткой на телефоне.
   padding-right оставлен под стрелку, чтобы длинный пункт не заезжал под неё. */
.cfg__field select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 42px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2326633F' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
  background-size: 17px;
}
.cfg__hint { font-size: var(--fs-xs); color: var(--muted); }

.cfg__out {
  min-width: 0;
  background: var(--accent-soft);
  border-radius: var(--r-sm);
  padding: clamp(18px, 2.2vw, 26px);
  display: grid;
  gap: 10px;
  align-content: start;
}
.cfg__out-line { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 12px; font-size: var(--fs-sm); }
.cfg__out-key { font-size: var(--fs-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--accent-ink); padding-top: 2px; }
.cfg__out-val { color: var(--ink); }
/* --accent-ink на --accent-soft = 6.09:1 (WCAG 1.4.3 требует 4.5:1) */
.cfg__out-val a { color: var(--accent-ink); font-weight: 700; }
/* Итог отделён от разбора не пунктиром, а сплошной волосяной линией того же
   зелёного семейства: пунктир — это «вырежьте по линии», а здесь ничего не
   отрезают, здесь подводят черту под расчётом. */
.cfg__sum { border-top: 1px solid var(--accent-line); padding-top: 16px; margin-top: 8px; }
.cfg__sum-formula { display: block; font-size: var(--fs-xs); color: var(--accent-ink); font-variant-numeric: tabular-nums; }
/* Итоговая цена — самое крупное число сайта. У Jura широкие цифры (0,684em
   против 0,6em у Inter), поэтому «от 21 400 ₽» стало заметно длиннее при том же
   кегле: собираем обратно отрицательным трекингом и ставим tabular-nums, чтобы
   сумма не дёргалась по ширине при каждом пересчёте слайдера. */
.cfg__sum-total { display: block; font-family: var(--display); letter-spacing: -.02em; font-variant-numeric: tabular-nums; font-size: var(--fs-num); line-height: 1.05; color: var(--accent-ink); margin-top: 6px; }
.cfg__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 4px; }
.cfg__link { color: var(--accent-ink); font-weight: 700; font-size: var(--fs-sm); }

.cfg__tablecap { margin-top: clamp(22px, 3vw, 32px); font-size: var(--fs-xs); color: var(--muted); max-width: 78ch; }
.cfg__tablewrap { margin-top: 12px; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: var(--r-sm); }
.cfg__table { border-collapse: collapse; width: 100%; min-width: 560px; font-size: var(--fs-sm); font-variant-numeric: tabular-nums; }
.cfg__table th,
.cfg__table td { border-bottom: 1px solid var(--line); padding: 10px 13px; text-align: right; }
.cfg__table thead th { text-align: right; font-family: var(--sans); font-size: var(--fs-xs); font-weight: 700; vertical-align: bottom; background: #F4F8F5; }
.cfg__table thead th:first-child { border-top-left-radius: var(--r-sm); }
.cfg__table thead th:last-child { border-top-right-radius: var(--r-sm); }
/* Строка под курсором — та же манера, что у таблицы парка и таблиц направлений.
   :hover, а не только подсветка выбранного плеча: в сетке 11×5 глаз без опоры
   теряет строку между «40 км» и колонкой класса. */
.cfg__table tbody tr:not(.is-row):hover > * { background: #F4F8F5; }
.cfg__table th[scope='row'],
.cfg__table thead th:first-child { text-align: left; }
/* Было 500 — единственное место на всём сайте, где это начертание вообще
   встречалось. Одна строчка приглушённого подзаголовка таблицы стоила ещё
   47 КБ шрифтов на главной (кириллица + латиница Nunito Sans 500), при том что
   у Nunito Sans разница между 400 и 500 на кегле .72rem в сером цвете
   не читается. Оставлено 400. */
.cfg__th-sub { font-weight: 400; color: var(--muted); font-size: var(--fs-2xs); }
/* Подсветка — цвет ПЛЮС рамка и жирность: одним цветом состояние передавать нельзя (WCAG 1.4.1) */
.cfg__table tbody tr.is-row > * { background: var(--accent-soft); font-weight: 700; }
.cfg__table .is-col { background: rgba(227, 240, 231, .45); }
.cfg__table tbody tr.is-row .is-col { background: var(--accent-soft); }
.cfg__table .is-hit { outline: 2px solid var(--accent); outline-offset: -2px; color: var(--accent-ink); }
.cfg__tablenote { margin-top: 14px; font-size: var(--fs-xs); color: var(--muted); max-width: 78ch; }
.cfg__tablenote a { color: var(--accent-ink); font-weight: 600; }
.cfg__oferta { margin-top: 10px; font-size: var(--fs-xs); color: var(--muted); max-width: 78ch; }
.cfg__oferta time { font-variant-numeric: tabular-nums; }

@media (max-width: 900px) {
  .cfg__grid { grid-template-columns: 1fr; }
  .cfg__out-line { grid-template-columns: 1fr; gap: 2px; }
}
/* ─── Заголовок на телефоне ──────────────────────────────────────────────
   Волна мобильной приёмки (26.08.2026). Замерено на кадре 375×812: единственный
   h1 главной шёл ПЯТЬЮ строками по 26,74 px — блок высотой 158 px, то есть
   пятая часть экрана телефона на один заголовок, и первое поле конфигуратора
   отодвигалось на 1264-ю точку. Ступень --fs-h1 рассчитана на десктоп, где 32ch
   дают три строки; на 375px в те же 32ch помещается вдвое меньше.
   Кегль опущен до 22,1 px и снят потолок 32ch: блок заголовка 158 → 128 px,
   первое поле конфигуратора 1264 → 1210.
   ЧЕСТНО ПРО ОСТАТОК: строк по-прежнему пять. Заголовок — 85 символов, при
   ширине колонки 297 px в строку влезает 23 символа, и в четыре строки он не
   складывается ни при каком кегле выше --fs-lg (20,4 px), ниже которого
   заголовок страницы опускаться не должен. Убрать строку можно только укоротив
   фразу — то есть переписав текст, что этой волне запрещено. Записано как
   остаток: это задача редактуры, а не вёрстки. */
@media (max-width: 560px) {
  .cfg__title { font-size: 1.3rem; line-height: 1.16; max-width: none; }
}
</style>
