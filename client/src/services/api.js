export const getCars = async () => {
  const res = await fetch("http://localhost:5000/api/cars")
  return res.json()
}

export const getRaceData = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/race")

    if (!res.ok) {
      throw new Error("Network response not ok")
    }

    return await res.json()
  } catch (error) {
    console.log("Frontend fetch error:", error.message)
    return null
  }
}