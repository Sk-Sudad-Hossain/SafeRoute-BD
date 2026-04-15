import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import alertRoutes from "./routes/alertRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/", (req, res) => {
  res.send("SafeRoute BD API is running...");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Hardcode 1089 here to override any hidden environment variables
    const PORT = 1089; 
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })