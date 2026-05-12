import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import carsRouter from "./cars";
import favoritesRouter from "./favorites";
import profilesRouter from "./profiles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(carsRouter);
router.use(favoritesRouter);
router.use(profilesRouter);

export default router;
