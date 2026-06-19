import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tmdbRouter from "./tmdb";
import contentRouter from "./content";
import watchlistRouter from "./watchlist";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(watchlistRouter);
router.use(contentRouter);
router.use(tmdbRouter);

export default router;
