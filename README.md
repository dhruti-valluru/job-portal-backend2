# Job Portal Backend API

Beginner-friendly backend mini project based on the provided Job Portal Backend requirements.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- httpOnly cookies
- Postman
- dotenv

## Setup

1. Install Node.js and MongoDB.
2. Open this project in VS Code.
3. Run:

```bash
npm install
```

4. Create a `.env` file from `.env.example`.
5. Put your MongoDB connection string in `DB_URL`.
6. Put a secret value in `JWT_SECRET`.
7. Start the server:

```bash
npm run dev
```

The server runs on `http://localhost:3000` by default.

## Main API routes

### User

- POST `/user-api/register`
- POST `/user-api/login`
- GET `/user-api/profile`
- PUT `/user-api/profile`
- POST `/user-api/logout`

### Jobs

- GET `/job-api/jobs`
- GET `/job-api/jobs/:jobId`
- POST `/job-api/jobs` - Employer
- GET `/job-api/my-jobs` - Employer
- GET `/job-api/my-jobs/:jobId` - Employer
- PUT `/job-api/jobs/:jobId` - Employer
- DELETE `/job-api/jobs/:jobId` - Employer

### Applications

- POST `/application-api/applications` - Job Seeker
- GET `/application-api/my-applications` - Job Seeker
- GET `/application-api/my-applications/:applicationId` - Job Seeker
- GET `/application-api/employer-applications` - Employer
- PUT `/application-api/applications/:applicationId/status` - Employer

### Admin

- GET `/admin-api/users`
- GET `/admin-api/users/:userId`
- PUT `/admin-api/users/:userId/status`
- DELETE `/admin-api/users/:userId`
- GET `/admin-api/jobs`
- GET `/admin-api/jobs/:jobId`
- DELETE `/admin-api/jobs/:jobId`
- GET `/admin-api/summary`

## Database relationships

Job -> User (Employer)

Application -> Job

Application -> User (Job Seeker)

User contains embedded education documents and a list of skills.

## Important note about Admin

Public registration allows only `jobseeker` and `employer`. An admin should be created manually in the database for development/testing instead of allowing anyone to register as admin.

## GitHub

Do not commit `.env` or `node_modules`. The `.gitignore` file is already included.
