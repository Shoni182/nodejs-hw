import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Міддлвер для парсингу JSON
app.use(express.json());

// Міддлвер для CORS
app.use(cors());

// Для логування запитів
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statudCode} - {responseTime}ms',
        hodeObject: true,
      },
    },
  }),
);
//
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello world1' });
});

//: Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//: GET
// notes

app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retieved all notes',
  });
});

// note ID

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  const id_param = noteId;
  res.status(200).json({
    message: `Retrieved note with ID: ${id_param}`,
  });
});

// обробка JSON

// app.post('notes', (req, res) => {
//   res.status(200).json({
//     message: 'Note created',
//   });
// });

// ^ Mid-re 404 (після всіх маршрутів)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ^ Обробка помилок

app.get('/test-error', (req, res) => {
  throw new Error('Simulated server error');
});

app.use((err, req, res, next) => {
  const isProd = procces.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isProd
      ? 'Someting went wrong. Please try again later'
      : err.message,
  });
});
