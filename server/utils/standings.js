const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatDriverName = (driver) => {
  const parts = [driver?.givenName, driver?.familyName].filter(Boolean);
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

const countPodiumsByDriver = (races = []) =>
  races.reduce((acc, race) => {
    const results = Array.isArray(race?.Results) ? race.Results : [];

    results.forEach((result) => {
      const finishPosition = toNumberOrNull(
        result.positionOrder || result.position,
      );
      const driverId = result.Driver?.driverId;

      if (!driverId || finishPosition === null || finishPosition > 3) return;

      acc[driverId] = (acc[driverId] || 0) + 1;
    });

    return acc;
  }, {});

export const normalizeDriverStandings = (standingsList, seasonResults = []) => {
  const standings = Array.isArray(standingsList?.DriverStandings)
    ? standingsList.DriverStandings
    : [];
  const podiumCounts = countPodiumsByDriver(seasonResults);

  return standings.map((standing) => {
    const constructors = Array.isArray(standing.Constructors)
      ? standing.Constructors
      : [];
    const primaryConstructor = constructors[constructors.length - 1] || null;
    const driver = normalizeDriver(standing.Driver);

    return {
      rank: toNumberOrNull(standing.position),
      driver,
      driverName: driver.fullName,
      team: normalizeConstructor(primaryConstructor),
      teamName: primaryConstructor?.name || null,
      points: toNumberOrNull(standing.points),
      wins: toNumberOrNull(standing.wins),
      podiums: driver.driverId ? podiumCounts[driver.driverId] ?? 0 : null,
    };
  });
};
