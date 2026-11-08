---
name: watch-video
description: Watch a video and report what is SEEN on screen and what is SAID, scene by scene. Use for YouTube (long-form and Shorts), TikTok, Instagram Reels links, and for video files the user uploads. Use when the user says "посмотри видео", "разбери ролик", "что в этом шортсе", "watch this video", "transcribe", "analyze competitor video", or pastes a video link.
---

# Watch Video

Goal: a precise report of the visuals (shots, text overlays, animation style, pacing) **and** the speech (quotes with timestamps), plus takeaways for our channel.

The approach follows public Claude video skills on GitHub (`blink-new/claude` → `skills/watch-video`, `iamzhihuix/happy-claude-skills` → `video-processor`): frames from ffmpeg + speech from Whisper/yt-dlp. In the cloud session YouTube itself is not reachable (yt-dlp fails), so links go through the vidIQ tools instead.

## 1. Pick the route

| Input | Route |
|---|---|
| YouTube **Shorts**, TikTok (full `/@user/video/<id>` URL), Instagram Reel | `vidiq_watch_shortform_content` (10 credits) → poll `vidiq_job_poll` |
| YouTube long-form, need only the words | `vidiq_video_transcript` (5 credits) |
| YouTube long-form, need visuals too | `vidiq_video_watch` (25 credits) → poll `vidiq_job_poll`. Pass a `prompt` with the exact questions |
| Uploaded file (`/root/.claude/uploads/...mp4`) | Local pipeline, section 2 |
| Running on the user's own computer (YouTube reachable) | yt-dlp, section 3 |

Ask before spending more than ~50 vidIQ credits in one go. Say how many credits each call used.

## 2. Local file pipeline (uploads)

Put outputs in the scratchpad, never next to the input file.

```bash
V="<path to video>"; S="<scratchpad>/vid"; mkdir -p "$S"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact "$V"
# 12 evenly spaced frames as one contact sheet
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
ffmpeg -v error -y -i "$V" -vf "fps=12/$D,scale=320:-1,tile=6x2" -frames:v 1 "$S/sheet.png"
# audio for transcription
ffmpeg -v error -y -i "$V" -ar 16000 -ac 1 "$S/a.wav"
```

Then `Read` the sheet image. For speech:
- `faster-whisper` (`pip install faster-whisper`, model `small`): needs huggingface.co reachable. If the download is refused by the proxy, say so and offer to add the host to the environment.
- Otherwise: on-screen captions in the frames often carry the script, so read them from the contact sheet.

## 3. On the user's own machine

```bash
yt-dlp --skip-download --write-auto-subs --sub-langs en -o "%(id)s.%(ext)s" "<url>"   # words only
yt-dlp -f "bv*[height<=720]+ba/b" -o "%(id)s.%(ext)s" "<url>"                        # then section 2
```

## 4. Report format (Russian for this user)

1. **Хук (0–2 с):** what is seen + said.
2. **Сцены:** `00:03–00:08 · визуал · текст на экране · что говорят`.
3. **Стиль и темп:** animation type, cuts per 10 s, caption style, music.
4. **Почему сработало** (for US 35+ audience).
5. **Что взять себе:** 3 concrete changes for our series (`youtube-plan/SHORTS.md`), without copying characters, art or exact wording.
