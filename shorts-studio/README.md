# shorts-studio: как сделаны ролики Lights Out Lab

Ветка: `claude/friendly-galileo-f3e9nh`. Всё, из чего собраны шесть Shorts, лежит в этой папке: исходники сцен, персонажи, озвучка, музыка.

## Чем сделано

- **Видео:** Remotion 4.0.541 (React 18). Каждый ролик — React-компонент, кадры рендерятся в MP4.
- **3D:** Three.js 0.170 через `@remotion/three` и `@react-three/fiber` 8. Никаких внешних моделей и текстур: персонажи и декорации собраны из кубов прямо в коде.
- **Озвучка:** ElevenLabs, голос «VASKO — Deep, Warm and Pleasant» (`voice_id` `Vl27Cllkuw8BhyPqus2n`), модель `eleven_v4`, один дубль на эпизод. Бесплатный тариф, периодически блокируется.
- **Музыка:** один сгенерированный в vidIQ трек, `public/music/blackout_bed.mp3`.

## Где что лежит

| Что | Файл |
|---|---|
| Персонажи и декорации: электрик `Lineman`, кубик `Volt`, `City`, `House`, `Stage`, камера `Cam`, `Box`, `useTextTexture` | `src/three/kit.tsx` |
| Общие 2D-слои: таймер `TopBar`, субтитры `Captions`, плашка `Label`, палитра `C`, раскладка `LAYOUT` | `src/GridEp1.tsx` |
| Сцены эпизодов 1–3 | `src/GridEp1_3D.tsx`, `src/GridEp2_3D.tsx`, `src/GridEp3_3D.tsx` |
| Сцены эпизодов 4–5 и их вступления | `src/GridEp45_3D.tsx` |
| Сцены эпизода 6 (светлый дневной вариант, свои `Day`, `Room`, `Cottage`, `Pine`) | `src/GridEp6_3D.tsx` |
| Вступления («хуки») эпизодов 1–3 | `src/hooks3d.tsx` |
| Тайминги: начало сцен и субтитры по паузам в голосе | `src/timingN_vasko.json` |
| Регистрация композиций | `src/Root.tsx` |
| Озвучка эпизодов 1–6 | `public/epN_vasko.mp3` |
| Озвучка для длинного видео: вступление и финал | `public/long/intro.mp3`, `public/long/outro.mp3` |
| Аватар и шапка канала, обложки | `src/Branding.tsx`, `src/Cover.tsx` |
| Сведение музыки под голос | `scripts/mix_music.sh` |

Плоские версии (`GridEp1.tsx`, `GridEp2.tsx`, `GridEp3.tsx`, папка `src/styles/`) — ранние варианты и пробы стилей. Опубликованные ролики сделаны из файлов `*_3D.tsx`.

## Как рендерить

```bash
cd shorts-studio && npm install

# один кадр для проверки
npx remotion still src/index.ts GridEp1-3D out/test.png --frame=150 --gl=swangle

# ролик целиком (YouTube-раскладка)
npx remotion render src/index.ts GridEp1-3D out/ep1.mp4 --gl=swangle --codec=h264 --crf=20 --concurrency=4

# TikTok-раскладка: субтитры и плашки подняты над интерфейсом
npx remotion render src/index.ts GridEp1-3D out/ep1_tt.mp4 --gl=swangle --props='{"tiktok":true}' --codec=h264 --crf=20

# добавить музыку под голос и выровнять громкость (около -14 LUFS)
scripts/mix_music.sh out/ep1.mp4 public/music/blackout_bed.mp3 out/ep1_music.mp4
```

- **`--gl=swangle` обязателен:** видеокарты в облачной сессии нет, без этого флага WebGL не создаётся.
- **Скорость:** 30-секундный шорт рендерится 5–10 минут. Длинные рендеры запускать в фоне.
- **Композиции:** `GridEp1-3D` … `GridEp6-3D`, 1080×1920, 30 fps.

## Как устроен эпизод

1. Озвучка → `silencedetect` в ffmpeg находит паузы → в `timingN_vasko.json` записаны начало каждой сцены (`segments`) и субтитры (`captions`).
2. Компонент эпизода раскладывает сцены по `segments`. Каждая сцена — свой `ThreeCanvas` плюс 2D-слои поверх.
3. Сверху общие слои: `TopBar` (таймер), `Captions`, затем `Audio`.

## Для длинного горизонтального видео

- Сцены можно переиспользовать: это код, а не видеофайлы. Камеры настроены под вертикаль (fov 52, герой по центру), для 1920×1080 их придётся перенастроить.
- В конце каждой озвучки есть фраза «Follow for part N». Для длинного видео её нужно обрезать: время начала последней сцены указано в `segments`.
- План длинного видео, готовые и недостающие части озвучки, тексты и источники: `youtube-plan/LONG_VIDEO.md`.
- Готовые ролики: `youtube-plan/videos/with_music/` (YouTube) и `youtube-plan/videos/tiktok/`.
