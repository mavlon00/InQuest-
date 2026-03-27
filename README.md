# InQuest Mobility Platform

Welcome to the InQuest Mobility Platform monorepo! InQuest is a comprehensive, production-ready, safety-first urban mobility ecosystem designed for modern ride-sharing, driver management, and real-time tracking.

## 🚀 Project Overview

This repository holds the entire stack for the InQuest ecosystem, divided into the following main components:

1. **InQuest-backend**: The core API server powering the entire platform.
   - **Stack**: FastAPI, PostgreSQL, SQLAlchemy 2.0, Redis, WebSockets
   - **Features**: Authentication (OTP/JWT), Ride matching, Haversine geofencing, Real-time tracking, Commission management, Paystack integration, and comprehensive Admin & Profile management.

2. **InQuest-frontend**: The cross-platform mobile applications for Passengers and Drivers.
   - **Stack**: React Native / Expo, TypeScript, Zustand, TailwindCSS/NativeWind
   - **Features**: Live map tracking, secure OTP authentication flow, real-time ride status, wallet management, emergency SOS features, and recurring subscription bookings.

## 🛠️ Prerequisites

To run this platform locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.11+)
- [PostgreSQL](https://www.postgresql.org/) (v12+)
- [Redis](https://redis.io/) (For caching, OTP throttling, and Celery tasks)

---

## 💻 Local Development Setup

### 1. Backend Setup

The backend handles all business logic, database interactions, and REST APIs.

```bash
cd InQuest-backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env to add your database connection string and API keys

# Apply database migrations
alembic upgrade head

# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> **Backend Docs:** Visit `http://localhost:8000/docs` to view the interactive Swagger API documentation.

### 2. Frontend Setup

The frontend contains the passenger and driver applications. Depending on the repository structure, they may be bundled or separated into passenger and driver workspaces.

```bash
cd InQuest-frontend

# Install dependencies
npm install
# or
yarn install

# Start the Expo development server
npx expo start
```
> **Testing:** Press `a` in the Expo terminal to run on an Android emulator, `i` for iOS simulator, or scan the QR code with the Expo Go app on your physical device.

---

## 🔒 Authentication Flow & OTPs

InQuest uses a passwordless authentication flow via OTPs (One-Time Passwords).

1. **User inputs phone number** in the app.
2. **Backend generates an OTP**, saves it in Redis (with TTL), and sends it via an SMS provider (e.g., Termii).
3. **During Local Development**: The SMS service might be disabled by default to save credits. You can always check the backend terminal logs where the generated OTP is printed in real-time.
4. **User enters the OTP**, and the backend responds with a secure JWT token pair.

---

## 🗂️ Core Architecture & Roadmap

### Functional Modules
- **Authentication**: JWT-based, secure session management.
- **Booking Engine**: On-spot matching, Scheduled rides, Recurring Commuter subscriptions.
- **Finance Module**: User Wallet, Webhooks for card top-ups, automated driver commission splitting.
- **Safety First**: Dedicated SOS emergency triggers, customizable Guardian contacts notifications.

### Getting Help
- Check `InQuest-backend/IMPLEMENTATION_SUMMARY.md` for a deeper dive into the completed backend features.
- Explore the `.env.example` files to understand configuration variables requirements.

---

**Built with ❤️ for secure and reliable urban mobility.**
