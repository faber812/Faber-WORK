# Long 001 — The First 7 Days Without Power, Hour by Hour

**Status: script draft v1, for recording.** Replaces `long-001-additions.md` and the plan in
`youtube-plan/LONG_VIDEO.md` (repository `faber812/Faber-WORK`). Every rule is checked against a
primary source on 2026-11-16 — table at the end. Recommended: record the whole script in one
ElevenLabs session (voice VASKO) instead of stitching old episode takes, so tone and pace match.

- **Viewer:** a US adult at home who has been through a storm outage and wondered what happens if
  the power does not come back tonight.
- **Why they click:** they know the lights go out; they do not know their tap, phone, fuel and food
  each have their own countdown.
- **What they know by the end:** the order in which things fail, why, and five things to do in the
  first ten minutes — plus the fridge rule for the day the power comes back.
- **Visual idea in one sentence:** a status board of eight systems sits at the top of the screen —
  Power, Card, Fuel, Phone, Water, Food, Heat, Sewer — and one light goes out per section while a
  clock runs, so the viewer always sees how far into the week they are and what is left.
- **Length:** see the count at the end (target 8–9 min).

## Hooks (scored with `hookscore.py`; a heuristic, not a prediction)

1. **Chosen — 77 STRONG (The Mistake):** "Your tap still runs when the power dies. But why does it
   stop after about 24 hours, and what do you lose first?"
2. **Alternative — 67 WORKABLE (The Impossible Claim):** "Never eat from your fridge after a
   blackout until you know what happens after 4 hours." This one has real data behind it: the same
   line opened the Fridge Short, the first video on the channel where more than half of viewers
   stayed (51.6 %). The script uses hook 1 as the first line and this one as the open loop at 0:12.

## Script

### COLD OPEN — 0:00

```
[calm, serious] Your tap still runs when the power dies. But why does it stop after about twenty-four hours... and what do you lose first?

This is a what-if. Most blackouts end in hours. This one doesn't. We're going to follow it for seven days... hour by hour... using the rules from the CDC, FEMA and the USDA.

And stay to the end. Because the most dangerous moment isn't when the lights go out. It's when they come back on... and you open the fridge.
```
`[ON SCREEN: 0:00 kitchen in the dark, the tap running, three icons crossed out one by one (lamp, Wi-Fi, fridge). 0:05 pull back to a cutaway of the whole house. 0:08 the STATUS BOARD slides in at the top: eight lights, all green. Clock "HOUR 0". 0:13 quick flash-forward: the fridge door opening, a red "?" — then back.]`

### HOUR 1 — money and fuel

```
Hour one. Your lights go out. That's the part everyone expects. What comes next... is what nobody does.

Your card stops working. Card readers and ATMs need power and a network. So it's cash only.

Then the gas station. Here's the part that surprises people. The station isn't out of gas. The tanks under the ground are full. But the only thing that lifts that fuel to your car is an electric pump. No power... no pump.

A few states plan for this. Florida, for example, requires many stations near highways and evacuation routes to be wired for a generator. Most of the country has no rule like that.

And your fridge? It starts a countdown.
```
`[ON SCREEN: card reader screen goes black, "CASH ONLY" sign. STATUS: CARD → red. Cutaway under a gas station: underground tank full, the electric pump with a red X, fuel stays down. STATUS: FUEL → red. Source line: "Florida Statutes §526.143". Fridge with a timer starting at 0:00.]`

### HOUR 6 — food, phone, roads, water

```
Hour six. Your fridge just passed its four-hour mark. The USDA rule: food in a closed fridge stays safe for about four hours. After that, meat, milk, eggs and leftovers have to go.

Your freezer is your best friend now. A full one holds for about forty-eight hours. Half full? Just twenty-four.

Every traffic light is dark. Many states write it into law: a dead signal means an all-way stop.

And your phone still has signal... for now. Here's why that won't last. A cell tower looks like a pole. It's really a small building... with a room full of batteries at the bottom. Industry guidelines have called for as little as four hours of backup, with eight as the goal. After Hurricane Katrina, the FCC tried to require eight hours nationwide. That rule never took effect.

So the towers are draining. And so is something you can't see.
```
`[ON SCREEN: fridge timer hits 4:00, items get red X (meat, milk, eggs, leftovers). Source: "USDA / FoodSafety.gov". Freezer: full = 48 h bar, half = 24 h bar. STATUS: FOOD → amber. Dark intersection, four cars stopping in turn. Cutaway of a cell tower: battery room at the base, battery bar draining. Source: "CPUC Decision 08-09-014; FCC backup power rule never in effect".]`

### HOUR 12 — the phone

```
Hour twelve. Your phone is at forty percent... and it's dropping fast.

Your Wi-Fi router died the moment the power did. So your phone leans on the cell network. But the towers are weaker now. As the signal drops, your phone works harder to stay connected... and that burns battery. And everyone is calling at once. The network jams.

The FCC's advice: keep calls short, and text instead. A text can get through when a call can't.

You can charge your phone in your car. But only with the car outside, in the open. Never in the garage. Hold that thought... it matters on day two.

But by hour twenty-four... the problem isn't your phone. It's your water.
```
`[ON SCREEN: phone battery 40 % → 31 %. Router light off. Signal bars falling, the phone's battery icon heating up. Thousands of call lines piling into one tower — jam. A text bubble slipping through. Source: "FCC — Tips for Communicating in an Emergency". STATUS: PHONE → amber.]`

