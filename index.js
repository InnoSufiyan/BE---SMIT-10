import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/default.js";
import { authRoutes } from "./routes/auth.js";
import { jobAdRoutes } from "./routes/jobAd.js";

const PORT = 5000;

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/jobAd", jobAdRoutes);

app.get("/", (request, response) => {
    response.send("Hello World");
});


app.listen(PORT, () => {
    console.log(`Server is Running at http://localhost:${PORT}`);
});
