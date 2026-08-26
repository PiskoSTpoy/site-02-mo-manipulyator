<script setup lang="ts">
// Сравнительная таблица парка вместо четырёх карточек-страниц.
//
// Почему таблица: у манипулятора решение принимается сравнением, а не чтением
// четырёх отдельных описаний подряд. Главный вывод виден только рядом:
// самая мощная КМУ в таблице (22,4 т·м) имеет ПОЧТИ САМЫЙ КОРОТКИЙ вылет — 8 м,
// а вдвое более слабая по моменту (15 т·м) достаёт на 18,7 м. Сортировка по вылету
// показывает это одним кликом; четыре карточки не показывали никогда.
import { computed, ref } from 'vue'

type SortKey = 'reachM' | 'momentTm' | 'bodyLm' | 'gvwT' | 'priceFrom'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const sortKey = ref<SortKey>('reachM')
const desc = ref(true)

const COLS: Array<{ key: SortKey; label: string; hint: string }> = [
  { key: 'reachM', label: 'Вылет стрелы', hint: 'как далеко от машины кладём груз' },
  { key: 'momentTm', label: 'Грузовой момент', hint: 'масса × вылет, т·м' },
  { key: 'bodyLm', label: 'Длина борта', hint: 'что влезет в кузов целиком' },
  { key: 'gvwT', label: 'Полная масса', hint: 'выше 12 т — нужен пропуск на МКАД' },
  { key: 'priceFrom', label: 'Цена', hint: 'наша ставка, от, за смену' },
]

const rows = computed(() => {
  const copy = [...FLEET]
  copy.sort((a, b) => (desc.value ? b[sortKey.value] - a[sortKey.value] : a[sortKey.value] - b[sortKey.value]))
  return copy
})

function toggle(key: SortKey) {
  if (sortKey.value === key) desc.value = !desc.value
  else {
    sortKey.value = key
    desc.value = true
  }
}
function ariaSort(key: SortKey) {
  if (sortKey.value !== key) return 'none'
  return desc.value ? 'descending' : 'ascending'
}

/** id подписи для aria-labelledby. Компактная и полная таблицы живут на разных
 *  страницах, но id всё равно разведены — на случай, если однажды встанут рядом. */
const capId = computed(() => (props.compact ? 'fleet-cap-compact' : 'fleet-cap-full'))
</script>

<template>
  <div class="fleet">
    <!-- Волна мобильной приёмки (26.08.2026). Подпись вынесена из .fleet__wrap:
         <caption> получал ширину таблицы (min-width 760px) внутри контейнера
         с overflow-x, и на 375px его резало по правому краю — на кадре читалось
         «Характеристики — из паспортных таблиц по ка▮». Доступное имя таблицы
         сохранено через aria-labelledby на тот же текст. -->
    <p :id="capId" class="fleet__cap">
      Характеристики — из паспортных таблиц по каждой машине, цена — наша собственная
      ставка (не из паспорта).
      <template v-if="!props.compact">Ссылка на источник — в последней колонке.</template>
      <template v-else>Полная версия с грузоподъёмностью на вылете и ссылками на паспорта — на странице парка.</template>
      Кнопки сортируют таблицу; по умолчанию — по вылету, от большего.
    </p>
    <div class="fleet__wrap">
      <!-- role-* проставлены явно и не дублируют лишнего: ниже 760px внутренности
           таблицы переключаются на display:block (строка становится карточкой),
           а это снимает у браузера родные табличные роли. С ролями строка
           по-прежнему объявляется строкой, а заголовок столбца — заголовком. -->
      <table class="fleet__table" role="table" :aria-labelledby="capId">
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader" class="fleet__th-plain">Машина</th>
            <th
              v-for="c in COLS"
              :key="c.key"
              scope="col"
              role="columnheader"
              :aria-sort="ariaSort(c.key)"
            >
              <button type="button" class="fleet__sort" @click="toggle(c.key)">
                <span>{{ c.label }}</span>
                <span class="fleet__arrow" aria-hidden="true">{{ sortKey === c.key ? (desc ? '↓' : '↑') : '↕' }}</span>
              </button>
              <span class="fleet__hint">{{ c.hint }}</span>
            </th>
            <th v-if="!props.compact" scope="col" role="columnheader" class="fleet__th-plain">Грузоподъёмность на вылете</th>
            <th v-if="!props.compact" scope="col" role="columnheader" class="fleet__th-plain">Источник</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <tr v-for="f in rows" :key="f.id" role="row">
            <th scope="row" role="rowheader">
              <b>{{ f.kmu }}</b>
              <span class="fleet__sub">{{ f.chassis }} · класс {{ f.cls }}</span>
            </th>
            <td role="cell" data-label="Вылет">{{ f.reach }}</td>
            <td role="cell" data-label="Момент">{{ f.momentTm.toLocaleString('ru-RU') }} т·м</td>
            <td role="cell" data-label="Борт">
              {{ f.bodyL }} × {{ f.bodyW }}
              <span class="fleet__sub">на борт: {{ f.bodyLoad }}</span>
            </td>
            <td role="cell" data-label="Масса">
              {{ f.gvwT.toLocaleString('ru-RU') }} т
              <span class="fleet__sub">{{ f.gvwT > MKAD_PASS_GVW_T ? 'пропуск на МКАД нужен' : 'пропуск не нужен' }}</span>
            </td>
            <td role="cell" data-label="Цена" class="fleet__price">
              от {{ f.priceFrom.toLocaleString('ru-RU') }} ₽/смена
              <span class="fleet__sub">≈ {{ Math.round(f.priceFrom / 8).toLocaleString('ru-RU') }} ₽/ч, смена 8 ч</span>
            </td>
            <td v-if="!props.compact" role="cell" data-label="На вылете">
              {{ f.capMin }}
              <span class="fleet__sub">{{ f.capMax }}</span>
            </td>
            <td v-if="!props.compact" role="cell" data-label="Источник" class="fleet__src">
              <a :href="f.src.href" target="_blank" rel="noopener">{{ f.src.label }}</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul v-if="!props.compact" class="fleet__notes">
      <li v-for="f in FLEET.filter((x) => x.note)" :key="`n-${f.id}`">
        <b>{{ f.kmu }}.</b> {{ f.note }}
      </li>
    </ul>

    <!-- Волна приёмки (26.08.2026). Колонка «Цена» — это цифра со сроком годности,
         и рядом с ней должно стоять, к какой редакции прайса она относится и что
         это не публичная оферта (ст. 437 ГК РФ). В компактной версии таблицы
         оговорки нет намеренно: там же, на главной, она уже стоит под тарифной
         таблицей конфигуратора, и дублировать её в двух блоках одной страницы —
         шум, а не осторожность. -->
    <p v-if="!props.compact" class="fleet__oferta">
      Колонка «Цена» приведена в редакции от
      <time datetime="2026-08-26">26 августа 2026 года</time> и не является публичной офертой:
      итоговая сумма зависит от груза, плеча от МКАД и режима доступа на объект. Паспортные
      колонки — из источников в последней колонке, цена — наша собственная.
    </p>
  </div>
