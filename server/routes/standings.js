import { Router } from "express";
import { getDriverStandingsController } from "../controllers/standingsController.js";

const router = Router();

router.get("/standings/drivers", getDriverStandingsController);

export default router;
