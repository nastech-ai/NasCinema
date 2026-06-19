import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { users, sessions, verificationTokens } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { Resend } from "resend";
import cookieParser from "cookie-parser";

const router = Router();
router.use(cookieParser());

const SESSION_COOKIE = "nyumatflix_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getResend() {
  const key = process.env.AUTH_RESEND_KEY;
  if (!key) throw new Error("AUTH_RESEND_KEY not set");
  return new Resend(key);
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

function getBaseUrl(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

router.post("/auth/magic-link", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (!user) {
      const [newUser] = await db.insert(users).values({
        id: crypto.randomUUID(),
        email: normalizedEmail,
        name: normalizedEmail.split("@")[0],
      }).returning();
      user = newUser;
    }

    const token = generateToken();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.insert(verificationTokens).values({
      identifier: normalizedEmail,
      token,
      expires,
    }).onConflictDoNothing();

    const baseUrl = getBaseUrl(req);
    const magicUrl = `${baseUrl}/login/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Magic link for ${normalizedEmail}: ${magicUrl}`);
      return res.json({ ok: true, devLink: magicUrl });
    }

    try {
      const resend = getResend();
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Nyumatflix <delivered@resend.dev>";
      await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: "Your NyumatFlix magic link",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Sign in to NyumatFlix</h2>
            <p>Click the link below to sign in. This link expires in 10 minutes.</p>
            <a href="${magicUrl}" style="display: inline-block; padding: 12px 24px; background: #1a90ff; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Sign In to NyumatFlix
            </a>
            <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return res.status(500).json({ error: "Failed to send magic link email" });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("Magic link error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/verify", async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query as { token?: string; email?: string };

    if (!token || !email) {
      return res.status(400).json({ error: "Token and email required" });
    }

    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim();
    const now = new Date();

    const [verToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, normalizedEmail),
          eq(verificationTokens.token, token),
          gt(verificationTokens.expires, now),
        )
      )
      .limit(1);

    if (!verToken) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    await db.delete(verificationTokens).where(
      and(eq(verificationTokens.identifier, normalizedEmail), eq(verificationTokens.token, token))
    );

    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (!user) {
      const [newUser] = await db.insert(users).values({
        id: crypto.randomUUID(),
        email: normalizedEmail,
        name: normalizedEmail.split("@")[0],
        emailVerified: new Date(),
      }).returning();
      user = newUser;
    } else if (!user.emailVerified) {
      await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));
    }

    const sessionToken = generateToken();
    const expires = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(sessions).values({
      sessionToken,
      userId: user.id,
      expires,
    });

    res.cookie(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    return res.json({ ok: true, session: { user: { id: user.id, name: user.name, email: user.email, image: user.image }, expires: expires.toISOString() } });
  } catch (e) {
    console.error("Verify error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/session", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies?.[SESSION_COOKIE];

    if (!sessionToken) {
      return res.json({ session: null });
    }

    const now = new Date();
    const [sessionRow] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.sessionToken, sessionToken), gt(sessions.expires, now)))
      .limit(1);

    if (!sessionRow) {
      res.clearCookie(SESSION_COOKIE);
      return res.json({ session: null });
    }

    const [user] = await db.select().from(users).where(eq(users.id, sessionRow.userId)).limit(1);
    if (!user) {
      res.clearCookie(SESSION_COOKIE);
      return res.json({ session: null });
    }

    return res.json({
      session: {
        user: { id: user.id, name: user.name, email: user.email, image: user.image },
        expires: sessionRow.expires.toISOString(),
      }
    });
  } catch (e) {
    console.error("Session error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/signout", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies?.[SESSION_COOKIE];
    if (sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
      res.clearCookie(SESSION_COOKIE);
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error("Signout error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
