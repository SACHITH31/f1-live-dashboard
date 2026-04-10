export const getCars = async () => {
  const res = await fetch("http://localhost:5000/api/cars")
  return res.json()
}