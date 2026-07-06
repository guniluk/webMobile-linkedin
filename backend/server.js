import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/lib/connectDB.js";
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";
import postRoutes from "./src/routes/post.route.js";
import notificationRoutes from "./src/routes/notification.route.js";
import connectionRoutes from "./src/routes/connection.route.js";

const app = express();

app.use(
  express.json({
    limit: "5mb",
  }),
);
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/connection", connectionRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
