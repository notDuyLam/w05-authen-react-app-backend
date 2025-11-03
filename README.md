# JWT Auth Backend (Express)

Stateful refresh tokens in memory for a React client (Axios/React Query/Hook Form).

## Setup

1. Copy `.env.example` to `.env` and change secrets if desired.
2. Install deps: `npm install`
3. Run dev: `npm run dev` (listens on `http://localhost:4000`)

Demo user:

- Email: `demo@example.com`
- Password: `password123`

## API

### POST /auth/login

Body: `{ "email": string, "password": string }`
Response: `{ accessToken, refreshToken, user }`

### POST /auth/refresh

Body: `{ "refreshToken": string }`
Response: `{ accessToken, refreshToken }` (rotated)

### POST /auth/logout

Body: `{ "refreshToken": string }`
Response: `204 No Content`

### GET /me

Headers: `Authorization: Bearer <accessToken>`
Response: `{ id, email, name }`

## Notes

- CORS allows `http://localhost:5173`.
- Access token: memory on client; Refresh token: localStorage on client.
- On 401 from protected calls, attempt `/auth/refresh`; if that fails, logout client.
