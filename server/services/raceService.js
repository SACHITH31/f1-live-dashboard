import {
  getMeetings,
  getSessions,
  safeOpenF1Get,
  safeOpenF1GetAny,
} from "./openF1Service.js";
import { getQualifyingResults, getRaceResults } from "./ergastService.js";
import {
  buildRaceSummary,
  normalizeSession,
} from "../utils/normalizers.js";
import {
  deriveRaceRound,
  normalizeCompletedRaceData,
} from "../utils/raceResults.js";

export const findTrackImage = async (race) => {
  if (!race?.circuit_short_name) return null;

  const meetings = await getMeetings();
  const meeting = meetings.find(
    (item) =>
      item.circuit_short_name?.toLowerCase() ===
      race.circuit_short_name.toLowerCase(),
  );

  return meeting?.circuit_image ? decodeURIComponent(meeting.circuit_image) : null;
};

export const getRaceDetailPayload = async (sessionKey) => {
  const sessions = await getSessions();
  const session = sessions.find(
    (item) => String(item.session_key) === String(sessionKey),
  );

  if (!session) {
    return {
      race: null,
      weekendSessions: [],
      trackImage: null,
      message: "Race details were not found.",
    };
  }

  const weekendSessions = sessions
    .filter((item) => item.meeting_key === session.meeting_key)
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
    .map(normalizeSession);

  let trackImage = null;
  try {
    trackImage = await findTrackImage(session);
  } catch (err) {
    console.log("Race detail track image error:", err.message);
  }

  const [drivers, positions, laps, pits, stints, weather, raceControl] =
    await Promise.all([
      safeOpenF1Get(`/drivers?session_key=${sessionKey}`),
      safeOpenF1GetAny([
        `/position?session_key=${sessionKey}`,
        `/positions?session_key=${sessionKey}`,
      ]),
      safeOpenF1Get(`/laps?session_key=${sessionKey}`),
      safeOpenF1Get(`/pit?session_key=${sessionKey}`),
      safeOpenF1Get(`/stints?session_key=${sessionKey}`),
      safeOpenF1Get(`/weather?session_key=${sessionKey}`),
      safeOpenF1Get(`/race_control?session_key=${sessionKey}`),
    ]);

  let completedRaceData = {
    raceOverview: null,
    raceClassification: [],
    dataQuality: null,
  };
  const normalizedSession = normalizeSession(session);

  if (normalizedSession?.status === "completed") {
    const raceRound = deriveRaceRound(sessions, session);

    if (raceRound) {
      try {
        const [raceResult, qualifyingResult] = await Promise.all([
          getRaceResults(raceRound.year, raceRound.round),
          getQualifyingResults(raceRound.year, raceRound.round).catch((err) => {
            console.log("Qualifying result fetch error:", err.message);
            return null;
          }),
        ]);

        completedRaceData = normalizeCompletedRaceData({
          raceResult,
          qualifyingResult,
          session,
        });
      } catch (err) {
        console.log("Completed race result fetch error:", err.message);
      }
    }
  }

  return {
    race: normalizedSession,
    weekendSessions,
    trackImage,
    details: {
      ...buildRaceSummary({
        drivers,
        positions,
        laps,
        pits,
        stints,
        weather,
        raceControl,
      }),
      ...completedRaceData,
    },
  };
};