</template>

<style scoped>
.fleet__cap { margin: 0 0 12px; font-size: var(--fs-xs); color: var(--muted); max-width: 78ch; }
.fleet__wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: var(--r-sm); }
.fleet__table { border-collapse: collapse; width: 100%; min-width: 760px; font-size: var(--fs-sm); font-variant-numeric: tabular-nums; }
.fleet__table th,
.fleet__table td { border-bottom: 1px solid var(--line); padding: 12px; text-align: left; vertical-align: top; }
.fleet__table thead th { background: var(--accent-soft); font-family: var(--sans); font-size: var(--fs-2xs); font-weight: 700; letter-spacing: .03em; vertical-align: bottom; }
.fleet__table thead th:first-child { border-top-left-radius: var(--r-sm); }
.fleet__table thead th:last-child { border-top-right-radius: var(--r-sm); }
.fleet__table th[scope='row'] { font-family: var(--sans); font-weight: 400; }
.fleet__table th[scope='row'] b { font-weight: 700; }
/* Волна 19: подсветка строки при наведении — та же bento-манера, что у .card:hover,
   перенесённая в табличный формат (park теперь таблица, а не карточки — см. Волна 16). */
.fleet__table tbody tr { transition: background-color .15s ease; }
.fleet__table tbody tr:hover { background: #F1F7F3; }
.fleet__table tbody tr:hover th[scope='row'] b { color: var(--accent-ink); }
.fleet__sub { display: block; margin-top: 3px; color: var(--muted); font-size: var(--fs-xs); font-weight: 400; }
.fleet__sort {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0;
  background: none;
  border: none;
  font: inherit;
  font-weight: 700;
  color: var(--accent-ink);
  cursor: pointer;
  text-align: left;
}
.fleet__sort { border-radius: 6px; transition: color .15s ease; }
.fleet__sort:hover { text-decoration: underline; color: var(--ink); }
.fleet__sort:active { color: var(--accent); }
/* .9em оставляло на сайте отдельную 11-пиксельную ступень ради пяти стрелок
   сортировки — двадцать восьмой кегль в лестнице из семи. Стрелка живёт
   кеглем кнопки. */
.fleet__arrow { opacity: .75; }
.fleet__hint { display: block; margin-top: 4px; font-weight: 400; color: var(--muted); font-size: var(--fs-2xs); line-height: 1.3; max-width: 18ch; text-transform: none; letter-spacing: 0; }
.fleet__src a { color: var(--accent-ink); font-size: var(--fs-xs); }
.fleet__notes { margin: 18px 0 0; padding-left: 20px; font-size: var(--fs-sm); color: var(--muted); max-width: 80ch; }
.fleet__notes li + li { margin-top: 8px; }
.fleet__oferta { margin-top: 14px; font-size: var(--fs-xs); color: var(--muted); max-width: 80ch; }
.fleet__oferta time { font-variant-numeric: tabular-nums; }

/* ─── Телефон: строка становится карточкой ────────────────────────────────────
   Волна мобильной приёмки (26.08.2026). Найдено на кадрах 375×812, замерами
   не ловилось: таблица в семь колонок при min-width 760px жила в горизонтальной
   прокрутке, и на экране телефона от неё оставались две с половиной колонки.
   Колонка «Цена» — то, ради чего страницу парка вообще открывают, — не попадала
   в кадр вовсе: до неё надо было доскроллить вбок, о чём ничто не сообщало.
   Хуже того, строки распирало по высоте содержимым НЕВИДИМЫХ колонок (длинная
   подпись источника), и между двумя машинами зияло по 150px пустоты.
   Ниже 760px строка разворачивается в карточку: название машины — шапкой,
   остальные ячейки — парами «показатель → значение». Ни одна цифра не потеряна,
   горизонтальной прокрутки нет, цена читается на месте.
   Шапка не исчезает, а превращается в ряд кнопок сортировки — иначе на телефоне
   таблица потеряла бы единственное, что делает её таблицей, а не списком. */
@media (max-width: 760px) {
  .fleet__wrap { overflow-x: visible; }
  .fleet__table { display: block; min-width: 0; }

  .fleet__table thead { display: block; margin-bottom: 14px; }
  .fleet__table thead tr { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .fleet__table thead tr::before {
    content: 'Сортировать:';
    flex: 0 0 100%;
    font-size: var(--fs-2xs);
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .fleet__table thead th { display: block; padding: 0; border: none; background: none; }
  /* Колонки, которые не сортируются, в ряду кнопок были бы просто словами. */
  .fleet__table thead th.fleet__th-plain { display: none; }
  .fleet__hint { display: none; }
  .fleet__sort {
    min-height: 40px;
    padding: 0 14px;
    background: var(--accent-soft);
    border: 1px solid var(--accent-line);
    border-radius: var(--r-pill);
    font-size: var(--fs-2xs);
    letter-spacing: .02em;
  }
  .fleet__sort:hover { text-decoration: none; background: #D8EADD; }

  .fleet__table tbody { display: block; }
  /* Инсет, а не белая карточка: обе панели, в которых живёт таблица
     (.fleet-panel и .park-panel), сами белые — белая карточка на белой панели
     держалась бы на одном волосяном бордере. #F4F8F5 — та же поверхность,
     что у полей конфигуратора и списка фактов в карточке груза. */
  .fleet__table tbody tr {
    display: block;
    background: #F4F8F5;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    padding: 14px 16px;
  }
  .fleet__table tbody tr + tr { margin-top: 12px; }
  .fleet__table tbody tr:hover { background: #F4F8F5; }
  .fleet__table tbody th,
  .fleet__table tbody td { display: block; border: none; padding: 0; }
  .fleet__table tbody th[scope='row'] {
    padding-bottom: 11px;
    margin-bottom: 4px;
    border-bottom: 1px solid var(--line);
    font-size: var(--fs-md);
  }
  .fleet__table tbody td {
    display: grid;
    grid-template-columns: 10ch minmax(0, 1fr);
    gap: 12px;
    padding-block: 9px;
    align-items: baseline;
    border-top: 1px solid #E3EBE6;
  }
  .fleet__table tbody td:first-of-type { border-top: none; }
  /* Уточнение под значением («пропуск на МКАД нужен», «≈ 1 688 ₽/ч») — третий
     элемент сетки после подписи и самого значения, и без явной колонки он
     переносился ПОД подпись, в левый столбец: на кадре читалось «МАССА /
     пропуск на МКАД нужен», как будто это и есть значение массы. */
  .fleet__table tbody td .fleet__sub { grid-column: 2; margin-top: 2px; }
  .fleet__table tbody td::before {
    content: attr(data-label);
    font-size: var(--fs-2xs);
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--accent-ink);
  }
  /* Цена — единственная строка карточки, которая должна читаться первой
     после названия машины, поэтому набрана тем же голосом, что итог
     конфигуратора: заголовочная гарнитура и цвет акцента. */
  .fleet__price { font-family: var(--display); font-weight: 700; color: var(--accent-ink); }
  .fleet__price .fleet__sub { font-family: var(--sans); font-weight: 400; }
  .fleet__src a { word-break: break-word; }
}
</style>
