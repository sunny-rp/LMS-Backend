import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./DB/db.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import bookRoutes from "./routes/book.routes.js";
import borrowRoutes from "./routes/borrow.router.js";
import expressFileUpload from "express-fileupload";
import userRoutes from "./routes/user.routes.js";

export const app = express();

config({ path: "./config/config.env" });

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressFileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/borrow", borrowRoutes);
app.use("/api/v1/user", userRoutes);

connectDB();

app.use(errorMiddleware);
