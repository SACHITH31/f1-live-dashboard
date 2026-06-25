const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatDriverName = (driver) => {
  if (!driver) return null;
  const parts = [driver.givenName, driver.familyName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
};

const normalizeDriver = (driver) => ({
  driverId: driver?.driverId || null,
  code: driver?.code || driver?.permanentNumber || null,
  fullName: formatDriverName(driver),
  nationality: driver?.nationality || null,
});

const normalizeConstructor = (constructor) => ({
  constructorId: constructor?.constructorId || null,
  name: constructor?.name || null,
  nationality: constructor?.nationality || null,
});

const getDriverResultName = (result) => formatDriverName(result?.Driver);

const getFastestLapResult = (results = []) =>
  results.find((result) => result?.FastestLap?.rank === "1") || null;

const getRaceTotalLaps = (results = []) => {
  const lapCounts = results
    .map((result) => toNumberOrNull(result.laps))
    .filter((laps) => laps !== null);

  if (lapCounts.length === 0) return null;
  return Math.max(...lapCounts);
};

const normalizeRaceDate = (race) => {
  if (!race?.date) return null;
  return race.time ? `${race.date}T${race.time}` : race.date;
};

export const normalizeCompletedRaceData = ({
  raceResult,
  qualifyingResult,
  session,
}) => {
  const results = Array.isArray(raceResult?.Results) ? raceResult.Results : [];
  const qualifyingResults = Array.isArray(qualifyingResult?.QualifyingResults)
    ? qualifyingResult.QualifyingResults
    : [];

  if (results.length === 0) {
    return {
      raceOverview: null,
      raceClassification: [],
      dataQuality: {
        source: null,
        complete: false,
        notes: ["Completed race results are unavailable."],
      },
    };
  }

  const podium = [1, 2, 3].map((position) => {
    const result = results.find(
      (item) => toNumberOrNull(item.position) === position,
    );
    return result
      ? {
          position,
          driver: normalizeDriver(result.Driver),
          team: normalizeConstructor(result.Constructor),
        }
      : null;
  });
  const winner = podium[0]?.driver || null;
  const poleResult =
    qualifyingResults.find((item) => toNumberOrNull(item.position) === 1) ||
    null;
  const fastestLapResult = getFastestLapResult(results);
  const winnerResult = results.find(
    (item) => toNumberOrNull(item.positionOrder || item.position) === 1,
  );

  const raceOverview = {
    grandPrixName: raceResult?.raceName || null,
    officialCircuitName: raceResult?.Circuit?.circuitName || null,
    country:
      raceResult?.Circuit?.Location?.country || session?.country_name || null,
    raceDate: normalizeRaceDate(raceResult) || session?.date_start || null,
    winner,
    podium,
    polePosition: poleResult ? normalizeDriver(poleResult.Driver) : null,
    fastestLapDriver: fastestLapResult
      ? normalizeDriver(fastestLapResult.Driver)
      : null,
    fastestLapTime: fastestLapResult?.FastestLap?.Time?.time || null,
    totalLaps: getRaceTotalLaps(results),
    raceDistance: null,
    raceDuration: winnerResult?.Time?.time || null,
  };

  const raceClassification = results
    .map((result) => {
      const finishPosition = toNumberOrNull(
        result.positionOrder || result.position,
      );
      const position = toNumberOrNull(result.position);

      return {
        position,
        driver: normalizeDriver(result.Driver),
        driverName: getDriverResultName(result),
        team: normalizeConstructor(result.Constructor),
        teamName: result.Constructor?.name || null,
        gridPosition: toNumberOrNull(result.grid),
        finishPosition,
        points: toNumberOrNull(result.points),
        status: result.status || null,
        gapToLeader: finishPosition === 1 ? null : result.Time?.time || null,
      };
    })
    .sort((a, b) => {
      if (a.finishPosition === null) return 1;
      if (b.finishPosition === null) return -1;
      return a.finishPosition - b.finishPosition;
    });

  return {
    raceOverview,
    raceClassification,
    dataQuality: {
      source: "ergast-compatible",
      complete: true,
      notes: raceOverview.raceDistance
        ? []
        : ["Race distance is null because the upstream result does not verify it."],
    },
  };
};

export const deriveRaceRound = (sessions = [], session) => {
  if (!session?.session_key || !session?.year) return null;

  const raceSessions = sessions
    .filter(
      (item) =>
        Number(item.year) === Number(session.year) &&
        item.session_name?.toLowerCase() === "race",
    )
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

  const index = raceSessions.findIndex(
    (item) => String(item.session_key) === String(session.session_key),
  );

  if (index === -1) return null;

  return {
    year: Number(session.year),
    round: index + 1,
  };
};
