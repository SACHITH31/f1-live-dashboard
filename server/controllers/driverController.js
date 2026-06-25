import { getCurrentDrivers } from "../services/openF1Service.js";
import { sendFallback } from "../utils/errorHandler.js";

export const getDrivers = async (req, res) => {
  try {
    const data = await getCurrentDrivers();
    return res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    return sendFallback(res, "Drivers API error", err, []);
  }
};
