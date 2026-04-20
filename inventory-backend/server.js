

// app.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";  

import helmet from "helmet";
import morgan from "morgan";
import cron from "node-cron";
import automationService from "./services/automationService.js";

dotenv.config();

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet()); 
app.use(cors());
app.use(morgan("dev"));  


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/api/auth", authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});



cron.schedule("*/5 * * * *", async () => {
  try {
    // console.log("⏲ Checking follow-ups...");
    await automationService.checkFollowUps();
    
  } catch (err) {
    console.error("Follow-ups cron job failed:", err);
  }
});

cron.schedule("*/10 * * * *", async () => {
  try {
    // console.log("⏲ Checking escalations...");
    await automationService.checkEscalations();
  } catch (err) {
    console.error("Escalations cron job failed:", err);
  }
});



app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'uploads')}`);
});

export default app;



