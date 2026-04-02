import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errors } from 'celebrate';
// DB
import { connectMongoDB } from './db/connectMongoDB.js';
// middlewares
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
// routes
import notesRoutes from './routes/notesRoutes.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

//^ General middlewares
app.use(cors());
app.use(logger);
app.use(express.json());

//^ Routs
app.use(notesRoutes);

//^ 404 — якщо маршрут не знайдено
app.use(notFoundHandler);

//^ // обробка помилок від celebrate (валідація)
app.use(errors());

//^ Помилка під час запиту
app.use(errorHandler);

//^ DB Mongo
await connectMongoDB();

//^ Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
