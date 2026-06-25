import { Router } from "express";
import { getDrivers } from "../controllers/driverController.js";

const router = Router();

router.get("/drivers", getDrivers);

export default router;
