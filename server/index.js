import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import raceRoutes from "./routes/races.js";
import driverRoutes from "./routes/drivers.js";
import { errorHandler, notFoundHandler } from "./utils/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", raceRoutes);
app.use("/api", driverRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
