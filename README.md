# SYDNEE SWENEE ($SWENEE)

Solana meme landing with 1980s CRT TV intro.

- **CA:** `CommingSoon` (set `TOKEN_CA` env or update `api/settings.js`)
- **X / Telegram:** empty until set via `TWITTER_URL` / `TELEGRAM_URL`
- **Intro GIF:** `media/tv-intro.gif` — swap the file in place; path stays stable
- **Force intro again:** in DevTools `sessionStorage.removeItem('swenee_intro_seen')` then reload
- **Banner:** `media/banner.jpg` at 3:1 (`object-fit: cover`)

```bash
vercel dev
```
