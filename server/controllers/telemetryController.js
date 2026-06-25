import { getCurrentLocation } from "../services/openF1Service.js";
import { sendFallback } from "../utils/errorHandler.js";
import { normalizeCars } from "../utils/normalizers.js";

const getLiveCars = async () => {
  const data = await getCurrentLocation();

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return normalizeCars(data).filter((car) => car.x != null && car.y != null);
};

export const getLocation = async (req, res) => {
  try {
    return res.json(await getLiveCars());
  } catch (err) {
    return sendFallback(res, "Location API error", err, []);
  }
};

export const getCars = async (req, res) => {
  try {
    return res.json(await getLiveCars());
  } catch (err) {
    return sendFallback(res, "Cars API error", err, []);
  }
};
