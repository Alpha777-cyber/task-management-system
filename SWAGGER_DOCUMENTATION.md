# Task Management API - Swagger Documentation

## Overview

The Swagger/OpenAPI documentation has been completely revamped with professional, comprehensive specifications for your Task Management API.

## Key Improvements

### 1. **Enhanced API Information**
- ✅ Updated title to "Task Management API"
- ✅ Added detailed description
- ✅ Added contact information for API support
- ✅ Added license information
- ✅ Multiple server configurations (Development & Production)

### 2. **Comprehensive Schema Definitions**
Created reusable schemas for:
- **User Schema**: Full user model with all properties
- **UserResponse Schema**: User data without sensitive information
- **Task Schema**: Complete task model with all fields
- **SuccessResponse Schema**: Standard success response format
- **ErrorResponse Schema**: Standard error response format

### 3. **Security Configuration**
- ✅ Added Bearer Token (JWT) authentication scheme
- ✅ Documented which endpoints require authentication
- ✅ Security annotations on protected routes

### 4. **User Endpoints Documentation**

#### POST /users
- **Register a new user**
- Request: name, email, password
- Response: User data + JWT token + token expiration
- Error handling: validation errors, duplicate users

#### POST /users/login
- **User authentication**
- Request: email, password
- Response: User data + JWT token
- Error handling: invalid credentials

#### GET /users
- **List all users** (admin endpoint)
- Response: Count + array of users

#### GET /users/me
- **Get authenticated user profile**
- Security: Requires Bearer token
- Response: User profile data

#### GET /users/verify-token
- **Verify JWT token validity**
- Security: Requires Bearer token
- Response: Token validity confirmation + user data

#### GET /users/{id}
- **Get user by ID**
- Parameter: MongoDB ObjectId
- Response: User details

#### PUT /users/{id}
- **Update user information**
- Parameter: MongoDB ObjectId
- Updatable: name, email, password

#### DELETE /users/{id}
- **Delete user account**
- Parameter: MongoDB ObjectId
- Permanent deletion of user and associated data

### 5. **Task Endpoints Documentation**

#### POST /tasks
- **Create new task**
- Request: title (required), description, status, user ID
- Response: Created task object
- Validation: Title must be unique, max 100 characters

#### GET /tasks
- **List all tasks**
- Query filter: Optional user ID filter
- Response: Array of tasks

#### GET /tasks/{id}
- **Get task by ID**
- Parameter: MongoDB ObjectId
- Response: Task details

#### PUT /tasks/{id}
- **Update task**
- Parameter: MongoDB ObjectId
- Updatable: title, description, status

#### DELETE /tasks/{id}
- **Delete task**
- Parameter: MongoDB ObjectId
- Permanent deletion

#### PATCH /tasks/{id}/complete
- **Mark task as completed**
- Parameter: MongoDB ObjectId
- Sets status to "completed"

### 6. **Response Documentation**

Each endpoint includes:
- ✅ 200/201 Success responses with examples
- ✅ 400 Bad Request (validation errors)
- ✅ 401 Unauthorized (authentication issues)
- ✅ 404 Not Found
- ✅ 500 Server Error

### 7. **Request/Response Examples**

All endpoints include:
- Complete request body schemas
- Response body examples
- Proper content-type headers
- Status codes and descriptions

### 8. **API Tagging**

Organized endpoints into two main tags:
- **Users**: User authentication and profile management
- **Tasks**: Task CRUD operations

### 9. **Data Model Documentation**

#### User Model
```javascript
{
  _id: "MongoDB ObjectId",
  name: "string (unique)",
  email: "string (unique, must contain @)",
  password: "string (hashed, min 6 chars)",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### Task Model
```javascript
{
  _id: "MongoDB ObjectId",
  title: "string (unique, max 100 chars)",
  description: "string (optional)",
  status: "pending | in-progress | completed",
  user: "MongoDB ObjectId (reference)",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### 10. **Parameter Documentation**

All path and query parameters include:
- ✅ Parameter type
- ✅ Required status
- ✅ Description
- ✅ Example values

## Accessing the Documentation

1. **Start your server**: `npm start` or `node server.js`
2. **Navigate to**: `http://localhost:3000/api-docs`
3. **Interactive testing**: Try out endpoints directly from Swagger UI

## Features of the Updated Swagger

- 🎨 Professional UI with dark/light theme toggle
- 🔐 Authentication support - add Bearer token for protected routes
- 📝 Complete endpoint descriptions
- 💾 Schema reusability
- 🧪 Try-it-out functionality
- 📊 Response examples
- ✅ Status code documentation
- 🔗 Cross-references between related schemas

## Authentication Usage in Swagger

To test authenticated endpoints:

1. First, register/login to get a token via POST /users or POST /users/login
2. Copy the returned token
3. Click the "Authorize" button (lock icon)
4. Paste: `Bearer YOUR_TOKEN_HERE`
5. Try authenticated endpoints

## Best Practices Implemented

- ✅ Clear, descriptive titles and summaries
- ✅ Detailed descriptions for all operations
- ✅ Proper HTTP method usage (GET, POST, PUT, DELETE, PATCH)
- ✅ Consistent error response format
- ✅ Security scheme documentation
- ✅ Schema reusability to avoid duplication
- ✅ Example values for all parameters
- ✅ Comprehensive status code documentation
- ✅ Request/response type clarity
- ✅ Authorization requirements clearly marked

## API Health Check

Visit the root endpoint for quick reference:
- **GET /**: Returns API overview and instructions

---

**Last Updated**: January 19, 2025
**API Version**: 1.0.0
