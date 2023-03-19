import express, { RequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import json2xls from "json2xls";
import { apiRoutes } from "./routes";
import { logger, accessSuccessLogger, accessErrorLogger } from "./utils/logger";
import rateLimit from "express-rate-limit";

const app = express();

// register loggers
app.use(accessSuccessLogger);
app.use(accessErrorLogger);

const ALLOWED_ORIGINS = new RegExp(process.env.ALLOWED_ORIGINS || "");

app.use(
  cors({
    credentials: true,
    origin: ALLOWED_ORIGINS,
  })
);

app.use(cookieParser("CookieSecret"));
app.disable("x-powered-by");
app.use(express.json({ limit: "50mb" }) as RequestHandler);
app.use(express.urlencoded({ extended: true }) as RequestHandler);
app.use(json2xls.middleware);

/**
 * Rate limiter to make the limited request in particular time for manual api routes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "You exceeded 100 requests in 15 minutes limit!",
});

app.use("/api/v1", apiRoutes);

// global error handler
app.use(async (err, _req, res, next) => {
  logger.error(err.stack);
  // if (err.code === TIMEOUT_ERROR_CODE) {
  // await sendSlackAlert(err, 'GLOBAL-ERROR-HANDLER', true, false, 'down-time-bot');
  // }
  res.status(500).json("Ouch! Something broke!");
  next();
});

export default app;
