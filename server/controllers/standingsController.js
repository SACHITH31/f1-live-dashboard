import {
  getDriverStandings,
  getSeasonResults,
} from "../services/ergastService.js";
import { sendFallback } from "../utils/errorHandler.js";
import { normalizeDriverStandings } from "../utils/standings.js";

export const getDriverStandingsController = async (req, res) => {
  const year = req.query.year || "current";

  try {
    const [standings, seasonResults] = await Promise.all([
      getDriverStandings(year),
      getSeasonResults(year).catch((err) => {
        console.log("Season results fetch error:", err.message);
        return [];
      }),
    ]);

    return res.json({
      year: standings?.season || year,
      round: standings?.round || null,
      standings: normalizeDriverStandings(standings, seasonResults),
    });
  } catch (err) {
    return sendFallback(res, "Driver standings API error", err, {
      year,
      round: null,
      standings: [],
      message: "Unable to load driver standings right now.",
    });
  }
};
