<script setup lang="ts">
// Плитка «класс и цена» для страниц грузов.
//
// Волна мобильной приёмки (26.08.2026). Замер на 375px показал, что на странице
// груза (/gruzy/zhbi-i-plity/ и остальных пяти) НЕ БЫЛО НИ ОДНОЙ цифры в рублях
// вообще — ни выше сгиба, ни ниже, на всю страницу 6280px. Человек приходит из
// поиска по запросу «манипулятор для плит», читает четыре экрана про ГОСТы и
// строповку и не узнаёт, сколько это стоит, пока не вернётся на главную.
//
// Ни одного нового числа здесь не появляется. Класс машины берётся из CARGO
// (поле startClass — то же, по которому подбирает конфигуратор), ставка — из
// SHIFT_RATE по этому классу, километр — из KM_RATE, модель — из FLEET по
// классу. Всё это тот же единственный источник, который читают конфигуратор,
// тарифная таблица и таблица парка: цифра на странице груза физически не может
// разойтись с цифрой на главной.
import { computed } from 'vue'

const props = defineProps<{ slug: string }>()

const cargo = computed(() => cargoBySlug(props.slug))
const machine = computed(() => FLEET.find((f) => f.cls === cargo.value?.startClass))
const rate = computed(() => (cargo.value ? SHIFT_RATE[cargo.value.startClass] ?? 0 : 0))
</script>

<template>
  <!-- Цена стоит в разметке ПЕРВОЙ, а не после списка фактов: на телефоне порядок
       разметки и есть порядок на экране, и с «отсекает» впереди цифра уезжала на
       пять строк ниже — за сгиб на 320px. На десктопе сетка возвращает её
       в правую колонку явным grid-column. -->
  <aside v-if="cargo && machine" class="cprice" aria-label="Класс машины и ставка под этот груз">
    <div class="cprice__money">
      <b class="cprice__num">{{ rate.toLocaleString('ru-RU') }} ₽</b>
      <span class="cprice__cap">смена 8 часов + {{ KM_RATE }} ₽ за км от МКАД в обе стороны</span>
      <a class="cprice__cta" href="/#konfigurator">Посчитать по своему адресу →</a>
    </div>
    <div class="cprice__facts">
      <p class="cprice__line">
        <span class="cprice__key">Класс под груз</span>
        <span class="cprice__val">{{ cargo.startClass }} · {{ machine.kmu }}</span>
      </p>
      <p class="cprice__line">
        <span class="cprice__key">Отсекает</span>
        <span class="cprice__val">{{ cargo.limiter }}</span>
      </p>
    </div>
  </aside>
</template>

<style scoped>
/* Мятная плитка того же семейства, что вывод конфигуратора (.cfg__out) —
   человек, пришедший с главной, узнаёт поверхность, на которой сайт называет
   цену, и не читает её как отдельный баннер. */
.cprice {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 24px);
  margin-top: clamp(18px, 2.6vw, 26px);
  padding: clamp(18px, 2.4vw, 26px);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
  border-radius: var(--r-lg);
}
@media (min-width: 760px) {
  .cprice { grid-template-columns: minmax(0, 1fr) minmax(0, 260px); align-items: start; }
  .cprice__facts { grid-column: 1; grid-row: 1; }
  .cprice__money { grid-column: 2; grid-row: 1; }
}
.cprice__facts { display: grid; gap: 10px; min-width: 0; }
.cprice__line { display: grid; grid-template-columns: 1fr; gap: 2px; font-size: var(--fs-sm); margin: 0; }
.cprice__key { font-size: var(--fs-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--accent-ink); }
.cprice__val { color: var(--ink); }
.cprice__money { display: grid; gap: 4px; min-width: 0; align-content: start; }
/* Тот же голос, что у итога конфигуратора: заголовочная гарнитура, tabular-nums,
   отрицательный трекинг — цифра должна читаться как ЦЕНА, а не как ещё один факт. */
.cprice__num {
  font-family: var(--display);
  font-weight: 700;
  font-size: var(--fs-num);
  line-height: 1.05;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
  color: var(--accent-ink);
}
.cprice__cap { font-size: var(--fs-xs); color: var(--muted); line-height: 1.4; }
.cprice__cta {
  margin-top: 8px;
  justify-self: start;
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--accent-ink);
}
/* Граница между ценой и разбором на узком экране: без неё «класс под груз»
   читается как продолжение подписи к цифре, а не как отдельный блок. */
@media (max-width: 759px) {
  .cprice__facts { border-top: 1px solid var(--accent-line); padding-top: 14px; }
}
</style>
