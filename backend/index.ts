import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { rateLimit } from "express-rate-limit";
import http from "http";
import { Server, Socket } from "socket.io";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

// Import middleware
import errorHandler from "./middleware/error";

// Import routers
import authRouter from "./routes/auth";
import activityRouter from "./routes/activity";
import itineraryProtectedRouter from "./routes/itineraryProtected";
import itineraryPublicRouter from "./routes/itineraryPublic";
import placeRouter from "./routes/place";
import userRouter from "./routes/user";
import profileRouter from "./routes/profile";
import chatRouter from "./routes/chat";

// Import socket
import { setupSocket } from "./services/websocket-server";
import { createMessage } from "./services/chat";

const port = process.env.PORT || 4000;
const app = express();

app.use(cors({ origin: "*" }));

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

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "./routes/*.ts")],
};

const swaggerSpec = swaggerJSDoc(options);

// Setup public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// WARNING: This is a security risk. Do not use this in production
app.use(cors({ origin: "*" }));

// Middlewares
app.use(errorHandler);
app.use(cookieParser());

// API Routes
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRouter);
app.use("/api/activity", activityRouter);
app.use("/api/itinerary", itineraryProtectedRouter);
app.use("/api/public/itinerary", itineraryPublicRouter);
app.use("/api/place", limiter, placeRouter);
app.use("/api/user", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chat", chatRouter);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch-all route to serve the React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// the check is needed for testing
// refer to https://stackoverflow.com/a/63299022
if (process.env.NODE_ENV !== "test") {
  const server = http.createServer(app);
  // socket io
  // setupSocket(server);
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for now
      methods: ["GET", "POST"],
    },
  });

  // sequelize.sync().then(() => {
  server.listen(Number(port), "0.0.0.0", () => {
    console.log(`[server]: Server is running at ${port}`);
    console.log(
      `[server]: Swagger docs available at http://localhost:${port}/docs`
    );
  });

  // });
  const rooms: Record<string, Set<string>> = {};
  io.on("connection", (socket: Socket) => {
    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId); // Join room with the given roomId

      // Add to room trackingF
      if (!rooms[roomId]) {
        rooms[roomId] = new Set();
      }
      rooms[roomId].add(socket.id);
    });

    socket.on(
      "sendMessage",
      async (roomId: string, userId: string, message: string) => {
        const createdChatMessage = await createMessage(
          Number(userId),
          Number(roomId),
          message
        );
        io.to(roomId).emit("receiveMessage", createdChatMessage);
      }
    );

    socket.on("disconnect", () => {
      // Remove the user from the rooms
      for (const roomId in rooms) {
        if (rooms[roomId].has(socket.id)) {
          rooms[roomId].delete(socket.id);
          console.log(`Socket ${socket.id} left room ${roomId}`);
        }
      }

      console.log(`Socket ${socket.id} disconnected`);
    });
  });
}

if (process.env.NODE_ENV === "test") {
  // sequelize.sync({ force: false})
}
// export default app;
