# Getting Started with InQuest Backend

## 🎯 What's Ready

The InQuest backend is now **production-ready** for the following features:
- ✅ User authentication with OTP verification
- ✅ Profile management
- ✅ On-spot ride booking
- ✅ Scheduled ride requests
- ✅ Geofence-based ride eligibility
- ✅ Ride acceptance/decline flow
- ✅ Comprehensive API documentation

## 📦 Prerequisites

- Python 3.11 or higher
- PostgreSQL 12 or higher
- Redis (for caching, Docker includes this)
- Docker and Docker Compose (optional, but recommended)

## 🚀 Quick Start (Docker - Recommended)

### 1. Clone and Navigate
```bash
cd InQuest-backend
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env - at minimum set:
# - TERMII_API_KEY or SMS_PROVIDER=twilio with Twilio credentials
# - GOOGLE_MAPS_API_KEY (for distance calculations)
# - PAYSTACK_SECRET_KEY (for payments, can be test key)
```

### 3. Start Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- MQTT broker on port 1883
- FastAPI app on port 8000

### 4. Access the API
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

---

## 🛠️ Manual Setup (Without Docker)

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup PostgreSQL
```bash
# Create database and user
psql -U postgres -c "CREATE DATABASE inquest_db;"
psql -U postgres -c "CREATE USER inquest_user WITH PASSWORD 'inquest_password';"
psql -U postgres -c "ALTER ROLE inquest_user WITH CREATEDB;"
psql -U inquest_db -c "GRANT ALL PRIVILEGES ON DATABASE inquest_db TO inquest_user;"
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 5. Run Database Migrations
```bash
alembic upgrade head
```

### 6. Start Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at http://localhost:8000

---

## 📖 Testing the API

### Test Scenario: Complete Authentication Flow

#### Step 1: Register/Initiate Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+2341234567890"
  }'

# Response:
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "status": "OTP_SENT",
    "phone_number": "+2341234567890",
    "message": "OTP sent to your phone. Valid for 10 minutes."
  }
}
```

For testing without real SMS, check the logs for the generated OTP.

#### Step 2: Verify OTP
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+2341234567890",
    "otp": "123456"
  }'

