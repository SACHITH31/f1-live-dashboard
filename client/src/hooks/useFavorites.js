import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "f1-live-dashboard-favorites";

const readFavorites = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      drivers: Array.isArray(stored.drivers) ? stored.drivers : [],
      teams: Array.isArray(stored.teams) ? stored.teams : [],
    };
  } catch {
    return { drivers: [], teams: [] };
  }
};

function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const actions = useMemo(
    () => ({
      isFavoriteDriver: (driverNumber) =>
        favorites.drivers.includes(Number(driverNumber)),
      isFavoriteTeam: (teamName) => favorites.teams.includes(teamName),
      toggleDriver: (driverNumber) => {
        const normalized = Number(driverNumber);
        setFavorites((current) => ({
          ...current,
          drivers: current.drivers.includes(normalized)
            ? current.drivers.filter((item) => item !== normalized)
            : [...current.drivers, normalized],
        }));
      },
      toggleTeam: (teamName) => {
        if (!teamName) return;

        setFavorites((current) => ({
          ...current,
          teams: current.teams.includes(teamName)
            ? current.teams.filter((item) => item !== teamName)
            : [...current.teams, teamName],
        }));
      },
    }),
    [favorites],
  );

  return { favorites, ...actions };
}

export default useFavorites;
