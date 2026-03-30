# InQuest Mobility Service - Backend

A production-ready, safety-first urban mobility platform backend built with FastAPI, PostgreSQL, and modern Python best practices. Designed for deployment in Nigeria with comprehensive features for ride-sharing, driver management, real-time tracking, and secure payments.

## Features

- **Authentication**: JWT-based authentication with phone number and OTP verification
- **Booking System**: Three booking types - On-Spot, Personal/Scheduled, and Recurring Subscriptions
- **Real-Time Tracking**: WebSocket support for live location updates and status changes
- **IoT Integration**: MQTT support for vehicle sensor data and emergency alerts
- **Payments**: Paystack integration for secure payment processing
- **Commission Management**: Automated commission splitting based on driver package tier
- **Admin Dashboard**: Comprehensive admin endpoints for platform management
- **Geofencing**: Haversine-based geofence checks for ride matching
- **Structured Logging**: Production-ready logging with structlog and loguru
- **Security**: Rate limiting, CORS, secure JWT tokens, password hashing

## Architecture

```
InQuest-backend/
├── app/
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py          # User, OTP, authentication models
│   │   ├── ride.py          # Ride and driver models
│   │   ├── payment.py       # Payment and wallet models
│   │   └── subscription.py  # Subscription and IoT models
│   ├── routes/              # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   └── rides.py         # Ride booking endpoints (TODO)
│   ├── schemas/             # Pydantic request/response models
│   │   └── auth.py          # Authentication schemas
│   ├── services/            # Business logic layer
│   │   ├── auth_service.py  # Authentication business logic
│   │   └── ride_service.py  # Ride operations (TODO)
│   ├── utils/               # Utility functions
│   │   ├── exceptions.py    # Custom exception classes
│   │   ├── responses.py     # Standard response models
│   │   ├── validators.py    # Input validation functions
│   │   ├── security.py      # JWT and security utilities
│   │   ├── geofencing.py    # Distance and geofence calculations
│   │   ├── otp.py           # OTP generation and SMS sending
│   │   └── logging_config.py # Structured logging setup
│   └── database.py          # Database connection configuration
├── main.py                  # FastAPI application entry point
├── config.py                # Environment configuration
├── requirements.txt         # Python dependencies
├── .env                     # Development environment variables
├── .env.example             # Template for environment variables
└── README.md                # This file
```

## Setup & Installation

### Prerequisites

- Python 3.11+
- PostgreSQL 12+
- Redis (for caching and Celery)
- MQTT Broker (optional, for IoT features)

### 1. Clone Repository

```bash
git clone <repository-url>
cd InQuest-backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/inquest_db
SECRET_KEY=your-strong-random-secret-key-here
TERMII_API_KEY=your_termii_api_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 5. Setup Database

```bash
# Create PostgreSQL database and user
psql -U postgres -c "CREATE DATABASE inquest_db;"
psql -U postgres -c "CREATE USER inquest_user WITH PASSWORD 'inquest_password';"
psql -U postgres -c "ALTER ROLE inquest_user WITH CREATEDB;"
psql -U inquest_db -c "GRANT ALL PRIVILEGES ON DATABASE inquest_db TO inquest_user;"

# Run migrations (using Alembic)
alembic upgrade head
```

### 6. Run Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Access the API at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/register` | Register new user/initiate login | No |
| POST | `/login` | Login (same as register) | No |
| POST | `/verify-otp` | Verify OTP and get JWT token | No |
| POST | `/resend-otp` | Resend OTP | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/logout` | Logout (invalidate token) | Yes |

### Rides (`/api/v1/rides`) - Coming Soon

- Ride booking (on-spot, scheduled)
- Nearby vehicles search
- Ride status management
- Fare calculation

### Subscriptions (`/api/v1/subscriptions`) - Coming Soon

- Create recurring subscriptions
- Driver opt-in management
- Auto-assignment logic

### Payments (`/api/v1/payments`) - Coming Soon

- Wallet top-up
- Payment verification
- Commission splitting

### Admin (`/api/v1/admin) - Coming Soon

- Driver management
- Operations monitoring
- Revenue analytics
- Safety & disputes

## Authentication Flow

1. **User initiates login**: POST `/api/v1/auth/register` with phone number
   - Backend generates 6-digit OTP and sends via SMS
   
2. **User verifies OTP**: POST `/api/v1/auth/verify-otp` with phone and OTP
   - If valid: User created/logged in, JWT token issued
   - If invalid/expired: Error response with retry guidance
   
3. **Use JWT token**: Include in `Authorization: Bearer <token>` header for authenticated requests

## Configuration

