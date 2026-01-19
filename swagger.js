// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "A comprehensive task management API for creating, managing, and tracking tasks with user authentication",
      contact: {
        name: "API Support",
        email: "support@taskmanagement.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
      {
        url: "https://taskmanagement.example.com",
        description: "Production Server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
              description: "MongoDB ObjectId",
            },
            name: {
              type: "string",
              example: "John Doe",
              description: "User's full name (must be unique)",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
              description: "User's email (must be unique and contain @)",
            },
            password: {
              type: "string",
              format: "password",
              example: "securepassword123",
              description: "User's password (minimum 6 characters, hashed before storage)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-19T10:30:00Z",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-19T10:30:00Z",
              description: "Last update timestamp",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Task: {
          type: "object",
          required: ["title", "user"],
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439012",
              description: "MongoDB ObjectId",
            },
            title: {
              type: "string",
              maxLength: 100,
              example: "Complete project documentation",
              description: "Task title (must be unique, max 100 characters)",
            },
            description: {
              type: "string",
              example: "Write comprehensive documentation for the API",
              description: "Task description",
            },
            status: {
              type: "string",
              enum: ["pending", "in-progress", "completed"],
              default: "pending",
              example: "pending",
              description: "Current status of the task",
            },
            user: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
              description: "MongoDB ObjectId of the task owner",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-19T10:30:00Z",
              description: "Task creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-19T10:30:00Z",
              description: "Last update timestamp",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Error message describing what went wrong",
            },
          },
        },
      },
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
      },
    },
    tags: [
      {
        name: "Users",
        description: "User registration, authentication, and profile management",
      },
      {
        name: "Tasks",
        description: "Task creation, retrieval, update, and deletion operations",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
