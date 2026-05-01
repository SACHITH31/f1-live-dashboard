const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

const requestJson = async (path, fallback) => {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`);

    if (!res.ok) {
      throw new Error(`API request failed with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.log(`Frontend API error for ${path}:`, err);
    return fallback;
  }
};

export const getCars = async () => requestJson("/api/cars", []);

export const getRaceData = async () => requestJson("/api/race", null);

export const getLocations = async () => requestJson("/api/location", []);

export const getDrivers = async () => requestJson("/api/drivers", []);