### HOUR 24 — water

```
Hour twenty-four. So why did your tap keep running all this time?

Follow the pipe under your street. It climbs a hill... to a tank on legs. A water tower. The water up there is heavy. Its own weight pushes it through every pipe in town. That's your water pressure. No motor. Just gravity.

Unless you live up high. Many tall buildings use electric pumps to push water to the upper floors. Up there, the tap can quit in the first hour.

But something had to lift that water up there. Electric pumps. And they stopped when the lights did. Many systems are built to hold about one day of normal use up high.

So turn on your tap... and listen. As the tower drains, the pressure drops. And pressure is what keeps the pipes clean. When it falls, dirty water can seep in through tiny cracks. That's when a boil-water notice goes out. The CDC's rule: a rolling boil for one full minute.

This is why the first thing to do in a blackout... is fill everything. Pots. Bottles. The bathtub. Ready.gov says one gallon per person, per day.

And at hour forty-eight... the real danger isn't hunger.
```
`[ON SCREEN: camera drops through the kitchen floor, follows the pipe underground, rises to the tower (cutaway). Weight arrows down the pipe: "PRESSURE = HEIGHT". Pump house, red X. Tower water level becomes a battery bar, draining; source "state design standard: ~24 h of storage". Weak trickle at the tap; cracked pipe pulling brown water in; "BOIL-WATER NOTICE — boil 1 minute (CDC)". Lineman filling the tub, Volt counting gallons; "1 gal / person / day — Ready.gov". STATUS: WATER → red.]`

### HOUR 48 — carbon monoxide

```
Hour forty-eight. Even a full freezer is giving up now. So people start cooking however they can. Grills. Camp stoves. Generators.

And this is where blackouts turn deadly. Carbon monoxide has no smell... and no color. It doesn't make you cough. The first signs are a headache... dizziness... feeling tired. In the dark, on day two, that feels normal. So people lie down.

And the garage isn't the safe spot people think it is. The CDC says don't even run a car in an attached garage... with the door open.

The CDC counts more than four hundred deaths a year in the US from carbon monoxide that has nothing to do with fires.

The rule: never run a generator, a grill or a camp stove inside your home, your garage, or near a window. Keep a generator at least twenty feet from doors and windows. And a battery-powered CO alarm is the only thing that will warn you.

And at hour seventy-two... the cold moves in.
```
`[ON SCREEN: freezer bar hits zero. A grill being carried toward the garage — freeze frame, red X. Invisible gas shown as a faint grey tide filling the garage and seeping under the door. Lineman yawning, sitting down. Number card "400+ deaths a year — CDC". Generator outside with a measured 20 ft line to the window. Battery CO alarm blinking. STATUS: FOOD → red.]`

### HOUR 72 — cold

```
Hour seventy-two. Day three. If it's winter, your house gets colder every hour.

Never use your oven or gas stove to heat your home. Ready.gov warns against it.

Instead: pick one room. Close off the rest. Cover the windows. Layer up, and keep everyone together. A small closed room holds the heat of a few people far longer than a whole house.

And skip the candles. Ready.gov's advice is flashlights and lanterns. A candle next to blankets, in a dark house full of tired people, is a fire waiting to happen.

Watch for the warning signs the CDC lists: shivering, exhaustion, confusion, fumbling hands, slurred speech, drowsiness. If you see those, you don't wait it out. You go to a warming center, or anywhere that still has power.
```
`[ON SCREEN: house cutaway turning blue room by room; thermometer falling. Oven with red X. One room glows warm, doors shut, blankets on windows, four figures together. Six warning-sign icons appear one per word. Source: "Ready.gov — Power Outages; CDC — Preventing Hypothermia". STATUS: HEAT → red.]`

### DAY 5 — fuel, stores, sewage

```
Day five. The gas in your tank is running low... and the stations still can't pump.

Most stores depend on constant deliveries. Without fuel and power, the shelves stay empty.

And there's a problem almost nobody thinks about. Sewage. Sewer systems rely on electric pumps called lift stations. FEMA warns that in a long outage, sewage levels rise... and can back up.

Cash is the only payment that still works. If you have any.
```
`[ON SCREEN: car fuel gauge on E. Store shelves emptying, delivery truck parked. Cutaway under the street: lift station pump with red X, level rising in the pipe toward the house drain. Source: "FEMA — Reducing Loss of Utility Impacts to Critical Facilities". STATUS: SEWER → red.]`

### DAY 7 — hospitals and restarting the grid

