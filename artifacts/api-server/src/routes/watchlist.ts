import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { users, sessions, watchlist } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import cookieParser from "cookie-parser";
import { z } from "zod";

const router = Router();
router.use(cookieParser());

const SESSION_COOKIE = "nyumatflix_session";

async function getAuthUser(req: Request): Promise<{ id: string; email: string | null; name: string | null } | null> {
  const sessionToken = req.cookies?.[SESSION_COOKIE];
  if (!sessionToken) return null;

  const now = new Date();
  const [sessionRow] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.sessionToken, sessionToken), gt(sessions.expires, now)))
    .limit(1);
  if (!sessionRow) return null;

  const [user] = await db.select().from(users).where(eq(users.id, sessionRow.userId)).limit(1);
  return user || null;
}

const addSchema = z.object({
  contentId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  status: z.enum(["watching", "waiting", "finished"]).optional(),
});

const updateSchema = z.object({
  status: z.enum(["watching", "waiting", "finished"]).optional(),
  lastWatchedSeason: z.number().int().positive().nullable().optional(),
  lastWatchedEpisode: z.number().int().positive().nullable().optional(),
});

const progressSchema = z.object({
  contentId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  seasonNumber: z.number().int().positive().optional(),
  episodeNumber: z.number().int().positive().optional(),
});

const updateNameSchema = z.object({
  name: z.string().min(1).max(100),
});

router.get("/watchlist", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const items = await db.select().from(watchlist).where(eq(watchlist.userId, user.id));
    return res.json({ items });
  } catch (e) {
    console.error("Watchlist GET error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/watchlist", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const validated = addSchema.parse(req.body);

    const existing = await db.select().from(watchlist).where(
      and(eq(watchlist.userId, user.id), eq(watchlist.contentId, validated.contentId), eq(watchlist.mediaType, validated.mediaType))
    ).limit(1);

    if (existing.length > 0) return res.status(409).json({ error: "Item already in watchlist" });

    const [newItem] = await db.insert(watchlist).values({
      id: crypto.randomUUID(),
      userId: user.id,
      contentId: validated.contentId,
      mediaType: validated.mediaType,
      status: validated.status || "watching",
    }).returning();

    return res.status(201).json({ item: newItem });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "Invalid input", details: e.errors });
    console.error("Watchlist POST error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/watchlist/:id", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const validated = updateSchema.parse(req.body);

    const existing = await db.select().from(watchlist).where(
      and(eq(watchlist.id, id), eq(watchlist.userId, user.id))
    ).limit(1);

    if (!existing.length) return res.status(404).json({ error: "Not found" });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.lastWatchedSeason !== undefined) updateData.lastWatchedSeason = validated.lastWatchedSeason;
    if (validated.lastWatchedEpisode !== undefined) {
      updateData.lastWatchedEpisode = validated.lastWatchedEpisode;
      updateData.lastWatchedAt = new Date();
    }

    const [updated] = await db.update(watchlist).set(updateData).where(
      and(eq(watchlist.id, id), eq(watchlist.userId, user.id))
    ).returning();

    return res.json({ item: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "Invalid input", details: e.errors });
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/watchlist/:id", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    await db.delete(watchlist).where(and(eq(watchlist.id, id), eq(watchlist.userId, user.id)));
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/watchlist/progress", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const validated = progressSchema.parse(req.body);

    const existing = await db.select().from(watchlist).where(
      and(eq(watchlist.userId, user.id), eq(watchlist.contentId, validated.contentId), eq(watchlist.mediaType, validated.mediaType))
    ).limit(1);

    const updateData: Record<string, unknown> = { lastWatchedAt: new Date(), updatedAt: new Date() };
    if (validated.seasonNumber !== undefined) updateData.lastWatchedSeason = validated.seasonNumber;
    if (validated.episodeNumber !== undefined) updateData.lastWatchedEpisode = validated.episodeNumber;

    if (existing.length > 0) {
      const [updated] = await db.update(watchlist).set(updateData).where(
        and(eq(watchlist.userId, user.id), eq(watchlist.contentId, validated.contentId), eq(watchlist.mediaType, validated.mediaType))
      ).returning();
      return res.json({ item: updated });
    } else {
      const [newItem] = await db.insert(watchlist).values({
        id: crypto.randomUUID(),
        userId: user.id,
        contentId: validated.contentId,
        mediaType: validated.mediaType,
        status: "watching",
        ...updateData,
      }).returning();
      return res.json({ item: newItem });
    }
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "Invalid input", details: e.errors });
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/user/update-name", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { name } = updateNameSchema.parse(req.body);
    await db.update(users).set({ name }).where(eq(users.id, user.id));
    return res.json({ message: "Name updated successfully" });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
