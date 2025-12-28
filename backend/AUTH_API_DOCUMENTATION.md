# Authentication API Documentation

This document describes the secure authentication system with Spring Boot + H2 database.

## Features

- ✅ User signup with name, email, phone, password (role=USER by default)
- ✅ Duplicate email/phone validation
- ✅ BCrypt password hashing
- ✅ Email + password login for USERS
- ✅ OTP-based admin login via SMTP (no password)
- ✅ OTP expires in 5 minutes
- ✅ OTPs stored in database temporarily
- ✅ JWT token generation on successful authentication
- ✅ H2 console enabled for debugging

## API Endpoints

### 1. User Signup
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": 1
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 2. User Login
**POST** `/api/auth/login-user`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "John Doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "",
    "phoneNumber": "+1234567890",
    "role": "USER",
    "trustScore": 100.0,
    "verified": false,
    "totalReports": 0,
    "verifiedReports": 0
  }
}
```

### 3. Admin OTP Request
**POST** `/api/auth/login-admin-otp`

**Request Body:**
```json
{
  "email": "admin@sensesafe.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to registered email address"
}
```

### 4. Admin OTP Verification
**POST** `/api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "admin@sensesafe.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@sensesafe.com",
    "firstName": "System",
    "lastName": "Administrator",
    "phoneNumber": "+1-555-ADMIN",
    "role": "ADMIN",
    "trustScore": 100.0,
    "verified": true,
    "totalReports": 0,
    "verifiedReports": 0
  }
}
```

### 5. Token Validation
**POST** `/api/auth/validate-token`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

## Database Access

### H2 Console
- **URL:** `http://localhost:8080/api/h2-console`
- **JDBC URL:** `jdbc:h2:mem:sensesafe`
- **Username:** `sa`
- **Password:** `password`

### Database Tables

#### Users Table
- Stores user information with BCrypt hashed passwords
- Unique constraints on email and phone number
- Role field (USER, ADMIN, VOLUNTEER)

#### OTP Tokens Table
- Temporary storage for OTP codes
- 5-minute expiration
- Automatic cleanup of expired tokens

## Default Test Accounts

### Admin Account
- **Email:** `admin@sensesafe.com`
- **Login Method:** OTP only (no password)

### User Accounts
- **Email:** `john@example.com` / **Password:** `password123`
- **Email:** `jane@example.com` / **Password:** `password123`

## Security Features

1. **Password Hashing:** BCrypt with salt
2. **JWT Tokens:** Secure token-based authentication
3. **OTP Security:** 6-digit codes with 5-minute expiration
4. **Email Validation:** Proper email format validation
5. **Phone Validation:** Unique phone number constraint
6. **Role-based Access:** Different login methods for users vs admins
7. **CORS Configuration:** Configured for frontend integration

## Error Handling

Common error responses:
- `400 Bad Request`: Invalid input data or validation errors
- `401 Unauthorized`: Invalid credentials or expired tokens
- `409 Conflict`: Duplicate email/phone during signup

## Usage Examples

### cURL Examples

**User Signup:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "testpassword123"
  }'
```

**User Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Admin OTP Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login-admin-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sensesafe.com"
  }'
```

**Admin OTP Verification:**
```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sensesafe.com",
    "otp": "123456"
  }'
```

## Notes

- OTP codes are automatically cleaned up every hour
- JWT tokens include user ID, role, and email in claims
- All passwords are hashed using BCrypt before storage
- Admin users cannot login with password - OTP only
- Regular users cannot use OTP login - password only
- Phone numbers must be unique across all users
- Email addresses must be unique across all users