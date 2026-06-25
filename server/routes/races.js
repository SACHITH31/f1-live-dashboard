import { Router } from "express";
import {
  getCalendar,
  getCalendarRace,
  getRace,
} from "../controllers/raceController.js";
import { getCars, getLocation } from "../controllers/telemetryController.js";

const router = Router();

router.get("/race", getRace);
router.get("/calendar", getCalendar);
router.get("/calendar/:sessionKey", getCalendarRace);
router.get("/location", getLocation);
router.get("/cars", getCars);

export default router;
