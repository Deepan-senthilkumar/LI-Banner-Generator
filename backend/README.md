# Backend API Scaffolding

This directory contains the structure for the future backend API of the LinkedIn Banner Generator.

## Purpose

Currently, the frontend uses a `service` layer with local storage mocking. This backend folder is designed to receive the migration to a real Node.js/Express or Python/FastAPI server.

## Structure

- `controllers/`: Request handlers (logic).
- `routes/`: API route definitions.
- `models/`: Database schemas (e.g., Mongoose or SQL).
- `middleware/`: Auth verification, error handling.

## Intended API Endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Templates

- `GET /api/templates`
