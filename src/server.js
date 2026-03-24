import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT ?? 3000;

//: General middlewares
app.use(express.json());
app.use(cors());

//: Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//: GET
// notes

app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
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

// ^ Обробка помилок

app.get('/test-error', (req, res) => {
  throw new Error('Simulated server error');
});

app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isProd
      ? 'Someting went wrong. Please try again later'
      : err.message,
  });
});

// ^ Mid-re 404 (після всіх маршрутів)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
