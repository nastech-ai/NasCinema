---
name: NyumatFlix carousel media items missing videos
description: Why carousel items need a separate fetch to get trailer keys for auto-preview
---

The /api/content endpoint (TMDB list) returns media items WITHOUT videos.results.
Only /api/movies/:id and /api/tv/:id (detail endpoints) include videos.

**Why:** TMDB list endpoints don't support append_to_response per-item; only detail endpoints do.

**How to apply:** Any feature that needs trailer keys from carousel items (auto-preview, Play Trailer) must fetch the detail endpoint first. The pattern is in useMediaHero.ts — fetch on currentItem.id change, store in previewTrailerKey state, pass as prop to HeroBackground.

Media type detection: check `currentItem.media_type === "tv"` OR `currentItem.name !== undefined` OR `currentItem.first_air_date !== undefined` to decide between /api/movies vs /api/tv.