```
Day seven. One week. Hospitals switch to generators. Many plan for about ninety-six hours on their own. After that, everything depends on fuel deliveries.

So how do you restart a dead grid? Here's the strange part. Most big power plants need electricity to start. A few special plants don't. It's called a black start. They energize one line... wake up the next plant... and rebuild the grid, piece by piece.

It takes time. In two thousand three, a blackout hit about fifty million people in the US and Canada. Some areas waited four days for power.
```
`[ON SCREEN: hospital with generator, fuel gauge; "Plan for 96 hours — Joint Commission standard". Map of plants, all dark; one lights up, a line glows to the next, then the next — the grid lights in a chain. 2003 map card: "~50 million people · up to 4 days — U.S.–Canada Task Force final report". STATUS: POWER → amber.]`

### POWER BACK — the fridge (the payoff promised at 0:12)

```
And then... the lights come back on. Your fridge is humming again. The food feels cold. So people eat it.

That's the mistake. Cold now doesn't mean it stayed cold. If your fridge was off for more than four hours, meat, milk, eggs and leftovers have to go.

Your freezer is different. If the food still has ice crystals, you can refreeze it. Here's how to know for sure next time. Keep a cheap appliance thermometer in your freezer. If it still reads forty degrees or below, the USDA says that food is safe to refreeze.

And never taste food to check if it's safe. The USDA's rule is simple: when in doubt, throw it out.
```
`[ON SCREEN: houses light up, STATUS board flips green one by one. Fridge door opens — the timer that ran all video replays fast to "4.0 HRS" and beyond. Red X on meat, milk, eggs, leftovers. Freezer with ice crystals: green check "OK to refreeze". "NEVER TASTE IT — WHEN IN DOUBT, THROW IT OUT (USDA)". Trash can.]`

### CLOSE — the first ten minutes

```
So if your lights go out tonight, here's the first ten minutes. Fill the tub and every pot. Keep the fridge and freezer shut. Get cash while the ATM still works. Charge your phone, and switch to texts. And make sure your CO alarm runs on batteries.

Seven days. Eight systems. All of it runs on one thing... until it doesn't.

Next: what happens to your money when the internet goes down.
```
`[ON SCREEN: checklist of five items, each ticking with an icon. Status board, all eight lights, shrinks into the channel logo. Last 20 s: free area for the end screen — one video card + subscribe.]`

## Count

~7,312 characters with tags (for the ElevenLabs quota). Spoken words (fenced blocks): **1,320** → **8:48 at 150 wpm**; about **8:00** at the pace of the
published episodes (~165 wpm). Without "Next: …" the close ends cleanly if the next video is not
ready — remove that line in that case.

## Sources (opened 2026-11-16)

| claim | source |
|---|---|
| Fridge ~4 h; full freezer 48 h, half 24 h | CDC, "Discarding Food After a Power Outage"; USDA FSIS |
| Discard meat, milk, eggs, leftovers after >2 h above 40 °F; refreeze if ice crystals; never taste | USDA FSIS, "Keeping Food Safe During an Emergency"; FoodSafety.gov chart |
| Florida stations prewired for a generator (new since 2006, and large stations near interstates/evacuation routes) | Florida Statutes §526.143 |
| Backup power: industry minimum 4 h, objective 8 h | California PUC Decision 08-09-014, §7 |
| FCC 8-hour backup rule never took effect | reginfo.gov, RIN 3060-AI78: "the backup power rule has never gone into effect" |
| Dead signal = all-way stop (law in many states) | e.g. Washington RCW 46.61.183; Louisiana R.S. 32; Arizona ARS 28-645 |
| Keep calls short, text instead | FCC, "Tips for Communicating in an Emergency" |
| ~24 h of elevated storage | Oklahoma DEQ OAC 252:626-5-5 (one state standard → "many systems") |
| Boil 1 minute (3 min above 6,500 ft — omitted on purpose) | CDC, "Boil Water Advisory" |
| 1 gallon per person per day | Ready.gov |
| CO: >400 deaths/yr not linked to fires; early signs | CDC, "Carbon Monoxide Poisoning Basics" |
| Generators, grills, camp stoves outdoors, 20 ft from windows; no stove/oven for heat | CDC, "Use a Generator Safely"; Ready.gov, "Power Outages" |
| Hypothermia warning signs | CDC, "Preventing Hypothermia" |
| No car in an attached garage even with the door open | CDC, "You Can Prevent Carbon Monoxide Exposure" |
| Charge devices in a car run outside; flashlights and lanterns rather than candles | Ready.gov, power outage info sheet and "Power Outages" page |
| Freezer thermometer at 40 °F or below → safe to refreeze | USDA FSIS, "Keeping Food Safe During an Emergency" |
| Tall buildings pump water to upper floors | general building engineering, said without a number ("many") — no primary source cited |
| Sewage rises when lift stations lose power | FEMA, "Reducing Loss of Utility Impacts to Critical Facilities" §6.3 |
| Hospitals plan for 96 h (a plan, not on-site stock) | Joint Commission, EM.12.02.09 EP 3 |
| Black start | NERC / PNNL-32773 "Electric Grid Blackstart" (from the studio plan; not reopened today) |
| 2003: ~50 million; up to 4 days in parts of the US | DOE, "August 2003 Blackout"; U.S.–Canada Task Force Final Report (2004) |

Removed on purpose: the "resting adult = a light bulb" line (no primary source found); "stores
depend on constant deliveries" stays without a number.