# Response:
{
  "status": "success",
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": 1,
      "phone_number": "+2341234567890",
      "first_name": "",
      "last_name": "",
      "role": "Passenger",
      "is_active": true,
      "is_verified": true,
      "created_at": "2024-01-15T10:30:00",
      "last_login_at": "2024-01-15T10:30:00"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

#### Step 3: Update Profile
```bash
curl -X PUT http://localhost:8000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "photo_url": "https://example.com/photo.jpg",
    "emergency_contact": "+2341234567891"
  }'
```

#### Step 4: Request On-Spot Ride
```bash
curl -X POST http://localhost:8000/api/v1/rides/onspot/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "pickup_latitude": 6.5244,
    "pickup_longitude": 3.3792,
    "destination_latitude": 6.5300,
    "destination_longitude": 3.3850
  }'

# Response:
{
  "status": "success",
  "message": "Ride request created successfully",
  "data": {
    "ride_id": 1,
    "status": "REQUESTED",
    "estimated_fare": 2100.00,
    "distance_km": 12.5,
    "created_at": "2024-01-15T10:32:00"
  }
}
```

#### Step 5: View Nearby Drivers
```bash
curl "http://localhost:8000/api/v1/rides/nearby-vehicles?latitude=6.5244&longitude=3.3792" \
  -H "Authorization: Bearer <your_token>"
```

---

## 🧪 Using Swagger UI for Testing

The easiest way to test is through the interactive Swagger UI:

1. Open http://localhost:8000/docs
2. All endpoints are documented with examples
3. Click "Try it out" on any endpoint
4. Fill in the parameters
5. Click "Execute" to test

---

## 📊 Database Schema Overview

### Core Tables
- **users**: All platform users with roles
- **driver_profiles**: Extended driver information
- **rides**: Ride records with full status tracking
- **payments**: Payment records and commission tracking
- **wallets**: User wallet balances
- **wallet_transactions**: Transaction/audit trail
- **recurring_subscriptions**: Subscription records
- **iot_sensor_readings**: Vehicle sensor data
- **emergency_alerts**: SOS/emergency records
- **otps**: OTP records for verification

---

## 🔧 Configuration Guide

### Environment Variables (Key Settings)

```env
# SMS Configuration
SMS_PROVIDER=termii                    # or 'twilio'
TERMII_API_KEY=your_api_key           # If using Termii
TWILIO_ACCOUNT_SID=your_sid           # If using Twilio
TWILIO_AUTH_TOKEN=your_token          # If using Twilio
TWILIO_PHONE_NUMBER=+1234567890       # If using Twilio

# Geofencing
GEOFENCE_RADIUS_METERS=500            # On-spot booking radius

# Fare Calculation
BASE_FARE_NGN=500                     # Base fare in Naira
DEAD_MILEAGE_RATE=50                  # Per-km rate
WAITING_TIME_RATE=100                 # Per-minute rate

# Rate Limiting
RATE_LIMIT_OTP=3                      # Max OTP requests per window
RATE_LIMIT_LOGIN=5                    # Max login attempts per window
RATE_LIMIT_WINDOW_SECONDS=3600        # Time window

# Commission
COMMISSION_BASIC=0.20                 # Basic tier: 20%
COMMISSION_STANDARD=0.30              # Standard tier: 30%
COMMISSION_PREMIUM=0.45               # Premium tier: 45%
```

---

## 📝 API Endpoint Overview

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/register` | No | Initiate registration with phone |
| POST | `/login` | No | Login (same as register) |
| POST | `/verify-otp` | No | Verify OTP and get JWT |
| POST | `/resend-otp` | No | Resend OTP |
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile |
| POST | `/logout` | Yes | Logout |

### Rides (`/api/v1/rides`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/nearby-vehicles` | Yes | Find nearby drivers |
| POST | `/onspot/book` | Yes | Create on-spot ride |
| POST | `/personal/create` | Yes | Create scheduled ride |
| PUT | `/{ride_id}/accept` | Yes | Accept ride (driver) |
| PUT | `/{ride_id}/decline` | Yes | Decline ride (driver) |
| GET | `/{ride_id}` | Yes | Get ride details |
| POST | `/{ride_id}/fare` | Yes | Calculate fare breakdown |

---

## 🐛 Troubleshooting

### OTP Not Sent
- Check SMS provider credentials in `.env`
- View logs: `docker-compose logs backend`
- Ensure SMS_PROVIDER is set correctly

### Database Connection Error
```
Error: (psycopg2.OperationalError) could not connect to server
```
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Confirm password and credentials

### CORS Errors
- Add frontend URL to `ALLOWED_ORIGINS` in `.env`
- Format: `["http://localhost:3000", "https://yourdomain.com"]`

### Token Expired
- HTTP 401 when token is old
- Generate new token by running authentication flow again

---

## 📚 Documentation Files

- **README.md** - Comprehensive project documentation
- **IMPLEMENTATION_SUMMARY.md** - What's completed and what's next
- **This file** - Quick start and testing guide

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `ENVIRONMENT=production`
- [ ] Use HTTPS URLs only
- [ ] Configure database backups
- [ ] Set up monitoring and alerts
- [ ] Enable database query logging
- [ ] Review CORS settings
- [ ] Implement rate limiting middleware
- [ ] Set up log aggregation
- [ ] Conduct security audit

---

## 📞 Support

For issues or questions:

1. Check the logs: `docker-compose logs backend`
2. Review the API documentation at `/docs`
3. Check configuration in `.env`
4. Verify database connectivity

---

## 🎓 Next Steps

1. **Test Current Features** - Complete the test scenario above
2. **Implement Subscriptions** - Recurring trip bookings with auto-assignment
3. **Add Payments** - Paystack integration and commission splitting
4. **Real-Time Updates** - WebSocket for live location tracking
5. **Admin Dashboard** - Management and analytics endpoints

---

**Happy coding! 🚀**

For detailed architecture and implementation details, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).
