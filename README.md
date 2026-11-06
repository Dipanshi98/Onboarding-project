# Employee Onboarding Management System

A full-stack employee onboarding application with a Spring Boot and PostgreSQL backend, a React web portal, and an Expo React Native mobile app.

## Project Overview

The system helps HR administrators register employees, manage onboarding steps, track joining formalities, and confirm when onboarding is complete. The mobile app lets an employee view and update their onboarding progress.

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot, Spring Data JPA, Maven |
| Database | PostgreSQL |
| Web frontend | React 19, TypeScript, Vite |
| Mobile app | React Native, Expo, TypeScript |
| Web end-to-end testing | Playwright |
| Backend testing | Maven tests with an H2 in-memory test database |

## Repository Structure

```text
Onboarding-project/
├── backend/
│   └── onboarding/          # Spring Boot application
├── frontend/
│   ├── web/                 # React + TypeScript web portal
│   └── mobile/              # Expo React Native app
└── README.md
```

## Main Features

### Web portal
- Register and view employee records.
- Load an employee's onboarding steps and joining checklist.
- Mark onboarding steps and checklist items as completed.
- View onboarding progress.
- Confirm onboarding after all required tasks are complete.

### Mobile app
- Register an employee using their name and email.
- View onboarding steps and joining checklist items.
- Update task completion status and see overall progress.
- Confirm onboarding when all tasks are complete.
- Refresh saved task information when the app returns to the foreground.

## Prerequisites

Install the following before running the project:

- Java 21
- PostgreSQL
- Node.js (Node.js 20 or later is recommended for the current frontend toolchain)
- npm
- Android Studio or an Expo-compatible device/emulator for mobile testing (optional)

## Backend Setup

1. Create a PostgreSQL database named `sumpositive_onboarding`:

   ```sql
   CREATE DATABASE sumpositive_onboarding;
   ```

2. Configure the database password. The backend reads the password from the `DB_PASSWORD` environment variable. Do not commit database passwords or other secrets.

   **Windows PowerShell:**

   ```powershell
   $env:DB_PASSWORD = "your-local-postgres-password"
   ```

   Set this variable in the same terminal/session used to start the backend. In IntelliJ, add `DB_PASSWORD` to the Run Configuration environment variables.

3. Start the backend from the `backend/onboarding` directory:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   The backend runs on `http://localhost:8080`.

4. Check the health endpoint:

   ```text
   http://localhost:8080/api/health
   ```

The application configuration is in `backend/onboarding/src/main/resources/application.properties`. Hibernate is configured with `ddl-auto=update`; create the database before starting the application.

### Run backend tests

From `backend/onboarding`:

```powershell
.\mvnw.cmd test
```

The test profile uses an H2 in-memory database, so the backend tests do not require the local PostgreSQL database.

## Web Frontend Setup

Open a new terminal and run:

```powershell
cd frontend/web
npm install
npm run dev
```

Vite serves the web app at `http://localhost:5173` by default. The web app calls the backend at `http://localhost:8080/api`.

### Web quality checks

Run these commands from `frontend/web`:

```powershell
npm run lint
npm run build
```

### Playwright end-to-end tests

The Playwright tests use Chromium and expect both the backend and web development server to be running.

Install the browser once:

```powershell
npx playwright install chromium
```

Then run the tests from `frontend/web`:

```powershell
npm run test:e2e
```

The current end-to-end suite covers:
- Employee registration and completion of all onboarding steps.
- Completion of the joining checklist and final onboarding confirmation.
- Browser validation for an invalid email address.

Playwright output folders such as `test-results/` and `playwright-report/` are excluded by the web frontend's `.gitignore`.

## Mobile App Setup

Install dependencies and start Expo:

```powershell
cd frontend/mobile
npm install
npm start
```

Use the Expo terminal instructions to open the app in an Android emulator or on a supported device.

The mobile API base URL is configured in `frontend/mobile/Src/service/api.ts`:
- Android emulator: `http://10.0.2.2:8080`
- iOS simulator and web: `http://localhost:8080`
- Physical device: set `EXPO_PUBLIC_API_URL` to the backend's reachable LAN URL, for example `http://192.168.1.10:8080` (replace this example with the computer's actual LAN address).

Make sure the mobile device and computer can reach each other over the network and that the backend is running.

## API Overview

The backend API is rooted at `http://localhost:8080/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/employees` | List employees |
| POST | `/employees` | Register an employee |
| GET | `/employees/{id}` | Get an employee |
| POST | `/employees/{id}/confirm-onboarding` | Confirm completed onboarding |
| GET | `/onboarding/{employeeId}/steps` | Get onboarding steps |
| POST | `/onboarding/{employeeId}/steps` | Create onboarding steps |
| PUT | `/onboarding/steps/{stepId}?status=COMPLETED` | Update an onboarding step |
| GET | `/checklist/{employeeId}` | Get joining checklist |
| POST | `/checklist/{employeeId}` | Create joining checklist |
| PUT | `/checklist/item/{itemId}?status=COMPLETED` | Update a checklist item |

## Notes

- Start PostgreSQL before starting the backend.
- Start the backend before using the web or mobile app.
- The web app and Playwright configuration use the local development URLs shown above. Update the relevant API configuration when deploying to another environment.
- Do not commit local passwords, API keys, or other environment-specific secrets.
