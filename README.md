# To-Do List Backend

A REST API for managing tasks, searching them, and summarising open and completed work by week (Monday to Sunday) for the home screen of the To-Do List app.

## Live demo

- **API base URL:** https://todo-backend-96t1.onrender.com/api
- **Health check:** https://todo-backend-96t1.onrender.com/health
- **Frontend app:** https://todo-frontend-1.netlify.app

The API runs on a free Render instance that sleeps when idle, so the first request can take around 30 seconds.

## Tech stack

Node.js · Express · MongoDB · Redis · Winston · Joi · Luxon

## Getting started

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

API runs at `http://localhost:5000`. The seed step is optional and adds sample tasks across a few weeks.

MongoDB 5.0 or newer is required for the weekly summary. MongoDB Atlas works fine.

## Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string for caching (optional, the API works without it) |
| `PORT` | Server port (default `5000`) |
| `CLIENT_ORIGIN` | Allowed origin URL for CORS (default `*`) |
| `NODE_ENV` | `development` or `production` |
| `LOG_LEVEL` | Winston log level (default `info`) |

## Endpoints

Base path is `/api`. A health check is available at `GET /health`.

| Endpoint | Description |
|---|---|
| `POST /api/tasks` | Create a task |
| `GET /api/tasks` | Paginated, filtered list of tasks |
| `GET /api/tasks/search?q=keyword` | Search tasks by title and description |
| `GET /api/tasks/weeks?tz=Asia/Kolkata` | Weekly cards with open and completed counts |
| `GET /api/tasks/weeks/:date` | All tasks in the week that contains `date` (`YYYY-MM-DD`) |
| `GET /api/tasks/:id` | Get a single task |
| `PUT /api/tasks/:id` | Edit a task |
| `PATCH /api/tasks/:id` | Edit a task (same as PUT) |
| `PATCH /api/tasks/:id/status` | Mark a task `completed` or `in_progress` |
| `DELETE /api/tasks/:id` | Delete a task |

**Task fields:** `title` (required), `dateTime` (required, ISO 8601), `description`, `endDateTime`, `priority` (`low`, `medium`, `high`), `status` (`in_progress`, `completed`)

**List filters:** `status, priority, from, to, page, limit`

**Week endpoints:** pass `tz` with an IANA timezone such as `Asia/Kolkata` so weeks are cut at midnight in the user's timezone (default `UTC`). `/weeks/:date` also accepts `status`.

### Try it

```bash
curl https://todo-backend-96t1.onrender.com/health

curl "https://todo-backend-96t1.onrender.com/api/tasks/weeks?tz=Asia/Kolkata"
```

### Sample request

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Design review",
  "description": "Go through the new home screen",
  "dateTime": "2026-10-06T10:00:00.000Z",
  "priority": "high"
}
```

### Sample response

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "6710a1f2c3d4e5f6a7b8c9d0",
    "title": "Design review",
    "description": "Go through the new home screen",
    "dateTime": "2026-10-06T10:00:00.000Z",
    "endDateTime": null,
    "priority": "high",
    "status": "in_progress",
    "completedAt": null
  }
}
```

Validation errors return status `422` with an `errors` array. Unknown ids return `404`.

## Features

**Security**
- Protected HTTP headers and configurable CORS policy
- Input validation on every request body, query and id
- Rate limiting to prevent abuse, with a stricter limit on the weekly summary
- No credentials or secrets stored in code

**Performance**
- Database indexing on date, status and creation time
- Redis caching on read endpoints, cleared automatically after every create, edit, status change or delete
- Weekly counts computed in a single database aggregation

**Scalability**
- Stateless design, ready to run across multiple instances
- Connection pooling for efficient database usage
- Paginated responses to keep payloads lightweight

**Reliability**
- Centralized, consistent error handling across all endpoints
- Structured logging for easier debugging and monitoring
- Graceful fallback if the cache is unavailable, requests simply go to the database
- Graceful shutdown on `SIGTERM`

## Deployment

The API is deployed on Render with MongoDB Atlas and a cloud Redis instance. Build command is `npm install` and start command is `node src/server.js`. Set `MONGO_URI`, `REDIS_URL`, `NODE_ENV=production` and `CLIENT_ORIGIN` (the frontend URL) in the environment settings.

## Project structure

```
src/
  config/       Database and cache configuration
  models/       Data schemas
  routes/       API endpoints
  controllers/  Request handling
  services/     Business logic
  validation/   Request schemas
  middleware/   Validation, caching, rate limiting, error handling
  utils/        Logger, response helper, API error class
  scripts/      Database seeding
```