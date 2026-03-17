# Notes API

A simple REST API built with **Express.js** for managing notes.

## Stack

- **Express** — web framework
- **pino-http** — HTTP request logging
- **cors** — Cross-Origin Resource Sharing
- **dotenv** — environment variable management

## Getting Started

```bash
npm install
npm start
```

The server runs on `http://localhost:3000` by default.

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
```

## Endpoints

| Method | Path             | Description                        |
| ------ | ---------------- | ---------------------------------- |
| `GET`  | `/notes`         | Get all notes                      |
| `GET`  | `/notes/:noteId` | Get a note by ID                   |
| `GET`  | `/test-error`    | Simulate a server error (dev only) |

## Error Handling

- **404** — returned for any unknown route
- **500** — in `production` mode returns a generic message; in `development` mode returns the actual error
