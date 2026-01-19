const express = require('express');
const tasks = require('../models/tasks');
const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     description: Create a new task for the authenticated user with title, description, and optional status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - user
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: Complete project documentation
 *                 description: Task title (must be unique, max 100 characters)
 *               description:
 *                 type: string
 *                 example: Write comprehensive documentation for the API
 *                 description: Task description (optional, default is "remember to do this")
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 default: pending
 *                 example: pending
 *                 description: Task status
 *               user:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *                 description: MongoDB ObjectId of the task owner
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error - missing required fields, duplicate title
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', async (req, res) => {
    try {
        const task = await tasks.create(req.body);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }

});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     description: Retrieve all tasks, optionally filtered by user ID
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter tasks by user MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', async (req, res) => {
    try {
        const filter = {};

        if (req.query.user) {
            filter.user = req.query.user;
        }

        const thetasks = await tasks.find(filter);
        res.json({
            success: true,
            data: thetasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'server error'
        });
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     description: Retrieve detailed information about a specific task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Task found and returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req, res) => {
    try {
        const task = await tasks.findById(req.params.id)

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            })
        }
        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     description: Update task information including title, description, and status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task to update
 *         example: 507f1f77bcf86cd799439012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: Updated task title
 *               description:
 *                 type: string
 *                 example: Updated task description
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: in-progress
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error during update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', async (req, res) => {
    try {
        const task = await tasks.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'task not found'
            });
        }
        res.status(200).json({
            success: true,
            data: task
        })
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     description: Permanently delete a task by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task to delete
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: task deleted successfully
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', async (req, res) => {
    try {
        const task = await tasks.findByIdAndDelete(
            req.params.id
        )
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'task not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'task deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tasks/{id}/complete:
 *   patch:
 *     summary: Mark task as completed
 *     tags: [Tasks]
 *     description: Update a task's status to "completed"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task to mark as complete
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Task marked as completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/complete', async (req, res) => {
    try {
        const task = await tasks.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'task not found'
            });
        }
        res.status(200).json({
            success: true,
            data: task
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }
});

module.exports = router;