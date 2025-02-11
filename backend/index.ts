import express, { Express, Request, Response } from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

// Import middleware
import errorHandler from "./middleware/error";

// Import routers
import authRouter from "./routes/auth";
import activityRouter from "./routes/activity";
import itineraryProtectedRouter from "./routes/itineraryProtected";
import itineraryPublicRouter from "./routes/itineraryPublic";

const port = process.env.PORT || 4000;
const app = express();

// Set up options
var allowedDomains = ["http://localhost:4000"];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

// Swagger options
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express API for Wanderers",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "./routes/*.ts")],
};

const swaggerSpec = swaggerJSDoc(options);

// Setup public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));

// Middlewares
app.use(errorHandler);
app.use(cookieParser());

// API Routes
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRouter);
app.use("/api/activity", activityRouter);
app.use("/api/itinerary", itineraryProtectedRouter);
app.use("/api/public/itinerary", itineraryPublicRouter);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch-all route to serve the React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// the check is needed for testing
// refer to https://stackoverflow.com/a/63299022
if (process.env.NODE_ENV !== "test") {
  // sequelize.sync().then(() => {
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`[server]: Server is running at ${port}`);
    console.log(
      `[server]: Swagger docs available at http://localhost:${port}/docs`,
    );
  });
  // });
}

if (process.env.NODE_ENV === "test") {
  // sequelize.sync({ force: false})
}
export default app;
