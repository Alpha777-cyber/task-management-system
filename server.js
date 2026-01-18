const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API - Simple Version',
    version: '1.0.0',
    authentication: 'Send user-id in headers for protected routes',
    instructions: {
      '1. Register': 'POST /users with name, email, password',
      '2. Login': 'GET /users/login?email=...&password=... (get user-id)',
      '3. Use API': 'Include user-id in headers for all task routes'
    },
    endpoints: {
      users: {
        register: 'POST /users',
        login: 'GET /users/login?email=EMAIL&password=PASSWORD',
        myProfile: 'GET /users/me (requires auth)',
        updateProfile: 'PUT /users/me (requires auth)',
        deleteAccount: 'DELETE /users/me (requires auth)'
      },
      tasks: {
        create: 'POST /tasks (requires auth)',
        getAll: 'GET /tasks (requires auth - returns your tasks)',
        getOne: 'GET /tasks/:id (requires auth + ownership)',
        update: 'PUT /tasks/:id (requires auth + ownership)',
        delete: 'DELETE /tasks/:id (requires auth + ownership)',
        complete: 'PATCH /tasks/:id/complete (requires auth + ownership)'
      }
    }
  });
});

// Routes
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});