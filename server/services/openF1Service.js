import axios from "axios";
import {
  OPENF1_BASE_URL,
  REQUEST_TIMEOUT_MS,
  SESSION_KEY,
} from "../config.js";
import { getOrSetCache } from "../utils/cache.js";

const openF1 = axios.create({
  baseURL: OPENF1_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

export const openF1Get = async (path) => {
  const response = await openF1.get(path);
  return response.data;
};

export const safeOpenF1Get = async (path, fallback = []) => {
  try {
    const data = await openF1Get(path);
    return Array.isArray(data) ? data : fallback;
  } catch (err) {
    console.log(`OpenF1 optional fetch failed for ${path}:`, err.message);
    return fallback;
  }
};

export const safeOpenF1GetAny = async (paths, fallback = []) => {
  for (const path of paths) {
    const data = await safeOpenF1Get(path, null);
    if (Array.isArray(data) && data.length > 0) return data;
  }

  return fallback;
};

export const getSessions = async () =>
  getOrSetCache("openf1:sessions", async () => {
    const data = await openF1Get("/sessions");
    return Array.isArray(data) ? data : [];
  }, (sessions) => Array.isArray(sessions) && sessions.length > 0);

export const getMeetings = async () =>
  getOrSetCache("openf1:meetings", async () => {
    const data = await openF1Get("/meetings");
    return Array.isArray(data) ? data : [];
  }, (meetings) => Array.isArray(meetings) && meetings.length > 0);

export const getCurrentLocation = async () =>
  openF1Get(`/location?session_key=${SESSION_KEY}`);

export const getCurrentPositions = async () =>
  openF1Get(`/positions?session_key=${SESSION_KEY}`);

export const getCurrentDrivers = async () =>
  openF1Get(`/drivers?session_key=${SESSION_KEY}`);