All configuration is managed through environment variables using Pydantic settings:

### Core Settings

- `DEBUG`: Enable debug mode
- `ENVIRONMENT`: development, staging, or production
- `SECRET_KEY`: JWT signing key (must be strong in production)

### Database

- `DATABASE_URL`: PostgreSQL connection string

### SMS Provider

- `SMS_PROVIDER`: termii or twilio
- `TERMII_API_KEY`: Termii API key
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token

### External Services

- `GOOGLE_MAPS_API_KEY`: For distance/ETA calculations
- `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY`: Payment processing

### Rates & Limits

- `BASE_FARE_NGN`: Base fare in Nigerian Naira (default: 500)
- `DEAD_MILEAGE_RATE`: Per-km rate for empty kilometers
- `RATE_LIMIT_OTP`: Max OTP requests per window (default: 3)
- `GEO FENCE_RADIUS_METERS`: Geofence radius in meters (default: 500)

## Database Schema

### Core Tables

- **users**: All platform users (passengers, drivers, admins)
- **driver_profiles**: Extended driver information
- **rides**: Ride records with status tracking
- **payments**: Payment records and history
- **wallets**: User wallet balances
- **wallet_transactions**: Transaction audit trail
- **recurring_subscriptions**: Subscription records
- **iot_sensor_readings**: Vehicle sensor data
- **emergency_alerts**: SOS/emergency records
- **otps**: OTP records for verification

## Error Handling

All errors follow a consistent structure:

```json
{
  "status": "error",
  "code": "AUTH_001",
  "message": "Invalid credentials provided",
  "details": {"field": "phone_number"},
  "timestamp": "2024-01-15T10:30:00"
}
```

Common error codes:
- `AUTH_001`: Authentication failure
- `OTP_001`: OTP verification failure
- `VALIDATION_001`: Input validation error
- `GEOFENCE_001`: Geofence check failure
- `PAYMENT_001`: Payment processing error
- `INTERNAL_001`: Unexpected server error

## Security Best Practices

1. **JWT Tokens**:
   - Tokens expire after 24 hours (configurable)
   - Use HTTPS in production
   - Secure secret key management

2. **Password Security**:
   - Bcrypt hashing for sensitive data
   - No plaintext passwords stored

3. **Rate Limiting**:
   - OTP requests limited to prevent abuse
   - Login attempts throttled

4. **CORS**:
   - Whitelist allowed origins in `.env`
   - Default: localhost for development

5. **Input Validation**:
   - All inputs validated using Pydantic
   - Phone numbers normalized to international format
   - Coordinates validated for geographically plausible values

6. **Logging**:
   - Sensitive data masked in logs
   - Structured logging for audit compliance
   - Log rotation configured

## Deployment

### Development

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production

1. Set `ENVIRONMENT=production` in `.env`
2. Use strong `SECRET_KEY`
3. Set appropriate `ALLOWED_ORIGINS`

With Gunicorn:

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

With Docker:

```bash
docker build -t inquest-backend .
docker run -p 8000:8000 --env-file .env inquest-backend
```

### Database Migrations (Alembic)

```bash
# Create migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## Monitoring & Observability

### Health Checks

- `/health`: Basic liveness check
- `/ready`: Readiness check (includes dependency verification)

### Logging

Structured logging configured with:
- Log level: DEBUG (development), INFO (staging), WARNING (production)
- Outputs to stderr with JSON formatting for ELK stack integration
- Sensitive data (passwords, tokens) automatically masked

### Metrics (Coming Soon)

- Request latency
- Error rates
- Database query performance
- External API response times

## Contributing

1. Follow PEP 8 style guide
2. Add type hints to all functions
3. Write docstrings for public functions
4. Add tests for new features
5. Update .env.example for new configuration variables

## License

[Add your license here]

## Support

For issues and questions:
- GitHub Issues: [Repository Issues]
- Email: support@inquestmobility.com

## Roadmap

- [ ] Complete Ride Booking Module
- [ ] Implement Real-Time WebSocket
- [ ] Add Payments Integration
- [ ] Build Admin Dashboard
- [ ] Implement IoT Data Processing
- [ ] Add Subscription Auto-Assignment
- [ ] Performance Optimization & Caching
- [ ] API Rate Limiting Middleware
- [ ] Comprehensive Test Suite
- [ ] Docker & Kubernetes deployment configs

## Acknowledgments

Built with:
- FastAPI: Modern web framework
- SQLAlchemy: ORM for database operations
- Pydantic: Data validation and serialization
- python-jose: JWT token handling
- Structlog: Structured logging
- Loguru: Advanced logging capabilities
