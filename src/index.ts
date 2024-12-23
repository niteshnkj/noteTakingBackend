import express, { Application, Response, Request } from "express";
import dotenv from "dotenv";
import databaseConfig from "./config/database";
import authRouter from "./routes/auth";
import noteRoute from "./routes/note";
import profileRoute from "./routes/profile"
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://notemaking1405.netlify.app",
    credentials: true,
  })
);
// Use routes
app.use("/api/auth", authRouter);
app.use("/api/note", noteRoute);
app.use("/api/profile",profileRoute);

// Start the server
function server() {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

databaseConfig(server);
