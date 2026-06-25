import { getRaceDetailPayload, findTrackImage } from "../services/raceService.js";
import {
  getCurrentLocation,
  getCurrentPositions,
  getSessions,
} from "../services/openF1Service.js";
import { sendFallback } from "../utils/errorHandler.js";
import {
  findNextRace,
  findSessionForLiveData,
  latestByDriver,
  normalizeCars,
  normalizeRaceCalendar,
} from "../utils/normalizers.js";

export const getRace = async (req, res) => {
  try {
    let cars = [];
    let trackImage = null;

    try {
      cars = normalizeCars(await getCurrentLocation());
    } catch (err) {
      try {
        cars = latestByDriver(await getCurrentPositions()).map((car) => ({
          driver: car.driver_number,
          x: null,
          y: null,
        }));
      } catch {
        console.log("Live data not available:", err.message);
      }
    }

    const sessions = await getSessions();
    const isLive = cars.length > 0;
    const race = isLive
      ? findSessionForLiveData(sessions) || findNextRace(sessions)
      : findNextRace(sessions);

    try {
      trackImage = await findTrackImage(race);
    } catch (err) {
      console.log("Track image fetch error:", err.message);
    }

    return res.json({
      isLive,
      cars,
      race,
      trackImage,
    });
  } catch (err) {
    return sendFallback(res, "Race API error", err, {
      isLive: false,
      cars: [],
      race: null,
      trackImage: null,
      message: "Unable to load race data right now.",
    });
  }
};

export const getCalendar = async (req, res) => {
  const requestedYear = Number(req.query.year) || new Date().getFullYear();

  try {
    const sessions = await getSessions();
    const yearSessions = sessions.filter(
      (session) => Number(session.year) === requestedYear,
    );

    return res.json({
      year: requestedYear,
      races: normalizeRaceCalendar(yearSessions),
    });
  } catch (err) {
    return sendFallback(res, "Calendar API error", err, {
      year: requestedYear,
      races: [],
      message: "Unable to load the race calendar right now.",
    });
  }
};

export const getCalendarRace = async (req, res) => {
  try {
    return res.json(await getRaceDetailPayload(req.params.sessionKey));
  } catch (err) {
    return sendFallback(res, "Race detail API error", err, {
      race: null,
      weekendSessions: [],
      trackImage: null,
      details: null,
      message: "Unable to load race details right now.",
    });
  }
};
