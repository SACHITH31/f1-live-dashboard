export const getCars = async () => {
  const res = await fetch("http://localhost:5000/api/cars")
  return res.json()
}

export const getRace = async () => {
  const res = await fetch("http://localhost:5000/api/race")
  return res.json()
}