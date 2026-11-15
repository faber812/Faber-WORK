# Длинное видео: «What Actually Happens in the First 72 Hours of a US Blackout (Hour by Hour)»

Горизонтальное видео 1920×1080, цель 8–9 минут. Ведёт этот чат.

## Правила

- **Первая фраза ролика — последствие,** не «Hour N». Номер часа показываем плашкой на экране.
- **Из озвучки шортов вырезаем** финальные «Follow for part N» и мостики к следующему эпизоду.
- **Каждый блок «Hour N»** = готовая озвучка шорта + новый блок «как это устроено».
- **Ни одной цифры без источника.** Где источник слабый, формулировка мягкая, это отмечено ниже.

## Структура и хронометраж

| # | Блок | Озвучка | Длина |
|---|---|---|---|
| 0 | Холодное начало: последствие | **новая** | ~20 с |
| 1 | Hour 1 | `ep1_vasko.mp3` до 33,5 с | ~33 с |
| 1a | Как электричество доходит до дома | **новая** | ~40 с |
| 2 | Hour 6 | `ep2_vasko.mp3` до 41 с | ~41 с |
| 2a | Как устроен резерв вышек связи | **новая** | ~35 с |
| 3 | Hour 12 | `ep3_vasko.mp3` до 28,6 с | ~29 с |
| 3a | Почему SMS проходит, а звонок нет | **новая** | ~25 с |
| 4 | Hour 24 | `ep4_vasko.mp3` до 21 с | ~21 с |
| 4a | Как работает водонапорная башня | **новая** | ~40 с |
| 5 | Hour 48 | `ep5_vasko.mp3` до 24,2 с | ~24 с |
| 5a | Что такое угарный газ и почему он убивает тихо | **новая** | ~35 с |
| 6 | Hour 72 | `ep6_vasko.mp3` до 23,2 с | ~23 с |
| 6a | Как дом теряет тепло | **новая** | ~30 с |
| 7 | После 72 часов + как перезапускают сеть | **новая** | ~70 с |
| 8 | Финал: что держать дома | `long/outro.mp3` | ~28 с |

**Итого около 8 минут:** готовой озвучки ~4 мин, новой ~4,5 мин. `long/intro.mp3` («the first week») больше не используется.

## Тексты новой озвучки (голос VASKO, eleven_v4)

**0 · Холодное начало**
```
[calm, serious] In a long blackout, the darkness isn't what hurts people. It's the food they eat, the way they stay warm, and the generator in the garage. Here's what the first seventy-two hours would really look like... hour by hour. And what you can do about each one.
```

**1a · Как электричество доходит до дома**
```
[calm] To understand why everything stops so fast, you need to know how power reaches your home. Big power plants push electricity onto transmission lines at up to hundreds of thousands of volts. Substations step it down. Then the transformer on the pole near your house drops it to the voltage in your outlets. And here's the key part: the grid stores almost nothing. Power has to be made at the same moment it's used. So when the system goes down... there's no reserve waiting in the wires.
```

**2a · Резерв вышек связи**
```
[calm] Cell towers need electricity too. Most have a cabinet of batteries at the base. In one review by California regulators, about eighty percent of wireless sites had four hours or more of battery backup. Some sites also have generators. But a generator needs fuel... and fuel needs trucks, roads, and someone to deliver it. That's why signal fades slowly, tower by tower.
```

**3a · Почему SMS проходит**
```
[calm] Why does a text get through when a call fails? A call needs a steady connection the whole time you talk. A text is tiny. The network can hold it and deliver it when there's a gap. That's why the FCC and FEMA suggest texting in an emergency... and keeping calls short.
```

**4a · Водонапорная башня**
```
[calm] A water tower is basically stored height. While the power is on, pumps lift water up into the tank. Gravity then pushes it down to your tap, so your water keeps flowing even when the pumps stop. But only for a while. Many towers hold roughly a day of water. As the level falls, pressure drops. And when pressure gets low enough, utilities often tell people to boil their water, because contamination can get into the pipes.
```

