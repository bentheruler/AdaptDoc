# AdoptDoc Frontend - Authentication Module

## Completed Features
- ✅ User Registration
- ✅ User Login
- ✅ JWT Token Management
- ✅ Protected Routes
- ✅ Logout Functionality
- ✅ Dashboard Layout

## API Integration Notes
The frontend expects the following backend endpoints:

### POST /api/register
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}