export const getCars = async () => {
  const res = await fetch("http://localhost:5000/api/cars")
  return res.json()
}

export const getRaceData = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/race")

    if (!res.ok) {
      throw new Error("API failed")
    }

    const data = await res.json()
    return data

  } catch (err) {
    console.log("Frontend API Error:", err)
    return null
  }
}