**5a · Угарный газ**
```
[calm, serious] Carbon monoxide comes from burning fuel: gasoline, propane, charcoal. You can't see it, and you can't smell it. It takes the place of oxygen in your blood, so people often feel sleepy or dizzy... and don't realize what's happening. That's why the CDC says generators, grills and camp stoves belong outside, at least twenty feet from doors, windows and vents. And a carbon monoxide alarm with a battery keeps working when the grid doesn't.
```

**6a · Теплопотери дома**
```
[calm] Without a furnace, a house slowly gives its heat away: through windows, doors, the roof, and every small draft. The more rooms you try to keep warm, the faster it goes. That's why closing off rooms works. Less space to heat. More people and blankets in one room. And never bring a grill or a generator inside to fix it. That's exactly how winter blackouts turn deadly.
```

**7 · После 72 часов и перезапуск сети**
```
[calm, serious] After seventy-two hours, the problems start to stack up. Gas stations without power can't pump fuel. Stores that depend on daily deliveries start to empty. Sewer systems rely on electric pumps called lift stations, and FEMA warns that when they lose power for long, sewage levels can rise. Hospitals switch to generators. Many plan for about ninety-six hours on their own.

So how do you bring a dead grid back to life? It's called a black start. A few special power plants can start with no outside power at all. They energize one line... wake up the next plant... and rebuild the grid, piece by piece.

It takes time. In two thousand three, a blackout hit about fifty million people in the US and Canada. In some parts of the US, power wasn't fully restored for four days.
```

## Источники (проверено 15–16 ноября 2026)

| Факт | Источник | Статус |
|---|---|---|
| Передача до сотен тысяч вольт, понижение на подстанциях и на столбе | Типовые значения США: 115–765 кВ передача, 120/240 В в доме | общеизвестно; прямую ссылку EIA добавить |
| «Сеть почти ничего не хранит, производство = потребление» | EIA, «Electricity explained» | **открыть первоисточник перед публикацией** |
| ~80% беспроводных узлов с резервом 4+ часа | CPUC, решение D0809014 (2008): «Most wireless remote terminals have emergency power backup, with 80% having four or more hours of backup power» | ✅ первоисточник открыт. Данные по Калифорнии 2008 года, поэтому «in one review by California regulators» |
| Звонки короче, писать SMS | FCC/FEMA, fcc.gov/emergency | ✅ |
| Башня ≈ сутки воды | Sewerage & Water Board of New Orleans (пост в соцсетях) | ⚠️ слабый источник, поэтому «many towers hold roughly a day» |
| Падение давления → кипятить воду | CDC, Drinking Water Advisory Communication Toolbox | ✅ |
| Генераторы и грили только снаружи, 20 футов | CDC, «Avoiding Carbon Monoxide Poisoning»; Ready.gov | ✅ |
| Датчик CO на батарейке | CDC: «battery-operated or battery back-up CO detector» | **открыть первоисточник** |
| Насосные станции канализации | FEMA, «Reducing Loss of Utility Impacts to Critical Facilities», раздел 6.3 | ✅ текст с fema.gov (по выдержке из поиска) |
| Больницы: план на 96 часов | **Joint Commission EM.12.02.09, «96-hour sustainability plan»** — требование к плану, а не к запасам. Не CMS 42 CFR 482.15 | ✅ по справочнику Joint Commission |
| Заправки без электричества не работают | DOE Situation Reports (ураганы Ида, Лора) | ✅ |
| Black start | NERC, FERC/NERC 2017, PNNL-32773 | ✅ |
| 2003: ~50 млн человек, в части США до 4 дней | **Итоговый отчёт** U.S.-Canada Power System Outage Task Force (апрель 2004). В промежуточном отчёте — 2 дня | ✅ |
| Что держать дома | Ready.gov, «Build a Kit» | ✅ |

## Поправка к опубликованному шорту (эпизод 2)

Фраза «Industry guidelines call for as little as four hours of backup power at many sites» по источнику CPUC относится к узлам проводной сети. По сотовым узлам в том же документе: «80% have four or more hours». Перезаписывать шорт не обязательно, но в описании эпизода 2 источник стоит уточнить.
