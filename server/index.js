import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SESSION_KEY = process.env.OPENF1_SESSION_KEY || "latest";
const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const REQUEST_TIMEOUT_MS = 10000;

const openF1 = axios.create({
  baseURL: OPENF1_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

const latestByDriver = (items = []) =>
  Object.values(
    items.reduce((acc, item) => {
      const driverNumber = item.driver_number;
      if (!driverNumber) return acc;

      if (
        !acc[driverNumber] ||
        new Date(item.date) > new Date(acc[driverNumber].date)
      ) {
        acc[driverNumber] = item;
      }

      return acc;
    }, {}),
  );

const normalizeCars = (items = []) =>
  latestByDriver(items).map((car) => ({
    driver: car.driver_number,
    x: car.x ?? null,
    y: car.y ?? null,
  }));

const findSessionForLiveData = (sessions = []) => {
  if (SESSION_KEY !== "latest") {
    return (
      sessions.find(
        (session) => String(session.session_key) === String(SESSION_KEY),
      ) || null
    );
  }

  const now = new Date();
  const activeSession = sessions.find((session) => {
    const start = new Date(session.date_start);
    const end = session.date_end ? new Date(session.date_end) : null;
    return start <= now && (!end || end >= now);
  });

  if (activeSession) return activeSession;

  return (
    [...sessions]
      .filter((session) => new Date(session.date_start) <= now)
      .sort((a, b) => new Date(b.date_start) - new Date(a.date_start))[0] ||
    null
  );
};

const findNextRace = (sessions = []) => {
  const now = new Date();

  return (
    [...sessions]
      .filter(
        (session) =>
          session.session_name?.toLowerCase().includes("race") &&
          new Date(session.date_start) > now,
      )
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))[0] ||
    null
  );
};

const normalizeRaceCalendar = (sessions = []) => {
  const now = new Date();

  return [...sessions]
    .filter(
      (session) =>
        session.session_name?.toLowerCase() === "race",
    )
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
    .map((session) => {
      const start = new Date(session.date_start);
      const end = session.date_end ? new Date(session.date_end) : null;
      const isLive = start <= now && (!end || end >= now);
      const isCompleted = end ? end < now : start < now;

      return {
        sessionKey: session.session_key,
        meetingKey: session.meeting_key,
        circuitKey: session.circuit_key,
        circuitShortName: session.circuit_short_name,
        countryCode: session.country_code,
        countryName: session.country_name,
        location: session.location,
        sessionName: session.session_name,
        sessionType: session.session_type,
        dateStart: session.date_start,
        dateEnd: session.date_end,
        gmtOffset: session.gmt_offset,
        year: session.year,
        status: isLive ? "live" : isCompleted ? "completed" : "upcoming",
        isCancelled: Boolean(session.is_cancelled),
      };
    });
};

const findTrackImage = async (race) => {
  if (!race?.circuit_short_name) return null;

  const meetingRes = await openF1.get("/meetings");
  const meeting = meetingRes.data.find(
    (item) =>
      item.circuit_short_name?.toLowerCase() ===
      race.circuit_short_name.toLowerCase(),
  );

  return meeting?.circuit_image
    ? decodeURIComponent(meeting.circuit_image)
    : null;
};

app.get("/api/race", async (req, res) => {
  try {
    let cars = [];
    let trackImage = null;

    try {
      const locationRes = await openF1.get(
        `/location?session_key=${SESSION_KEY}`,
      );
      cars = normalizeCars(locationRes.data);
    } catch (err) {
      try {
        const positionRes = await openF1.get(
          `/positions?session_key=${SESSION_KEY}`,
        );
        cars = latestByDriver(positionRes.data).map((car) => ({
          driver: car.driver_number,
          x: null,
          y: null,
        }));
      } catch {
        console.log("Live data not available:", err.message);
      }
    }

    const scheduleRes = await openF1.get("/sessions");
    const sessions = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
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
    console.log("Race API error:", err.message);

    return res.json({
      isLive: false,
      cars: [],
      race: null,
      trackImage: null,
      message: "Unable to load race data right now.",
    });
  }
});

app.get("/api/calendar", async (req, res) => {
  const requestedYear = Number(req.query.year) || new Date().getFullYear();

  try {
    const response = await openF1.get("/sessions");
    const sessions = Array.isArray(response.data) ? response.data : [];
    const yearSessions = sessions.filter(
      (session) => Number(session.year) === requestedYear,
    );

    res.json({
      year: requestedYear,
      races: normalizeRaceCalendar(yearSessions),
    });
  } catch (err) {
    console.log("Calendar API error:", err.message);

    res.json({
      year: requestedYear,
      races: [],
      message: "Unable to load the race calendar right now.",
    });
  }
});

app.get("/api/location", async (req, res) => {
  try {
    const response = await openF1.get(
      `/location?session_key=${SESSION_KEY}`,
    );

    if (!Array.isArray(response.data) || response.data.length === 0) {
      return res.json([]);
    }

    res.json(
      normalizeCars(response.data).filter(
        (car) => car.x != null && car.y != null,
      ),
    );
  } catch (err) {
    console.log("Location API error:", err.message);
    res.json([]);
  }
});

app.get("/api/cars", async (req, res) => {
  try {
    const response = await openF1.get(
      `/location?session_key=${SESSION_KEY}`,
    );

    res.json(
      normalizeCars(response.data).filter(
        (car) => car.x != null && car.y != null,
      ),
    );
  } catch (err) {
    console.log("Cars API error:", err.message);
    res.json([]);
  }
});

app.get("/api/drivers", async (req, res) => {
  try {
    const response = await openF1.get(
      `/drivers?session_key=${SESSION_KEY}`,
    );

    res.json(Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    console.log("Drivers API error:", err.message);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
