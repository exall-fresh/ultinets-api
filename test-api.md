# API Testing Guide

## 1. Test Public Endpoints (No Auth Required)

```bash
# Get all published services
curl http://localhost:4000/api/services

# Get specific service
curl http://localhost:4000/api/services/web-development

# Get all team members
curl http://localhost:4000/api/team

# Get all partners
curl http://localhost:4000/api/partners

# Get site settings
curl http://localhost:4000/api/settings
```

## 2. Test Authentication

### Register a new user
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ultinets.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ultinets.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "user": { "id": 1, "email": "admin@ultinets.com", "role": "admin" },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Save the `accessToken` for admin requests.

## 3. Test Admin Endpoints (Requires Auth)

Replace `YOUR_TOKEN` with the accessToken from login:

```bash
# Get all services (admin)
curl http://localhost:4000/api/admin/services \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a service
curl -X POST http://localhost:4000/api/admin/services \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "new-service",
    "serviceName": "New Service",
    "description": "Service description",
    "published": true,
    "order": 1
  }'
```

## 4. Test Contact Form

```bash
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "I am interested in your services"
  }'
```

## 5. File Upload Example

```bash
# Upload an image (replace TOKEN and /path/to/image.jpg)
curl -X POST http://localhost:4000/api/admin/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "altText=My image"
```
