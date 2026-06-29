import axios from "axios";
import { ERGAST_BASE_URL, REQUEST_TIMEOUT_MS } from "../config.js";
import { getOrSetCache } from "../utils/cache.js";

const ergast = axios.create({
  baseURL: ERGAST_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

const getRaceTable = (data, tableName) => {
  const races = data?.MRData?.RaceTable?.Races;
  if (!Array.isArray(races) || races.length === 0) return null;
  return races[0]?.[tableName] ? races[0] : races[0];
};

export const getRaceResults = async (year, round) =>
  getOrSetCache(
    `ergast:results:${year}:${round}`,
    async () => {
      const response = await ergast.get(`/${year}/${round}/results.json`);
      return getRaceTable(response.data, "Results");
    },
    (race) => Array.isArray(race?.Results) && race.Results.length > 0,
  );

export const getQualifyingResults = async (year, round) =>
  getOrSetCache(
    `ergast:qualifying:${year}:${round}`,
    async () => {
      const response = await ergast.get(`/${year}/${round}/qualifying.json`);
      return getRaceTable(response.data, "QualifyingResults");
    },
    (race) =>
      Array.isArray(race?.QualifyingResults) &&
      race.QualifyingResults.length > 0,
  );

export const getDriverStandings = async (year = "current") =>
  getOrSetCache(
    `ergast:driver-standings:${year}`,
    async () => {
      const response = await ergast.get(`/${year}/driverStandings.json`);
      const standingsLists = response.data?.MRData?.StandingsTable?.StandingsLists;
      return Array.isArray(standingsLists) && standingsLists.length > 0
        ? standingsLists[0]
        : null;
    },
    (standings) =>
      Array.isArray(standings?.DriverStandings) &&
      standings.DriverStandings.length > 0,
  );

export const getConstructorStandings = async (year = "current") =>
  getOrSetCache(
    `ergast:constructor-standings:${year}`,
    async () => {
      const response = await ergast.get(`/${year}/constructorStandings.json`);
      const standingsLists = response.data?.MRData?.StandingsTable?.StandingsLists;
      return Array.isArray(standingsLists) && standingsLists.length > 0
        ? standingsLists[0]
        : null;
    },
    (standings) =>
      Array.isArray(standings?.ConstructorStandings) &&
      standings.ConstructorStandings.length > 0,
  );

export const getSeasonResults = async (year = "current") =>
  getOrSetCache(
    `ergast:season-results:${year}`,
    async () => {
      const response = await ergast.get(`/${year}/results.json?limit=2000`);
      const races = response.data?.MRData?.RaceTable?.Races;
      return Array.isArray(races) ? races : [];
    },
    (races) => Array.isArray(races) && races.length > 0,
  );
