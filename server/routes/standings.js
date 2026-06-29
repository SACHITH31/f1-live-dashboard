import { Router } from "express";
import {
  getConstructorStandingsController,
  getDriverStandingsController,
} from "../controllers/standingsController.js";

const router = Router();

router.get("/standings/drivers", getDriverStandingsController);
router.get("/standings/constructors", getConstructorStandingsController);

export default router;
