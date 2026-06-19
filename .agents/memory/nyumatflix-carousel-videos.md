---
name: NyumatFlix carousel media items missing videos + preview architecture
description: Why carousel items need separate fetches for trailer keys, and how preview/trailer are separated
---

## Carousel items missing videos
The /api/content endpoint (TMDB list) returns media items WITHOUT videos.results.
Only /api/movies/:id and /api/tv/:id (detail endpoints) include videos.

**Why:** TMDB list endpoints don't support append_to_response per-item; only detail endpoints do.

**How to apply:** Any feature that needs trailer keys from carousel items must fetch the detail endpoint first. The pattern is in useMediaHero.ts — fetch on currentItem.id change, store in previewTrailerKey state.

## Preview vs Trailer architecture (as of June 2026)
- **Background preview** (auto-plays after 5s): Uses selected streaming server iframe directly (VidSrc/SuperEmbed/etc.) — NOT YouTube. No YouTube involved.
- **Play Trailer button**: Uses YouTube IFrame API with `activeTrailerKey = previewTrailerKey || trailerKey`. The `previewTrailerKey` is the fetched trailer key used as fallback for carousel items that have no embedded videos.
- **`previewTrailerKey`** in useMediaHero: only used for Play Trailer fallback — NOT for preview anymore.
- No `previewPlayer`/`setPreviewPlayer` state needed — streaming iframe handles itself.

## Media type detection
Check `currentItem.media_type === "tv"` OR `currentItem.name !== undefined` OR `currentItem.first_air_date !== undefined` to decide between /api/movies vs /api/tv.

## TDZ bug (fixed June 2026)
`const currentItem = useMemo(...)` MUST be declared BEFORE any useEffect that references it in its dependency array. Violating this causes "Cannot access 'currentItem' before initialization".
