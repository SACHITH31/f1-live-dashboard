const store = new Map();

export const getCache = (key) => store.get(key);

export const setCache = (key, value) => {
  store.set(key, value);
  return value;
};

export const getOrSetCache = async (key, loader, shouldCache = Boolean) => {
  try {
    const value = await loader();
    if (shouldCache(value)) {
      setCache(key, value);
    }
    return value;
  } catch (err) {
    if (store.has(key)) return store.get(key);
    throw err;
  }
};
