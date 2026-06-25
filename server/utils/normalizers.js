import { SESSION_KEY } from "../config.js";

export const latestByDriver = (items = []) =>
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

export const normalizeCars = (items = []) =>
  latestByDriver(items).map((car) => ({
    driver: car.driver_number,
    x: car.x ?? null,
    y: car.y ?? null,
  }));

export const findSessionForLiveData = (sessions = []) => {
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

export const findNextRace = (sessions = []) => {
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

export const normalizeRaceCalendar = (sessions = []) => {
  const now = new Date();

  return [...sessions]
    .filter((session) => session.session_name?.toLowerCase() === "race")
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

export const normalizeSession = (session) => {
  if (!session) return null;

  const now = new Date();
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
};

export const formatLapTime = (seconds) => {
  if (seconds == null) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${minutes}:${remainingSeconds}`;
};

export const summarizeDrivers = (drivers = []) =>
  drivers.map((driver) => ({
    driverNumber: driver.driver_number,
    fullName: driver.full_name,
    nameAcronym: driver.name_acronym,
    teamName: driver.team_name,
    teamColour: driver.team_colour,
    countryCode: driver.country_code,
    headshotUrl: driver.headshot_url,
  }));

export const buildRaceSummary = ({
  drivers = [],
  positions = [],
  laps = [],
  pits = [],
  stints = [],
  weather = [],
  raceControl = [],
}) => {
  const driverMap = new Map(
    drivers.map((driver) => [driver.driver_number, driver]),
  );
  let latestPositions = latestByDriver(positions)
    .filter((item) => item.position != null)
    .sort((a, b) => a.position - b.position)
    .map((item) => {
      const driver = driverMap.get(item.driver_number);

      return {
        position: item.position,
        driverNumber: item.driver_number,
        fullName: driver?.full_name || `Driver ${item.driver_number}`,
        nameAcronym: driver?.name_acronym || String(item.driver_number),
        teamName: driver?.team_name || "Unknown team",
        teamColour: driver?.team_colour || null,
      };
    });

  const lapSummary = Object.values(
    laps.reduce((acc, lap) => {
      const driverNumber = lap.driver_number;
      if (!driverNumber) return acc;

      if (!acc[driverNumber]) {
        const driver = driverMap.get(driverNumber);
        acc[driverNumber] = {
          driverNumber,
          fullName: driver?.full_name || `Driver ${driverNumber}`,
          teamName: driver?.team_name || "Unknown team",
          lapCount: 0,
          bestLapDuration: null,
          bestLapNumber: null,
        };
      }

      acc[driverNumber].lapCount += 1;

      if (
        lap.lap_duration != null &&
        (acc[driverNumber].bestLapDuration == null ||
          lap.lap_duration < acc[driverNumber].bestLapDuration)
      ) {
        acc[driverNumber].bestLapDuration = lap.lap_duration;
        acc[driverNumber].bestLapNumber = lap.lap_number;
      }

      return acc;
    }, {}),
  )
    .map((item) => ({
      ...item,
      bestLapText: formatLapTime(item.bestLapDuration),
    }))
    .sort((a, b) => {
      if (a.bestLapDuration == null) return 1;
      if (b.bestLapDuration == null) return -1;
      return a.bestLapDuration - b.bestLapDuration;
    });

  if (latestPositions.length === 0 && lapSummary.length > 0) {
    latestPositions = [...lapSummary]
      .sort((a, b) => {
        if (b.lapCount !== a.lapCount) return b.lapCount - a.lapCount;
        if (a.bestLapDuration == null) return 1;
        if (b.bestLapDuration == null) return -1;
        return a.bestLapDuration - b.bestLapDuration;
      })
      .map((item, index) => ({
        position: index + 1,
        driverNumber: item.driverNumber,
        fullName: item.fullName,
        nameAcronym:
          driverMap.get(item.driverNumber)?.name_acronym ||
          String(item.driverNumber),
        teamName: item.teamName,
        teamColour: driverMap.get(item.driverNumber)?.team_colour || null,
        source: "lap-summary",
      }));
  }

  const pitSummary = Object.values(
    pits.reduce((acc, pit) => {
      const driverNumber = pit.driver_number;
      if (!driverNumber) return acc;

      if (!acc[driverNumber]) {
        const driver = driverMap.get(driverNumber);
        acc[driverNumber] = {
          driverNumber,
          fullName: driver?.full_name || `Driver ${driverNumber}`,
          teamName: driver?.team_name || "Unknown team",
          stops: 0,
          totalDuration: 0,
        };
      }

      acc[driverNumber].stops += 1;
      acc[driverNumber].totalDuration += Number(pit.pit_duration) || 0;
      return acc;
    }, {}),
  )
    .map((item) => ({
      ...item,
      totalDurationText:
        item.totalDuration > 0 ? `${item.totalDuration.toFixed(1)}s` : "TBD",
    }))
    .sort((a, b) => b.stops - a.stops || a.driverNumber - b.driverNumber);

  const stintSummary = Object.values(
    stints.reduce((acc, stint) => {
      const driverNumber = stint.driver_number;
      if (!driverNumber) return acc;

      if (!acc[driverNumber]) {
        const driver = driverMap.get(driverNumber);
        acc[driverNumber] = {
          driverNumber,
          fullName: driver?.full_name || `Driver ${driverNumber}`,
          teamName: driver?.team_name || "Unknown team",
          compounds: [],
        };
      }

      if (
        stint.compound &&
        !acc[driverNumber].compounds.includes(stint.compound)
      ) {
        acc[driverNumber].compounds.push(stint.compound);
      }

      return acc;
    }, {}),
  ).sort((a, b) => a.driverNumber - b.driverNumber);

  const latestWeather =
    weather
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;

  const weatherSummary = latestWeather
    ? {
        airTemperature: latestWeather.air_temperature,
        trackTemperature: latestWeather.track_temperature,
        humidity: latestWeather.humidity,
        rainfall: latestWeather.rainfall,
        windSpeed: latestWeather.wind_speed,
      }
    : null;

  const raceControlMessages = [...raceControl]
    .filter((item) => item.message || item.flag || item.category)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20)
    .map((item) => ({
      date: item.date,
      category: item.category,
      flag: item.flag,
      lapNumber: item.lap_number,
      message: item.message,
      scope: item.scope,
    }));

  return {
    drivers: summarizeDrivers(drivers),
    finalClassification: latestPositions,
    fastestLaps: lapSummary.slice(0, 10),
    lapSummary,
    pitSummary,
    stintSummary,
    weatherSummary,
    raceControlMessages,
  };
};
