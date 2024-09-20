import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import cors from 'cors';
import http from 'http';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import initSocket from "./socket.js";

import passport from "./config/passport.strategies.js";
import config from "./config.js";
import productsRoutes from "./routes/products.routes.js";
import cartsRoutes from "./routes/carts.routes.js";
import authRoutes from "./routes/auths.routes.js";
import usersRoutes from './routes/users.routes.js'
import uploadsRoutes from './routes/uploads.routes.js'
import errorsHandler from './services/errors/errors.handler.js'
import loggerRoutes from './routes/logger.routes.js'
import addLogger from "./services/logger.js";

const app = express();

const httpServer = http.createServer(app);
initSocket(httpServer);

const corsOptions = {
  origin: true, // Permite cualquier origen
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación Proyecto Final",
      description: "Documentación API Proyecto Final",
    },
  },
  apis: ["../src/docs/**/*.yaml"],
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));




const PORT = config.PORT || 8020;
httpServer.listen(PORT, async () => {
  await mongoose.connect(config.MONGODB_URI);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(config.SECRET));
  app.use(passport.initialize());
  app.use(addLogger);

  app.use("/static", express.static(`${config.DIRNAME}/public`));

  app.use("/api/products", productsRoutes);
  app.use("/api/carts", cartsRoutes);
  app.use("/api/auth", authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/uploads', uploadsRoutes);
  app.use("/", loggerRoutes)


  app.use(errorsHandler);
  console.log(`Servidor activo en http://localhost:${config.PORT}`);
});
